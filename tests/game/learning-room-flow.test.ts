import { describe, it, expect, beforeEach } from 'vitest';
import { SaveManager } from '@/game/progression/SaveManager';
import { ProgressionService } from '@/game/progression/ProgressionService';
import { getLevelById, getLevelByGlobalIndex } from '@/game/content/levels';
import { GameProgress } from '@/game/types/progression';

describe('Avyakta 3-Task Learning Room & Progression Workflow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes room with all 3 tasks incomplete for an unattempted level', () => {
    const progress = SaveManager.loadProgress();
    const room = SaveManager.getRoomProgress('1.1', progress);

    expect(room.levelId).toBe('1.1');
    expect(room.tasks.reading).toBe(false);
    expect(room.tasks.understanding).toBe(false);
    expect(room.tasks.challenge).toBe(false);
    expect((room.tasks as unknown as Record<string, unknown>).simulation).toBeUndefined();
    expect(room.completed).toBe(false);
  });

  it('migrates legacy 4-task save data into clean 3-task rooms', () => {
    // Simulate legacy v1 save data with 4 tasks including simulation
    const legacySave: Partial<GameProgress> = {
      version: 1,
      highestCompletedIndex: 2,
      completedLevelIds: ['1.1', '1.2'],
      totalXP: 50,
      awardedRewardIds: ['level:1.1:complete', 'level:1.2:complete'],
      roomProgress: {
        '1.1': {
          levelId: '1.1',
          tasks: { reading: true, understanding: true, simulation: true, challenge: true } as any,
          completed: true,
          completedAt: '1700000000'
        },
        '1.3': {
          levelId: '1.3',
          tasks: { reading: true, understanding: false, simulation: false, challenge: false } as any,
          completed: false
        }
      }
    };
    localStorage.setItem('avyakta_game_save_v1', JSON.stringify(legacySave));

    const loaded = SaveManager.loadProgress();
    expect(loaded.version).toBe(2);

    const room1 = SaveManager.getRoomProgress('1.1', loaded);
    const room2 = SaveManager.getRoomProgress('1.2', loaded);
    const room3 = SaveManager.getRoomProgress('1.3', loaded);

    // Completed rooms have all 3 tasks complete and simulation stripped
    expect(room1.completed).toBe(true);
    expect(room1.tasks.reading).toBe(true);
    expect(room1.tasks.understanding).toBe(true);
    expect(room1.tasks.challenge).toBe(true);
    expect((room1.tasks as unknown as Record<string, unknown>).simulation).toBeUndefined();

    expect(room2.completed).toBe(true);
    expect(room2.tasks.reading).toBe(true);
    expect(room2.tasks.understanding).toBe(true);
    expect(room2.tasks.challenge).toBe(true);

    // In-progress room keeps reading: true, understanding: false, challenge: false
    expect(room3.completed).toBe(false);
    expect(room3.tasks.reading).toBe(true);
    expect(room3.tasks.understanding).toBe(false);
    expect(room3.tasks.challenge).toBe(false);
    expect((room3.tasks as unknown as Record<string, unknown>).simulation).toBeUndefined();
  });

  it('updates task progress sequentially: Task 1 -> Task 2 -> Task 3 -> Complete', () => {
    let progress = SaveManager.loadProgress();

    // Step 1: Complete Task 1 (Read the Shloka)
    progress = ProgressionService.updateRoomTask('1.1', 'reading', true, progress);
    let room = SaveManager.getRoomProgress('1.1', progress);
    expect(room.tasks.reading).toBe(true);
    expect(room.tasks.understanding).toBe(false);
    expect(room.tasks.challenge).toBe(false);
    expect(room.completed).toBe(false);

    // Step 2: Complete Task 2 (Understand the Teaching)
    progress = ProgressionService.updateRoomTask('1.1', 'understanding', true, progress);
    room = SaveManager.getRoomProgress('1.1', progress);
    expect(room.tasks.reading).toBe(true);
    expect(room.tasks.understanding).toBe(true);
    expect(room.tasks.challenge).toBe(false);
    expect(room.completed).toBe(false);

    // Step 3: Complete Task 3 (Knowledge Challenge) via completeLevel
    const level = getLevelById('1.1')!;
    const completion = ProgressionService.completeLevel(level, 100, progress);

    expect(completion.success).toBe(true);
    expect(completion.xpEarned).toBeGreaterThan(0);
    expect(completion.updatedProgress.completedLevelIds).toContain('1.1');
    expect(completion.updatedProgress.highestCompletedIndex).toBe(1);

    const finalizedRoom = SaveManager.getRoomProgress('1.1', completion.updatedProgress);
    expect(finalizedRoom.completed).toBe(true);
    expect(finalizedRoom.tasks.reading).toBe(true);
    expect(finalizedRoom.tasks.understanding).toBe(true);
    expect(finalizedRoom.tasks.challenge).toBe(true);
    expect((finalizedRoom.tasks as unknown as Record<string, unknown>).simulation).toBeUndefined();
  });

  it('strictly unlocks Level N+1 sequentially across verse and chapter transitions', () => {
    let progress = SaveManager.loadProgress();

    // 1.1 is unlocked by default
    expect(ProgressionService.isLevelUnlocked('1.1', progress)).toBe(true);
    expect(ProgressionService.isLevelUnlocked('1.2', progress)).toBe(false);

    // Complete 1.1 -> Unlocks 1.2
    const lvl1_1 = getLevelById('1.1')!;
    const res1 = ProgressionService.completeLevel(lvl1_1, 100, progress);
    expect(ProgressionService.isLevelUnlocked('1.2', res1.updatedProgress)).toBe(true);
    expect(ProgressionService.isLevelUnlocked('1.3', res1.updatedProgress)).toBe(false);

    // Transition 1.47 -> 2.1
    // Simulate player completing all of chapter 1 (47 levels)
    const chap1CompleteProgress: GameProgress = {
      ...res1.updatedProgress,
      highestCompletedIndex: 47,
      completedLevelIds: Array.from({ length: 47 }, (_, i) => `1.${i + 1}`)
    };
    expect(ProgressionService.isLevelUnlocked('2.1', chap1CompleteProgress)).toBe(true);
    expect(ProgressionService.isLevelUnlocked('2.2', chap1CompleteProgress)).toBe(false);

    // Transition 2.72 -> 3.1
    // Chapter 2 has 72 verses, total global index = 47 + 72 = 119
    const chap2CompleteProgress: GameProgress = {
      ...chap1CompleteProgress,
      highestCompletedIndex: 119
    };
    expect(ProgressionService.isLevelUnlocked('3.1', chap2CompleteProgress)).toBe(true);
    expect(ProgressionService.isLevelUnlocked('3.2', chap2CompleteProgress)).toBe(false);

    // Transition 18.77 -> 18.78
    // Total verses up to 18.77 is 699
    const nearEndProgress: GameProgress = {
      ...chap2CompleteProgress,
      highestCompletedIndex: 699
    };
    expect(ProgressionService.isLevelUnlocked('18.78', nearEndProgress)).toBe(true);

    // 18.78 completion triggers gameCompleted: true
    const finalLevel = getLevelById('18.78')!;
    const finalResult = ProgressionService.completeLevel(finalLevel, 100, nearEndProgress);
    expect(finalResult.success).toBe(true);
    expect(finalResult.gameCompleted).toBe(true);
    expect(finalResult.updatedProgress.gameCompleted).toBe(true);
  });

  it('prevents duplicate XP awards on replaying completed levels', () => {
    const progress = SaveManager.loadProgress();
    const lvl1 = getLevelById('1.1')!;

    // First completion awards XP
    const res1 = ProgressionService.completeLevel(lvl1, 100, progress);
    expect(res1.isFirstCompletion).toBe(true);
    expect(res1.xpEarned).toBe(lvl1.xpReward + 5);

    // Replaying does not award duplicate XP
    const res2 = ProgressionService.completeLevel(lvl1, 100, res1.updatedProgress);
    expect(res2.isFirstCompletion).toBe(false);
    expect(res2.xpEarned).toBe(0);
    expect(res2.updatedProgress.totalXP).toBe(res1.updatedProgress.totalXP);
  });
});
