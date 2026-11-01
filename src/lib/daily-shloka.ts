import { getAllVerses } from "./gita-data";
import { Verse } from "@/types/gita";

/**
 * Deterministically computes a daily shloka for a given date.
 * Uses the day, month, and year with a hash distribution across all 700 verses.
 */
export function getDailyShloka(date: Date = new Date()): Verse {
  const verses = getAllVerses();
  if (verses.length === 0) {
    throw new Error("No verses found in dataset");
  }

  // Consistent calendar date string (YYYY-MM-DD)
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();

  // Simple deterministic integer hash
  const daysSinceEpoch = Math.floor(
    (Date.UTC(year, month - 1, day) - Date.UTC(2020, 0, 1)) / (1000 * 60 * 60 * 24)
  );

  // Modulo over all 700 verses
  const index = Math.abs(daysSinceEpoch) % verses.length;
  return verses[index];
}
