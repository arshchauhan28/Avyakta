import { ReadingState } from "@/types/progress";
import { ReaderPreferences } from "@/types/preferences";
import { isValidVerseId } from "./progress";

export const STORAGE_VERSION = 1;

export const STORAGE_KEYS = {
  READING_STATE: "gita_reading_state_v1",
  PREFERENCES: "gita_reader_preferences_v1",
} as const;

export const DEFAULT_PREFERENCES: ReaderPreferences = {
  theme: "light",
  language: "en",
  fontSize: 20,
  showTransliteration: true,
  showWordMeanings: true,
};

export const DEFAULT_READING_STATE: ReadingState = {
  version: STORAGE_VERSION,
  completedVerses: [],
  bookmarks: [],
  lastRead: null,
  recentVerses: [],
};

function isClient(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadReadingState(): ReadingState {
  if (!isClient()) return DEFAULT_READING_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.READING_STATE);
    if (!raw) return DEFAULT_READING_STATE;
    const parsed = JSON.parse(raw);

    // Validate fields defensively
    const completedVerses: string[] = Array.isArray(parsed.completedVerses)
      ? Array.from<string>(
          new Set<string>(
            parsed.completedVerses.filter(
              (id: unknown): id is string => typeof id === "string" && isValidVerseId(id)
            )
          )
        )
      : [];

    const bookmarks: string[] = Array.isArray(parsed.bookmarks)
      ? Array.from<string>(
          new Set<string>(
            parsed.bookmarks.filter(
              (id: unknown): id is string => typeof id === "string" && isValidVerseId(id)
            )
          )
        )
      : [];

    const recentVerses: string[] = Array.isArray(parsed.recentVerses)
      ? Array.from<string>(
          new Set<string>(
            parsed.recentVerses.filter(
              (id: unknown): id is string => typeof id === "string" && isValidVerseId(id)
            )
          )
        ).slice(0, 20)
      : [];

    const lastRead =
      parsed.lastRead &&
      typeof parsed.lastRead.chapter === "number" &&
      typeof parsed.lastRead.verse === "number" &&
      isValidVerseId(`${parsed.lastRead.chapter}.${parsed.lastRead.verse}`)
        ? { chapter: parsed.lastRead.chapter, verse: parsed.lastRead.verse }
        : null;

    return {
      version: STORAGE_VERSION,
      completedVerses,
      bookmarks,
      lastRead,
      recentVerses,
    };
  } catch (err) {
    console.warn("Failed to load reading state from LocalStorage, returning defaults", err);
    return DEFAULT_READING_STATE;
  }
}

export function saveReadingState(state: ReadingState): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.READING_STATE, JSON.stringify(state));
  } catch (err) {
    console.warn("Failed to save reading state to LocalStorage", err);
  }
}

export function loadPreferences(): ReaderPreferences {
  if (!isClient()) return DEFAULT_PREFERENCES;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    if (!raw) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(raw);

    return {
      theme: ["light", "dark", "parchment"].includes(parsed.theme) ? parsed.theme : DEFAULT_PREFERENCES.theme,
      language: ["hi", "en"].includes(parsed.language) ? parsed.language : DEFAULT_PREFERENCES.language,
      fontSize: typeof parsed.fontSize === "number" && parsed.fontSize >= 14 && parsed.fontSize <= 36 ? parsed.fontSize : DEFAULT_PREFERENCES.fontSize,
      showTransliteration: typeof parsed.showTransliteration === "boolean" ? parsed.showTransliteration : DEFAULT_PREFERENCES.showTransliteration,
      showWordMeanings: typeof parsed.showWordMeanings === "boolean" ? parsed.showWordMeanings : DEFAULT_PREFERENCES.showWordMeanings,
    };
  } catch (err) {
    console.warn("Failed to load preferences from LocalStorage, returning defaults", err);
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: ReaderPreferences): void {
  if (!isClient()) return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(prefs));
  } catch (err) {
    console.warn("Failed to save preferences to LocalStorage", err);
  }
}
