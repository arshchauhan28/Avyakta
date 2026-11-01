"use client";

import { useReadingContext } from "@/providers/ReadingProvider";

export function useReaderPreferences() {
  try {
    return useReadingContext();
  } catch {
    return {
      isHydrated: true,
      theme: "dark" as const,
      setTheme: () => {},
      language: "sanskrit" as const,
      setLanguage: () => {},
      fontSize: "md" as const,
      setFontSize: () => {},
      increaseFontSize: () => {},
      decreaseFontSize: () => {},
      showTransliteration: true,
      toggleTransliteration: () => {},
      showWordMeanings: false,
      toggleWordMeanings: () => {},
    };
  }
}
