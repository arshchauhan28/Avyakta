import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager, SAVE_STORAGE_KEY, INITIAL_GAME_PROGRESS } from '@/game/progression/SaveManager';
import { GameProgress } from '@/game/types/progression';

describe('SaveManager — LocalStorage Persistence & Version Migration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads INITIAL_GAME_PROGRESS when no previous save exists', () => {
    const progress = SaveManager.loadProgress();
    expect(progress.highestCompletedIndex).toBe(0);
    expect(progress.completedLevelIds).toEqual([]);
    expect(progress.totalXP).toBe(0);
    expect(progress.gameCompleted).toBe(false);
    expect(progress.version).toBe(2);
  });

  it('persists progress correctly to localStorage under SAVE_STORAGE_KEY', () => {
    const sampleProgress: GameProgress = {
      ...INITIAL_GAME_PROGRESS,
      highestCompletedIndex: 12,
      completedLevelIds: ['1.1', '1.2'],
      totalXP: 140,
      currentLevelId: '1.3'
    };

    SaveManager.saveProgress(sampleProgress);

    const stored = localStorage.getItem(SAVE_STORAGE_KEY);
    expect(stored).not.toBeNull();
    const parsed = JSON.parse(stored!);
    expect(parsed.highestCompletedIndex).toBe(12);
    expect(parsed.totalXP).toBe(140);
    expect(parsed.version).toBe(2);

    const loaded = SaveManager.loadProgress();
    expect(loaded.highestCompletedIndex).toBe(12);
    expect(loaded.totalXP).toBe(140);
  });

  it('migrates legacy v1 save data (with 4 tasks) to v2 save data (with 3 tasks)', () => {
    const legacyV1Save = {
      version: 1,
      highestCompletedIndex: 5,
      currentLevelId: '1.6',
      completedLevelIds: ['1.1', '1.2', '1.3', '1.4', '1.5'],
      totalXP: 250,
      unlockedAchievementIds: ['first_shloka'],
      awardedRewardIds: ['level:1.1:complete'],
      gameCompleted: false,
      settings: {
        graphicsQuality: 'high',
        cameraSensitivity: 1.5,
        use2DMode: false,
        theme: 'dark'
      },
      roomProgress: {
        '1.1': {
          levelId: '1.1',
          tasks: { reading: true, understanding: true, simulation: true, challenge: true },
          completed: true
        },
        '1.6': {
          levelId: '1.6',
          tasks: { reading: true, understanding: false, simulation: false, challenge: false },
          completed: false
        }
      }
    };

    localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(legacyV1Save));

    const migrated = SaveManager.loadProgress();
    expect(migrated.version).toBe(2);
    expect(migrated.highestCompletedIndex).toBe(5);
    expect(migrated.completedLevelIds).toHaveLength(5);
    expect(migrated.totalXP).toBe(250);
    expect(migrated.unlockedAchievementIds).toContain('first_shloka');
    expect(migrated.currentLevelId).toBe('1.6');

    // Verify 3 tasks in migrated room progress
    const room1 = migrated.roomProgress!['1.1'];
    expect(room1.completed).toBe(true);
    expect(room1.tasks.reading).toBe(true);
    expect(room1.tasks.understanding).toBe(true);
    expect(room1.tasks.challenge).toBe(true);
    expect((room1.tasks as unknown as Record<string, unknown>).simulation).toBeUndefined();

    const room6 = migrated.roomProgress!['1.6'];
    expect(room6.completed).toBe(false);
    expect(room6.tasks.reading).toBe(true);
    expect(room6.tasks.understanding).toBe(false);
    expect(room6.tasks.challenge).toBe(false);
    expect((room6.tasks as unknown as Record<string, unknown>).simulation).toBeUndefined();

    // Verify settings stripped obsolete 3D properties
    expect((migrated.settings as unknown as Record<string, unknown>).graphicsQuality).toBeUndefined();
    expect((migrated.settings as unknown as Record<string, unknown>).cameraSensitivity).toBeUndefined();
  });

  it('exports and imports save strings accurately', () => {
    const sampleProgress: GameProgress = {
      ...INITIAL_GAME_PROGRESS,
      highestCompletedIndex: 47,
      completedLevelIds: ['1.1'],
      totalXP: 500,
      currentLevelId: '2.1'
    };

    SaveManager.saveProgress(sampleProgress);
    const exportCode = SaveManager.exportSave();
    expect(typeof exportCode).toBe('string');
    expect(exportCode.length).toBeGreaterThan(10);

    // Clear and import
    localStorage.clear();
    const importRes = SaveManager.importSave(exportCode);
    expect(importRes.success).toBe(true);
    expect(importRes.progress?.highestCompletedIndex).toBe(47);
    expect(importRes.progress?.totalXP).toBe(500);
  });

  it('gracefully handles corrupt save data without crashing', () => {
    localStorage.setItem(SAVE_STORAGE_KEY, '{corrupt_json: invalid');
    const progress = SaveManager.loadProgress();
    expect(progress.highestCompletedIndex).toBe(0);
    expect(progress.version).toBe(2);
  });
});
