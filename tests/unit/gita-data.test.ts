import { describe, it, expect } from "vitest";
import {
  getAllChapters,
  getChapter,
  getChapterVerses,
  getVerse,
  getAllVerses,
  getPreviousVerse,
  getNextVerse,
  getSourcesMetadata,
} from "@/lib/gita-data";

describe("22.1 Dataset Verification Tests", () => {
  it("contains exactly 18 chapters", () => {
    const chapters = getAllChapters();
    expect(chapters).toHaveLength(18);
    for (let i = 1; i <= 18; i++) {
      expect(chapters.some((c) => c.number === i)).toBe(true);
    }
  });

  it("contains exactly 700 distinct verses", () => {
    const allVerses = getAllVerses();
    expect(allVerses).toHaveLength(700);

    const ids = new Set(allVerses.map((v) => v.id));
    expect(ids.size).toBe(700);
  });

  it("matches traditional chapter verse distributions exactly", () => {
    const expectedCounts: Record<number, number> = {
      1: 47, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47,
      7: 30, 8: 28, 9: 34, 10: 42, 11: 55, 12: 20,
      13: 34, 14: 27, 15: 20, 16: 24, 17: 28, 18: 78,
    };

    for (let ch = 1; ch <= 18; ch++) {
      const verses = getChapterVerses(ch);
      expect(verses.length).toBe(expectedCounts[ch]);
      const chapterMeta = getChapter(ch);
      expect(chapterMeta?.verseCount).toBe(expectedCounts[ch]);
    }
  });

  it("contains authentic Sanskrit Devanagari text in every verse", () => {
    const allVerses = getAllVerses();
    for (const v of allVerses) {
      expect(v.sanskrit.trim().length).toBeGreaterThan(5);
      expect(/[\u0900-\u097F]/.test(v.sanskrit)).toBe(true);
      expect(v.sanskrit).not.toContain("Lorem ipsum");
      expect(v.sanskrit).not.toContain("TODO");
    }
  });

  it("has valid transliteration and translations", () => {
    const allVerses = getAllVerses();
    for (const v of allVerses) {
      expect(v.transliteration).toBeDefined();
      expect(v.transliteration!.length).toBeGreaterThan(0);
      expect(v.translations.hindi?.text || v.translations.english?.text).toBeTruthy();
    }
  });

  it("has valid source metadata and license attribution", () => {
    const meta = getSourcesMetadata();
    expect(meta.totalChapters).toBe(18);
    expect(meta.totalVerses).toBe(700);
    expect(meta.license).toContain("Unlicense");
    expect(meta.commentatorsAndTranslators.length).toBeGreaterThan(0);
  });
});

describe("22.2 Navigation Tests", () => {
  it("first verse (1.1) has no previous verse, and next is 1.2", () => {
    const prev = getPreviousVerse(1, 1);
    expect(prev).toBeNull();

    const next = getNextVerse(1, 1);
    expect(next).toEqual({ chapter: 1, verse: 2 });
  });

  it("last verse of chapter 1 (1.47) transitions to chapter 2 verse 1 (2.1)", () => {
    const next = getNextVerse(1, 47);
    expect(next).toEqual({ chapter: 2, verse: 1 });
  });

  it("first verse of chapter 2 (2.1) transitions back to chapter 1 verse 47 (1.47)", () => {
    const prev = getPreviousVerse(2, 1);
    expect(prev).toEqual({ chapter: 1, verse: 47 });
  });

  it("last verse of Gita (18.78) has no next verse, and previous is 18.77", () => {
    const next = getNextVerse(18, 78);
    expect(next).toBeNull();

    const prev = getPreviousVerse(18, 78);
    expect(prev).toEqual({ chapter: 18, verse: 77 });
  });

  it("retrieves valid verses by chapter and verse", () => {
    const v2_47 = getVerse(2, 47);
    expect(v2_47).toBeDefined();
    expect(v2_47?.sanskrit).toContain("कर्मण्येवाधिकारस्ते");

    const v18_66 = getVerse(18, 66);
    expect(v18_66).toBeDefined();
    expect(v18_66?.sanskrit).toContain("सर्वधर्मान्परित्यज्य");
  });

  it("returns undefined for out-of-range chapters or verses", () => {
    expect(getVerse(0, 1)).toBeUndefined();
    expect(getVerse(19, 1)).toBeUndefined();
    expect(getVerse(1, 48)).toBeUndefined();
    expect(getVerse(2, 73)).toBeUndefined();
  });
});
