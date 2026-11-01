import { GameProgress, GameSettings } from '../types/progression';

export const SAVE_STORAGE_KEY = 'avyakta_game_save_v1';
export const CURRENT_SAVE_VERSION = 2;

export const DEFAULT_SETTINGS: GameSettings = {
  masterVolume: 80,
  musicVolume: 60,
  ambientVolume: 70,
  sfxVolume: 80,
  recitationVolume: 90,
  showSubtitles: true,
  language: 'en'
};

export const INITIAL_GAME_PROGRESS: GameProgress = {
  version: CURRENT_SAVE_VERSION,
  highestCompletedIndex: 0, // 0 = only Level 1 is unlocked initially
  completedLevelIds: [],
  awardedRewardIds: [],
  totalXP: 0,
  currentLevelId: '1.1',
  unlockedAchievementIds: [],
  gameCompleted: false,
  lastPlayedAt: new Date().toISOString(),
  chapterCompletionDates: {},
  settings: DEFAULT_SETTINGS,
  rooms: {}
};

export class SaveManager {
  private static isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
  }

  static loadProgress(): GameProgress {
    if (!this.isBrowser()) {
      return { ...INITIAL_GAME_PROGRESS };
    }

    try {
      const data = localStorage.getItem(SAVE_STORAGE_KEY);
      if (!data) {
        return { ...INITIAL_GAME_PROGRESS };
      }

      const parsed = JSON.parse(data);
      const validated = this.migrateAndValidate(parsed);
      if (!parsed.version || parsed.version < CURRENT_SAVE_VERSION) {
        this.saveProgress(validated);
      }
      return validated;
    } catch (err) {
      console.warn('Failed to load game progress from localStorage, using initial progress:', err);
      return { ...INITIAL_GAME_PROGRESS };
    }
  }

  static saveProgress(progress: GameProgress): void {
    if (!this.isBrowser()) return;

    try {
      const payload: GameProgress = {
        ...progress,
        lastPlayedAt: new Date().toISOString()
      };
      localStorage.setItem(SAVE_STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to save game progress:', err);
    }
  }

  static resetProgress(): GameProgress {
    if (!this.isBrowser()) return { ...INITIAL_GAME_PROGRESS };

    try {
      localStorage.removeItem(SAVE_STORAGE_KEY);
    } catch (err) {
      console.error('Failed to clear save:', err);
    }
    return { ...INITIAL_GAME_PROGRESS };
  }

  static exportSave(): string {
    const progress = this.loadProgress();
    return btoa(JSON.stringify(progress));
  }

  static importSave(encodedData: string): { success: boolean; progress?: GameProgress; error?: string } {
    try {
      const decoded = atob(encodedData.trim());
      const parsed = JSON.parse(decoded);
      const validated = this.migrateAndValidate(parsed);
      this.saveProgress(validated);
      return { success: true, progress: validated };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid save file format';
      return { success: false, error: message };
    }
  }

  static createDefaultProgress(): GameProgress {
    return { ...INITIAL_GAME_PROGRESS };
  }

  static cloudToGameProgress(
    cloud: {
      currentLevelId?: string;
      completedLevels?: string[];
      totalXP?: number;
      achievements?: string[];
      levelProgress?: Record<string, string[]>;
      updatedAt?: string;
    },
    localFallback?: GameProgress
  ): GameProgress {
    const completedLevels = Array.isArray(cloud.completedLevels) ? cloud.completedLevels : [];

    let highestIndex = 0;
    const starts: Record<number, number> = {
      1: 1, 2: 48, 3: 120, 4: 163, 5: 205, 6: 234, 7: 281, 8: 311, 9: 339,
      10: 373, 11: 415, 12: 470, 13: 490, 14: 524, 15: 551, 16: 571, 17: 595, 18: 623
    };

    for (const lvl of completedLevels) {
      try {
        const parts = lvl.split('.');
        const ch = parseInt(parts[0], 10);
        const v = parseInt(parts[1], 10);
        if (!isNaN(ch) && !isNaN(v)) {
          const g = (starts[ch] || 1) + (v - 1);
          if (g > highestIndex) highestIndex = g;
        }
      } catch {
        // Ignore
      }
    }

    const rooms: Record<string, import('../types/progression').RoomProgress> = {};
    if (cloud.levelProgress && typeof cloud.levelProgress === 'object') {
      for (const [lvlId, tasks] of Object.entries(cloud.levelProgress)) {
        const taskList = Array.isArray(tasks) ? tasks : [];
        const reading = taskList.includes('task1');
        const understanding = taskList.includes('task2');
        const challenge = taskList.includes('task3');
        rooms[lvlId] = {
          levelId: lvlId,
          tasks: { reading, understanding, challenge },
          completed: completedLevels.includes(lvlId) || (reading && understanding && challenge)
        };
      }
    }

    for (const lvlId of completedLevels) {
      if (!rooms[lvlId]) {
        rooms[lvlId] = {
          levelId: lvlId,
          tasks: { reading: true, understanding: true, challenge: true },
          completed: true
        };
      }
    }

    const currentLvl = cloud.currentLevelId || (highestIndex >= 700 ? '18.78' : '1.1');
    const totalXP = typeof cloud.totalXP === 'number' ? cloud.totalXP : 0;
    const achievements = Array.isArray(cloud.achievements) ? cloud.achievements : [];
    const isCompleted = highestIndex >= 700;

    return {
      version: CURRENT_SAVE_VERSION,
      highestCompletedIndex: highestIndex,
      completedLevelIds: completedLevels,
      awardedRewardIds: completedLevels.map((id) => `level:${id}:complete`),
      totalXP,
      currentLevelId: currentLvl,
      unlockedAchievementIds: achievements,
      gameCompleted: isCompleted,
      lastPlayedAt: cloud.updatedAt || new Date().toISOString(),
      chapterCompletionDates: localFallback?.chapterCompletionDates || {},
      settings: localFallback?.settings || DEFAULT_SETTINGS,
      rooms,
      roomProgress: rooms
    };
  }

  private static migrateAndValidate(raw: Partial<GameProgress>): GameProgress {
    const version = typeof raw.version === 'number' ? raw.version : CURRENT_SAVE_VERSION;
    const highest = typeof raw.highestCompletedIndex === 'number' ? Math.max(0, Math.min(700, raw.highestCompletedIndex)) : 0;
    const completedLevels = Array.isArray(raw.completedLevelIds) ? raw.completedLevelIds : [];
    const rewards = Array.isArray(raw.awardedRewardIds) ? raw.awardedRewardIds : [];
    const xp = typeof raw.totalXP === 'number' ? Math.max(0, raw.totalXP) : 0;
    const currentLvl = typeof raw.currentLevelId === 'string' && raw.currentLevelId ? raw.currentLevelId : '1.1';
    const achievements = Array.isArray(raw.unlockedAchievementIds) ? raw.unlockedAchievementIds : [];
    const isCompleted = Boolean(raw.gameCompleted || highest >= 700);

    const rawSettings = (raw.settings || {}) as Record<string, unknown>;
    const mergedSettings: GameSettings = {
      masterVolume: typeof rawSettings.masterVolume === 'number' ? rawSettings.masterVolume : DEFAULT_SETTINGS.masterVolume,
      musicVolume: typeof rawSettings.musicVolume === 'number' ? rawSettings.musicVolume : DEFAULT_SETTINGS.musicVolume,
      ambientVolume: typeof rawSettings.ambientVolume === 'number' ? rawSettings.ambientVolume : DEFAULT_SETTINGS.ambientVolume,
      sfxVolume: typeof rawSettings.sfxVolume === 'number' ? rawSettings.sfxVolume : DEFAULT_SETTINGS.sfxVolume,
      recitationVolume: typeof rawSettings.recitationVolume === 'number' ? rawSettings.recitationVolume : DEFAULT_SETTINGS.recitationVolume,
      showSubtitles: typeof rawSettings.showSubtitles === 'boolean' ? Boolean(rawSettings.showSubtitles) : DEFAULT_SETTINGS.showSubtitles,
      language: rawSettings.language === 'hi' ? 'hi' : 'en'
    };

    // Migrate and validate room progress
    const rooms: Record<string, import('../types/progression').RoomProgress> = {};
    const rawRooms = (raw.rooms || (raw as Record<string, unknown>).roomProgress) as Record<string, import('../types/progression').RoomProgress> | undefined;
    if (rawRooms && typeof rawRooms === 'object') {
      for (const [k, v] of Object.entries(rawRooms)) {
        if (v && typeof v === 'object' && v.tasks) {
          const reading = Boolean(v.tasks.reading);
          const understanding = Boolean(v.tasks.understanding);
          const challenge = Boolean(v.tasks.challenge);
          const isAllDone = reading && understanding && challenge;

          rooms[k] = {
            levelId: v.levelId || k,
            tasks: {
              reading,
              understanding,
              challenge
            },
            completed: Boolean(v.completed || isAllDone),
            completedAt: v.completedAt
          };
        }
      }
    }

    // Ensure all previously completed levels have all 3 tasks marked completed
    for (const lvlId of completedLevels) {
      if (!rooms[lvlId] || !rooms[lvlId].completed) {
        rooms[lvlId] = {
          levelId: lvlId,
          tasks: { reading: true, understanding: true, challenge: true },
          completed: true
        };
      }
    }

    return {
      version: CURRENT_SAVE_VERSION,
      highestCompletedIndex: highest,
      completedLevelIds: completedLevels,
      awardedRewardIds: rewards,
      totalXP: xp,
      currentLevelId: currentLvl,
      unlockedAchievementIds: achievements,
      gameCompleted: isCompleted,
      completedAt: raw.completedAt,
      lastPlayedAt: raw.lastPlayedAt || new Date().toISOString(),
      chapterCompletionDates: raw.chapterCompletionDates || {},
      settings: mergedSettings,
      rooms,
      roomProgress: rooms
    };
  }

  static getRoomProgress(levelId: string, progress: GameProgress): import('../types/progression').RoomProgress {
    const existing = (progress.rooms && progress.rooms[levelId]) || (progress.roomProgress && progress.roomProgress[levelId]);
    if (existing) {
      return existing;
    }
    const isCompleted = progress.completedLevelIds.includes(levelId);
    return {
      levelId,
      tasks: {
        reading: isCompleted,
        understanding: isCompleted,
        challenge: isCompleted
      },
      completed: isCompleted
    };
  }
}
