import chaptersData from "@/data/chapters.json";
import sourcesData from "@/data/sources.json";
import { Chapter, Verse, GitaSourceMetadata } from "@/types/gita";

import ch01 from "@/data/verses/chapter-01.json";
import ch02 from "@/data/verses/chapter-02.json";
import ch03 from "@/data/verses/chapter-03.json";
import ch04 from "@/data/verses/chapter-04.json";
import ch05 from "@/data/verses/chapter-05.json";
import ch06 from "@/data/verses/chapter-06.json";
import ch07 from "@/data/verses/chapter-07.json";
import ch08 from "@/data/verses/chapter-08.json";
import ch09 from "@/data/verses/chapter-09.json";
import ch10 from "@/data/verses/chapter-10.json";
import ch11 from "@/data/verses/chapter-11.json";
import ch12 from "@/data/verses/chapter-12.json";
import ch13 from "@/data/verses/chapter-13.json";
import ch14 from "@/data/verses/chapter-14.json";
import ch15 from "@/data/verses/chapter-15.json";
import ch16 from "@/data/verses/chapter-16.json";
import ch17 from "@/data/verses/chapter-17.json";
import ch18 from "@/data/verses/chapter-18.json";

const CHAPTER_VERSES_MAP: Record<number, Verse[]> = {
  1: ch01 as Verse[],
  2: ch02 as Verse[],
  3: ch03 as Verse[],
  4: ch04 as Verse[],
  5: ch05 as Verse[],
  6: ch06 as Verse[],
  7: ch07 as Verse[],
  8: ch08 as Verse[],
  9: ch09 as Verse[],
  10: ch10 as Verse[],
  11: ch11 as Verse[],
  12: ch12 as Verse[],
  13: ch13 as Verse[],
  14: ch14 as Verse[],
  15: ch15 as Verse[],
  16: ch16 as Verse[],
  17: ch17 as Verse[],
  18: ch18 as Verse[],
};

export function getAllChapters(): Chapter[] {
  return chaptersData as Chapter[];
}

export function getChapter(chapterNumber: number): Chapter | undefined {
  if (chapterNumber < 1 || chapterNumber > 18) return undefined;
  return (chaptersData as Chapter[]).find((c) => c.number === chapterNumber);
}

export function getChapterVerses(chapterNumber: number): Verse[] {
  return CHAPTER_VERSES_MAP[chapterNumber] || [];
}

export function getVerse(chapterNumber: number, verseNumber: number): Verse | undefined {
  const chapter = getChapter(chapterNumber);
  if (!chapter) return undefined;
  if (verseNumber < 1 || verseNumber > chapter.verseCount) return undefined;

  const verses = getChapterVerses(chapterNumber);
  return verses.find((v) => v.verse === verseNumber);
}

export function getAllVerses(): Verse[] {
  const all: Verse[] = [];
  for (let ch = 1; ch <= 18; ch++) {
    all.push(...getChapterVerses(ch));
  }
  return all;
}

export function getPreviousVerse(
  chapterNumber: number,
  verseNumber: number
): { chapter: number; verse: number } | null {
  // If at 1.1, there is no previous verse
  if (chapterNumber <= 1 && verseNumber <= 1) {
    return null;
  }

  // If inside current chapter
  if (verseNumber > 1) {
    return { chapter: chapterNumber, verse: verseNumber - 1 };
  }

  // Cross backward to previous chapter's last verse
  const prevChapter = getChapter(chapterNumber - 1);
  if (!prevChapter) return null;

  return { chapter: chapterNumber - 1, verse: prevChapter.verseCount };
}

export function getNextVerse(
  chapterNumber: number,
  verseNumber: number
): { chapter: number; verse: number } | null {
  const currentChapter = getChapter(chapterNumber);
  if (!currentChapter) return null;

  // At 18.78 (final verse of Gita), no next verse
  if (chapterNumber >= 18 && verseNumber >= currentChapter.verseCount) {
    return null;
  }

  // Inside current chapter
  if (verseNumber < currentChapter.verseCount) {
    return { chapter: chapterNumber, verse: verseNumber + 1 };
  }

  // Cross forward to next chapter's first verse
  if (chapterNumber < 18) {
    return { chapter: chapterNumber + 1, verse: 1 };
  }

  return null;
}

export function getSourcesMetadata(): GitaSourceMetadata {
  return sourcesData as GitaSourceMetadata;
}
