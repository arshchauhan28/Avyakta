import { describe, it, expect } from "vitest";
import { getDailyShloka } from "@/lib/daily-shloka";
import { isValidVerseId } from "@/lib/progress";
import {
  loadPreferences,
  savePreferences,
  loadReadingState,
  saveReadingState,
  DEFAULT_PREFERENCES,
} from "@/lib/storage";

describe("22.7 Daily Shloka Determinism Tests", () => {
  it("returns identical verse for the same date", () => {
    const d1 = new Date(2026, 4, 15);
    const d2 = new Date(2026, 4, 15);

    const verse1 = getDailyShloka(d1);
    const verse2 = getDailyShloka(d2);

    expect(verse1.id).toBe(verse2.id);
    expect(verse1.sanskrit).toBe(verse2.sanskrit);
  });

  it("returns valid verse existing in dataset", () => {
    const verse = getDailyShloka(new Date());
    expect(isValidVerseId(verse.id)).toBe(true);
    expect(verse.sanskrit).toBeTruthy();
    expect(verse.chapter).toBeGreaterThanOrEqual(1);
    expect(verse.chapter).toBeLessThanOrEqual(18);
  });

  it("updates selected verse across different days", () => {
    const d1 = new Date(2026, 0, 1);
    const d2 = new Date(2026, 0, 2);

    const v1 = getDailyShloka(d1);
    const v2 = getDailyShloka(d2);

    expect(v1.id).not.toBe(v2.id);
  });
});

describe("22.6 Storage & Preferences Tests", () => {
  it("loads default preferences when storage is empty", () => {
    const prefs = loadPreferences();
    expect(prefs.theme).toBe(DEFAULT_PREFERENCES.theme);
    expect(prefs.language).toBe(DEFAULT_PREFERENCES.language);
    expect(prefs.fontSize).toBe(DEFAULT_PREFERENCES.fontSize);
  });

  it("persists and restores updated preferences", () => {
    savePreferences({
      theme: "parchment",
      language: "en",
      fontSize: 24,
      showTransliteration: false,
      showWordMeanings: false,
    });

    const restored = loadPreferences();
    expect(restored.theme).toBe("parchment");
    expect(restored.language).toBe("en");
    expect(restored.fontSize).toBe(24);
    expect(restored.showTransliteration).toBe(false);
  });

  it("persists reading state defensively", () => {
    saveReadingState({
      version: 1,
      completedVerses: ["1.1", "2.47"],
      bookmarks: ["2.47"],
      lastRead: { chapter: 2, verse: 47 },
      recentVerses: ["2.47", "1.1"],
    });

    const state = loadReadingState();
    expect(state.completedVerses).toContain("1.1");
    expect(state.completedVerses).toContain("2.47");
    expect(state.bookmarks).toContain("2.47");
    expect(state.lastRead).toEqual({ chapter: 2, verse: 47 });
  });
});
