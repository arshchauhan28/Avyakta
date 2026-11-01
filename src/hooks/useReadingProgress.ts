"use client";

import { useReadingContext } from "@/providers/ReadingProvider";
import {
  calculateOverallProgress,
  calculateChapterProgress,
  calculateAllChaptersProgress,
} from "@/lib/progress";

export function useReadingProgress() {
  const {
    isHydrated,
    completedVerses,
    lastRead,
    recentVerses,
    markAsRead,
    markAsUnread,
    toggleRead,
    isRead,
    recordVisit,
    resetReadingProgress,
  } = useReadingContext();

  const overallProgress = calculateOverallProgress(completedVerses);

  return {
    isHydrated,
    completedVerses,
    lastRead,
    recentVerses,
    overallProgress,
    markAsRead,
    markAsUnread,
    toggleRead,
    isRead,
    recordVisit,
    resetReadingProgress,
    getChapterProgress: (chNumber: number) => calculateChapterProgress(chNumber, completedVerses),
    getAllChaptersProgress: () => calculateAllChaptersProgress(completedVerses),
  };
}
