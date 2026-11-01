export interface LastReadLocation {
  chapter: number;
  verse: number;
}

export interface ReadingState {
  version: number;
  completedVerses: string[]; // ["1.1", "2.47"]
  bookmarks: string[]; // ["2.47", "18.66"]
  lastRead: LastReadLocation | null;
  recentVerses: string[]; // max 20, deduplicated ["2.47", "3.21"]
}

export interface ChapterProgressInfo {
  chapterNumber: number;
  nameSanskrit: string;
  nameEnglish: string;
  totalVerses: number;
  completedCount: number;
  percentage: number;
  isCompleted: boolean;
  isStarted: boolean;
}

export interface OverallProgressInfo {
  totalVerses: number;
  completedCount: number;
  remainingCount: number;
  percentage: number;
  completedChaptersCount: number;
  inProgressChaptersCount: number;
  notStartedChaptersCount: number;
}
