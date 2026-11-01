import fs from "fs";
import path from "path";

const EXPECTED_CHAPTER_COUNTS: Record<number, number> = {
  1: 47,
  2: 72,
  3: 43,
  4: 42,
  5: 29,
  6: 47,
  7: 30,
  8: 28,
  9: 34,
  10: 42,
  11: 55,
  12: 20,
  13: 34,
  14: 27,
  15: 20,
  16: 24,
  17: 28,
  18: 78,
};

const TOTAL_EXPECTED_VERSES = 700;

interface Chapter {
  number: number;
  nameSanskrit: string;
  nameTransliterated: string;
  nameEnglish: string;
  verseCount: number;
  description: string;
}

interface Verse {
  id: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration?: string;
  translations: {
    hindi?: { text: string; language: string; author?: string };
    english?: { text: string; language: string; author?: string };
  };
  wordMeanings?: Array<{ word: string; meaningEnglish?: string; meaningHindi?: string }>;
  audioSrc?: string;
}

function runValidation() {
  console.log("=== Running Bhagavad Gita Dataset Validation ===");
  const dataDir = path.resolve(process.cwd(), "src/data");
  const chaptersFile = path.join(dataDir, "chapters.json");
  const versesDir = path.join(dataDir, "verses");
  const sourcesFile = path.join(dataDir, "sources.json");
  const audioManifestFile = path.join(dataDir, "audio-manifest.json");

  const errors: string[] = [];

  // 1. Check sources.json
  if (!fs.existsSync(sourcesFile)) {
    errors.push("Missing src/data/sources.json");
  } else {
    try {
      const sources = JSON.parse(fs.readFileSync(sourcesFile, "utf-8"));
      if (!sources.edition || !sources.repository || !sources.license) {
        errors.push("sources.json is missing required attribution or license fields");
      }
    } catch {
      errors.push("sources.json contains invalid JSON");
    }
  }

  // 2. Check chapters.json
  if (!fs.existsSync(chaptersFile)) {
    errors.push("Missing src/data/chapters.json");
    console.error("Critical error: chapters.json not found");
    process.exit(1);
  }

  let chapters: Chapter[] = [];
  try {
    chapters = JSON.parse(fs.readFileSync(chaptersFile, "utf-8"));
  } catch {
    errors.push("chapters.json contains invalid JSON");
  }

  if (chapters.length !== 18) {
    errors.push(`Expected exactly 18 chapters, found ${chapters.length}`);
  }

  // Verify each chapter matches expected number and verse count
  for (let chNum = 1; chNum <= 18; chNum++) {
    const ch = chapters.find((c) => c.number === chNum);
    if (!ch) {
      errors.push(`Chapter ${chNum} is missing in chapters.json`);
      continue;
    }
    const expectedCount = EXPECTED_CHAPTER_COUNTS[chNum];
    if (ch.verseCount !== expectedCount) {
      errors.push(
        `Chapter ${chNum} reported verse count (${ch.verseCount}) does not match expected (${expectedCount})`
      );
    }
    if (!ch.nameSanskrit || !ch.nameSanskrit.trim()) {
      errors.push(`Chapter ${chNum} missing Sanskrit name`);
    }
    if (!ch.nameEnglish || !ch.nameEnglish.trim()) {
      errors.push(`Chapter ${chNum} missing English name`);
    }
    if (!ch.description || !ch.description.trim()) {
      errors.push(`Chapter ${chNum} missing description`);
    }
  }

  // 3. Verify verses files
  if (!fs.existsSync(versesDir)) {
    errors.push("Missing src/data/verses directory");
    console.error("Critical error: verses directory not found");
    process.exit(1);
  }

  const verseIds = new Set<string>();
  let totalVerses = 0;

  for (let chNum = 1; chNum <= 18; chNum++) {
    const fileName = `chapter-${String(chNum).padStart(2, "0")}.json`;
    const filePath = path.join(versesDir, fileName);

    if (!fs.existsSync(filePath)) {
      errors.push(`Missing verse file for chapter ${chNum}: ${fileName}`);
      continue;
    }

    let verses: Verse[] = [];
    try {
      verses = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    } catch {
      errors.push(`Invalid JSON in ${fileName}`);
      continue;
    }

    const expectedCount = EXPECTED_CHAPTER_COUNTS[chNum];
    if (verses.length !== expectedCount) {
      errors.push(
        `Chapter ${chNum} file contains ${verses.length} verses, expected ${expectedCount}`
      );
    }

    // Validate each verse
    for (let vIdx = 0; vIdx < verses.length; vIdx++) {
      const v = verses[vIdx];
      const expectedVerseNumber = vIdx + 1;
      const expectedId = `${chNum}.${expectedVerseNumber}`;

      if (v.id !== expectedId) {
        errors.push(`Verse ID mismatch in ch ${chNum}: expected ${expectedId}, got ${v.id}`);
      }

      if (verseIds.has(v.id)) {
        errors.push(`Duplicate verse ID found: ${v.id}`);
      }
      verseIds.add(v.id);
      totalVerses++;

      if (v.chapter !== chNum) {
        errors.push(`Verse ${v.id} has incorrect chapter number ${v.chapter}`);
      }

      if (v.verse !== expectedVerseNumber) {
        errors.push(`Verse ${v.id} has incorrect verse number ${v.verse}`);
      }

      // Sanskrit validation
      if (!v.sanskrit || !v.sanskrit.trim()) {
        errors.push(`Verse ${v.id} has empty Sanskrit text`);
      } else if (v.sanskrit.includes("Lorem ipsum") || v.sanskrit.includes("TODO")) {
        errors.push(`Verse ${v.id} contains placeholder text in Sanskrit`);
      }

      // Check Unicode / Devanagari range
      const hasDevanagari = /[\u0900-\u097F]/.test(v.sanskrit);
      if (!hasDevanagari) {
        errors.push(`Verse ${v.id} Sanskrit does not contain valid Devanagari Unicode characters`);
      }

      // Transliteration
      if (!v.transliteration || !v.transliteration.trim()) {
        errors.push(`Verse ${v.id} missing transliteration`);
      }

      // Translations
      if (!v.translations || (!v.translations.hindi && !v.translations.english)) {
        errors.push(`Verse ${v.id} has neither Hindi nor English translation`);
      }

      if (v.translations.hindi && !v.translations.hindi.text.trim()) {
        errors.push(`Verse ${v.id} Hindi translation text is blank`);
      }
      if (v.translations.english && !v.translations.english.text.trim()) {
        errors.push(`Verse ${v.id} English translation text is blank`);
      }
    }
  }

  // 4. Check total verse count
  if (totalVerses !== TOTAL_EXPECTED_VERSES) {
    errors.push(
      `Total verses count mismatch: expected exactly ${TOTAL_EXPECTED_VERSES}, got ${totalVerses}`
    );
  }

  if (verseIds.size !== TOTAL_EXPECTED_VERSES) {
    errors.push(
      `Unique verse IDs count mismatch: expected ${TOTAL_EXPECTED_VERSES}, got ${verseIds.size}`
    );
  }

  // 5. Check audio manifest
  if (!fs.existsSync(audioManifestFile)) {
    errors.push("Missing src/data/audio-manifest.json");
  } else {
    try {
      const audioList = JSON.parse(fs.readFileSync(audioManifestFile, "utf-8"));
      if (!Array.isArray(audioList) || audioList.length !== TOTAL_EXPECTED_VERSES) {
        errors.push(
          `audio-manifest.json should contain entries for all ${TOTAL_EXPECTED_VERSES} verses (found ${audioList?.length})`
        );
      }
    } catch {
      errors.push("audio-manifest.json contains invalid JSON");
    }
  }

  if (errors.length > 0) {
    console.error(`\n❌ DATASET VALIDATION FAILED with ${errors.length} error(s):`);
    errors.forEach((err, i) => console.error(`  ${i + 1}. ${err}`));
    process.exit(1);
  }

  console.log(`\n✅ DATASET VALIDATION PASSED!`);
  console.log(`  - Chapters verified: 18`);
  console.log(`  - Verses verified: 700 distinct verses`);
  console.log(`  - Chapter distribution matched conventional 700-verse baseline perfectly`);
  console.log(`  - Sanskrit Devanagari text verified for all 700 verses`);
  console.log(`  - Transliteration, Hindi & English translations verified`);
  console.log(`  - Sources, license, and audio manifest verified`);
}

runValidation();
