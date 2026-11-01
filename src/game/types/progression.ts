export interface Achievement {
  id: string;
  title: string;
  titleHindi: string;
  description: string;
  descriptionHindi?: string;
  icon: string;
  category: "chapter" | "mastery" | "streak" | "special";
  unlockedAt?: string; // ISO date
  requiredLevelId?: string;
  requiredCompletedCount?: number;
}

export interface LearnerRank {
  tier: number;
  title: string;
  titleSanskrit: string;
  minXP: number;
  badge: string;
}

export interface GameSettings {
  masterVolume: number; // 0 to 100
  musicVolume: number;
  ambientVolume: number;
  sfxVolume: number;
  recitationVolume: number;
  showSubtitles: boolean;
  language: "hi" | "en";
}

export interface RoomTasks {
  reading: boolean;
  understanding: boolean;
  challenge: boolean;
}

export interface RoomProgress {
  levelId: string;
  tasks: RoomTasks;
  completed: boolean;
  completedAt?: string;
}

export interface GameProgress {
  version: number;
  highestCompletedIndex: number; // 0 to 700 (0 means only level 1 is unlocked)
  completedLevelIds: string[]; // ["1.1", "1.2"]
  awardedRewardIds: string[]; // deterministic e.g. "level:1.1:complete"
  totalXP: number;
  currentLevelId: string; // "1.1" by default
  unlockedAchievementIds: string[];
  gameCompleted: boolean;
  completedAt?: string;
  lastPlayedAt: string;
  chapterCompletionDates: Record<number, string>;
  settings: GameSettings;
  rooms?: Record<string, RoomProgress>;
  roomProgress?: Record<string, RoomProgress>;
}
