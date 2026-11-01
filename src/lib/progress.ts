import { getAllChapters, getChapter } from "./gita-data";
import { ChapterProgressInfo, OverallProgressInfo } from "@/types/progress";

export const TOTAL_GITA_VERSES = 700;

export function isValidVerseId(id: string): boolean {
  if (!id || typeof id !== "string") return false;
  const match = id.match(/^(\d{1,2})\.(\d{1,3})$/);
  if (!match) return false;
  const chapter = parseInt(match[1], 10);
  const verse = parseInt(match[2], 10);
  const ch = getChapter(chapter);
  if (!ch) return false;
  return verse >= 1 && verse <= ch.verseCount;
}

export function parseVerseId(id: string): { chapter: number; verse: number } | null {
  if (!isValidVerseId(id)) return null;
  const [ch, v] = id.split(".").map((n) => parseInt(n, 10));
  return { chapter: ch, verse: v };
}

export function sanitizeCompletedVerses(ids: string[]): string[] {
  if (!Array.isArray(ids)) return [];
  const set = new Set<string>();
  for (const id of ids) {
    if (isValidVerseId(id)) {
      set.add(id);
    }
  }
  return Array.from(set);
}

export function calculateChapterProgress(
  chapterNumber: number,
  completedVerses: string[]
): ChapterProgressInfo {
  const chapter = getChapter(chapterNumber);
  if (!chapter) {
    return {
      chapterNumber,
      nameSanskrit: "",
      nameEnglish: "",
      totalVerses: 0,
      completedCount: 0,
      percentage: 0,
      isCompleted: false,
      isStarted: false,
    };
  }

  const validIds = sanitizeCompletedVerses(completedVerses);
  const prefix = `${chapterNumber}.`;
  const completedInChapter = validIds.filter((id) => id.startsWith(prefix)).length;
  const percentage =
    chapter.verseCount > 0
      ? Number(((completedInChapter / chapter.verseCount) * 100).toFixed(2))
      : 0;

  return {
    chapterNumber,
    nameSanskrit: chapter.nameSanskrit,
    nameEnglish: chapter.nameEnglish,
    totalVerses: chapter.verseCount,
    completedCount: completedInChapter,
    percentage,
    isCompleted: completedInChapter === chapter.verseCount && chapter.verseCount > 0,
    isStarted: completedInChapter > 0,
  };
}

export function calculateAllChaptersProgress(completedVerses: string[]): ChapterProgressInfo[] {
  const chapters = getAllChapters();
  return chapters.map((ch) => calculateChapterProgress(ch.number, completedVerses));
}

export function calculateOverallProgress(completedVerses: string[]): OverallProgressInfo {
  const validIds = sanitizeCompletedVerses(completedVerses);
  const completedCount = validIds.length;
  const remainingCount = Math.max(0, TOTAL_GITA_VERSES - completedCount);
  const percentage = Number(((completedCount / TOTAL_GITA_VERSES) * 100).toFixed(2));

  const chaptersProgress = calculateAllChaptersProgress(validIds);
  const completedChaptersCount = chaptersProgress.filter((c) => c.isCompleted).length;
  const inProgressChaptersCount = chaptersProgress.filter((c) => c.isStarted && !c.isCompleted).length;
  const notStartedChaptersCount = chaptersProgress.filter((c) => !c.isStarted).length;

  return {
    totalVerses: TOTAL_GITA_VERSES,
    completedCount,
    remainingCount,
    percentage,
    completedChaptersCount,
    inProgressChaptersCount,
    notStartedChaptersCount,
  };
}
