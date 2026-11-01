"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { ReadingState } from "@/types/progress";
import { ReaderPreferences, AppTheme, TranslationLanguage } from "@/types/preferences";
import {
  loadReadingState,
  saveReadingState,
  loadPreferences,
  savePreferences,
  DEFAULT_PREFERENCES,
  DEFAULT_READING_STATE,
} from "@/lib/storage";
import { isValidVerseId } from "@/lib/progress";

interface ReadingContextValue {
  isHydrated: boolean;
  // Progress & Bookmarks
  completedVerses: string[];
  bookmarks: string[];
  lastRead: { chapter: number; verse: number } | null;
  recentVerses: string[];
  markAsRead: (verseId: string) => void;
  markAsUnread: (verseId: string) => void;
  toggleRead: (verseId: string) => void;
  isRead: (verseId: string) => boolean;
  toggleBookmark: (verseId: string) => void;
  isBookmarked: (verseId: string) => boolean;
  recordVisit: (chapter: number, verse: number) => void;
  resetReadingProgress: () => void;
  clearBookmarks: () => void;
  // Preferences
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  language: TranslationLanguage;
  setLanguage: (lang: TranslationLanguage) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  showTransliteration: boolean;
  toggleTransliteration: () => void;
  showWordMeanings: boolean;
  toggleWordMeanings: () => void;
}

const ReadingContext = createContext<ReadingContextValue | null>(null);

export function ReadingProvider({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);
  const [readingState, setReadingState] = useState<ReadingState>(DEFAULT_READING_STATE);
  const [preferences, setPreferences] = useState<ReaderPreferences>(DEFAULT_PREFERENCES);

  // Load state and preferences on mount (client-only)
  useEffect(() => {
    const loadedState = loadReadingState();
    const loadedPrefs = loadPreferences();
    setReadingState(loadedState);
    setPreferences(loadedPrefs);
    setIsHydrated(true);

    // Apply theme attribute to documentElement
    document.documentElement.setAttribute("data-theme", loadedPrefs.theme);
  }, []);

  // Update data-theme attribute whenever theme changes
  useEffect(() => {
    if (isHydrated) {
      document.documentElement.setAttribute("data-theme", preferences.theme);
      savePreferences(preferences);
    }
  }, [preferences, isHydrated]);

  // Persist reading state whenever it updates
  useEffect(() => {
    if (isHydrated) {
      saveReadingState(readingState);
    }
  }, [readingState, isHydrated]);

  const markAsRead = useCallback((verseId: string) => {
    if (!isValidVerseId(verseId)) return;
    setReadingState((prev) => {
      if (prev.completedVerses.includes(verseId)) return prev;
      return {
        ...prev,
        completedVerses: [...prev.completedVerses, verseId],
      };
    });
  }, []);

  const markAsUnread = useCallback((verseId: string) => {
    setReadingState((prev) => ({
      ...prev,
      completedVerses: prev.completedVerses.filter((id) => id !== verseId),
    }));
  }, []);

  const toggleRead = useCallback((verseId: string) => {
    if (!isValidVerseId(verseId)) return;
    setReadingState((prev) => {
      const exists = prev.completedVerses.includes(verseId);
      return {
        ...prev,
        completedVerses: exists
          ? prev.completedVerses.filter((id) => id !== verseId)
          : [...prev.completedVerses, verseId],
      };
    });
  }, []);

  const isRead = useCallback(
    (verseId: string) => readingState.completedVerses.includes(verseId),
    [readingState.completedVerses]
  );

  const toggleBookmark = useCallback((verseId: string) => {
    if (!isValidVerseId(verseId)) return;
    setReadingState((prev) => {
      const exists = prev.bookmarks.includes(verseId);
      return {
        ...prev,
        bookmarks: exists
          ? prev.bookmarks.filter((id) => id !== verseId)
          : [...prev.bookmarks, verseId],
      };
    });
  }, []);

  const isBookmarked = useCallback(
    (verseId: string) => readingState.bookmarks.includes(verseId),
    [readingState.bookmarks]
  );

  const recordVisit = useCallback((chapter: number, verse: number) => {
    const verseId = `${chapter}.${verse}`;
    if (!isValidVerseId(verseId)) return;

    setReadingState((prev) => {
      const newRecent = [verseId, ...prev.recentVerses.filter((id) => id !== verseId)].slice(0, 20);
      return {
        ...prev,
        lastRead: { chapter, verse },
        recentVerses: newRecent,
      };
    });
  }, []);

  const resetReadingProgress = useCallback(() => {
    setReadingState((prev) => ({
      ...prev,
      completedVerses: [],
      // Bookmarks are preserved!
    }));
  }, []);

  const clearBookmarks = useCallback(() => {
    setReadingState((prev) => ({
      ...prev,
      bookmarks: [],
    }));
  }, []);

  // Preference handlers
  const setTheme = useCallback((theme: AppTheme) => {
    setPreferences((prev) => ({ ...prev, theme }));
  }, []);

  const setLanguage = useCallback((language: TranslationLanguage) => {
    setPreferences((prev) => ({ ...prev, language }));
  }, []);

  const setFontSize = useCallback((fontSize: number) => {
    setPreferences((prev) => ({
      ...prev,
      fontSize: Math.min(36, Math.max(14, fontSize)),
    }));
  }, []);

  const increaseFontSize = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      fontSize: Math.min(32, prev.fontSize + 2),
    }));
  }, []);

  const decreaseFontSize = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      fontSize: Math.max(16, prev.fontSize - 2),
    }));
  }, []);

  const toggleTransliteration = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      showTransliteration: !prev.showTransliteration,
    }));
  }, []);

  const toggleWordMeanings = useCallback(() => {
    setPreferences((prev) => ({
      ...prev,
      showWordMeanings: !prev.showWordMeanings,
    }));
  }, []);

  const contextValue = useMemo<ReadingContextValue>(
    () => ({
      isHydrated,
      completedVerses: readingState.completedVerses,
      bookmarks: readingState.bookmarks,
      lastRead: readingState.lastRead,
      recentVerses: readingState.recentVerses,
      markAsRead,
      markAsUnread,
      toggleRead,
      isRead,
      toggleBookmark,
      isBookmarked,
      recordVisit,
      resetReadingProgress,
      clearBookmarks,
      theme: preferences.theme,
      setTheme,
      language: preferences.language,
      setLanguage,
      fontSize: preferences.fontSize,
      setFontSize,
      increaseFontSize,
      decreaseFontSize,
      showTransliteration: preferences.showTransliteration,
      toggleTransliteration,
      showWordMeanings: preferences.showWordMeanings,
      toggleWordMeanings,
    }),
    [
      isHydrated,
      readingState,
      preferences,
      markAsRead,
      markAsUnread,
      toggleRead,
      isRead,
      toggleBookmark,
      isBookmarked,
      recordVisit,
      resetReadingProgress,
      clearBookmarks,
      setTheme,
      setLanguage,
      setFontSize,
      increaseFontSize,
      decreaseFontSize,
      toggleTransliteration,
      toggleWordMeanings,
    ]
  );

  return <ReadingContext.Provider value={contextValue}>{children}</ReadingContext.Provider>;
}

export function useReadingContext() {
  const context = useContext(ReadingContext);
  if (!context) {
    throw new Error("useReadingContext must be used within a ReadingProvider");
  }
  return context;
}
