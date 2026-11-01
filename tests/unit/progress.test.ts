import { describe, it, expect } from "vitest";
import {
  calculateOverallProgress,
  calculateChapterProgress,
  calculateAllChaptersProgress,
  isValidVerseId,
  parseVerseId,
} from "@/lib/progress";

describe("22.3 Reading Progress Calculation Tests", () => {
  it("validates correct and incorrect verse IDs", () => {
    expect(isValidVerseId("1.1")).toBe(true);
    expect(isValidVerseId("2.47")).toBe(true);
    expect(isValidVerseId("18.78")).toBe(true);

    expect(isValidVerseId("0.1")).toBe(false);
    expect(isValidVerseId("19.1")).toBe(false);
    expect(isValidVerseId("1.48")).toBe(false); // ch 1 only has 47 verses
    expect(isValidVerseId("invalid")).toBe(false);
  });

  it("parses valid verse IDs into chapter and verse numbers", () => {
    expect(parseVerseId("2.47")).toEqual({ chapter: 2, verse: 47 });
    expect(parseVerseId("18.66")).toEqual({ chapter: 18, verse: 66 });
    expect(parseVerseId("invalid")).toBeNull();
  });

  it("computes zero progress accurately for a new reader", () => {
    const overall = calculateOverallProgress([]);
    expect(overall.totalVerses).toBe(700);
    expect(overall.completedCount).toBe(0);
    expect(overall.remainingCount).toBe(700);
    expect(overall.percentage).toBe(0);
    expect(overall.completedChaptersCount).toBe(0);
    expect(overall.inProgressChaptersCount).toBe(0);
    expect(overall.notStartedChaptersCount).toBe(18);
  });

  it("prevents duplicate verses from inflating progress", () => {
    // 3 duplicate IDs of 1.1
    const overall = calculateOverallProgress(["1.1", "1.1", "1.1", "2.47"]);
    expect(overall.completedCount).toBe(2);
    expect(overall.percentage).toBe(Number(((2 / 700) * 100).toFixed(2)));
  });

  it("filters out invalid verse IDs automatically", () => {
    const overall = calculateOverallProgress(["1.1", "99.99", "invalid"]);
    expect(overall.completedCount).toBe(1);
  });

  it("calculates chapter progress correctly", () => {
    // Chapter 1 has 47 verses
    const ch1 = calculateChapterProgress(1, ["1.1", "1.2"]);
    expect(ch1.totalVerses).toBe(47);
    expect(ch1.completedCount).toBe(2);
    expect(ch1.isStarted).toBe(true);
    expect(ch1.isCompleted).toBe(false);
    expect(ch1.percentage).toBe(Number(((2 / 47) * 100).toFixed(2)));
  });

  it("marks chapter as completed when all its verses are read", () => {
    // Chapter 12 has 20 verses (12.1 to 12.20)
    const ch12Verses = Array.from({ length: 20 }, (_, i) => `12.${i + 1}`);
    const ch12 = calculateChapterProgress(12, ch12Verses);
    expect(ch12.isCompleted).toBe(true);
    expect(ch12.completedCount).toBe(20);
    expect(ch12.percentage).toBe(100);

    const overall = calculateOverallProgress(ch12Verses);
    expect(overall.completedChaptersCount).toBe(1);
  });

  it("calculates all 18 chapters progress list", () => {
    const all = calculateAllChaptersProgress(["1.1"]);
    expect(all).toHaveLength(18);
    expect(all[0].completedCount).toBe(1);
    expect(all[1].completedCount).toBe(0);
  });
});
