import fs from "fs";
import path from "path";

interface RawChapter {
  id: number;
  chapter_number: number;
  name: string;
  name_transliterated: string;
  name_translation: string;
  name_meaning: string;
  chapter_summary: string;
  chapter_summary_hindi: string;
  verses_count: number;
}

interface RawVerse {
  id: number;
  externalId: number;
  chapter_id: number;
  chapter_number: number;
  verse_number: number;
  verse_order: number;
  text: string;
  transliteration: string;
  word_meanings: string;
  title: string;
}

interface RawTranslation {
  id: number;
  verse_id: number;
  verseNumber: number;
  author_id: number;
  authorName: string;
  lang: string;
  description: string;
}

export interface Translation {
  text: string;
  language: "hi" | "en";
  author?: string;
  sourceId?: string;
}

export interface WordMeaning {
  word: string;
  transliteration?: string;
  meaningHindi?: string;
  meaningEnglish?: string;
}

export interface Verse {
  id: string;
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration?: string;
  translations: {
    hindi?: Translation;
    english?: Translation;
  };
  wordMeanings?: WordMeaning[];
  wordMeaningsRaw?: string;
  audioId?: string;
  audioSrc?: string;
}

export interface Chapter {
  number: number;
  nameSanskrit: string;
  nameTransliterated: string;
  nameEnglish: string;
  meaning: string;
  description: string;
  descriptionHindi?: string;
  verseCount: number;
  prologueVerse?: {
    sanskrit: string;
    transliteration: string;
    meaningEnglish: string;
    meaningHindi?: string;
  };
}

function parseWordMeanings(raw: string): WordMeaning[] {
  if (!raw || !raw.trim()) return [];
  const parts = raw.split(/;|\n/).map((p) => p.trim()).filter(Boolean);
  const result: WordMeaning[] = [];
  for (const part of parts) {
    const dashIdx = part.indexOf("—") !== -1 ? part.indexOf("—") : part.indexOf("-");
    if (dashIdx !== -1) {
      const word = part.slice(0, dashIdx).trim();
      const meaning = part.slice(dashIdx + 1).trim();
      result.push({
        word,
        transliteration: word,
        meaningEnglish: meaning,
      });
    } else {
      result.push({ word: part });
    }
  }
  return result;
}

function cleanText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n")
    .trim();
}

async function main() {
  console.log("Fetching Bhagavad Gita dataset from gita/gita repository (The Unlicense)...");

  const [chaptersRes, versesRes, translationsRes] = await Promise.all([
    fetch("https://raw.githubusercontent.com/gita/gita/main/data/chapters.json"),
    fetch("https://raw.githubusercontent.com/gita/gita/main/data/verse.json"),
    fetch("https://raw.githubusercontent.com/gita/gita/main/data/translation.json"),
  ]);

  if (!chaptersRes.ok || !versesRes.ok || !translationsRes.ok) {
    throw new Error("Failed to fetch scripture data from repository");
  }

  const rawChapters: RawChapter[] = await chaptersRes.json();
  const rawVerses: RawVerse[] = await versesRes.json();
  const rawTranslations: RawTranslation[] = await translationsRes.json();

  console.log(`Fetched ${rawChapters.length} chapters, ${rawVerses.length} raw verses, ${rawTranslations.length} translations.`);

  // Map translations by raw verse_id
  const translationsMap = new Map<number, { hi: RawTranslation[]; en: RawTranslation[] }>();
  for (const t of rawTranslations) {
    if (!translationsMap.has(t.verse_id)) {
      translationsMap.set(t.verse_id, { hi: [], en: [] });
    }
    const entry = translationsMap.get(t.verse_id)!;
    if (t.lang === "hindi") {
      entry.hi.push(t);
    } else if (t.lang === "english") {
      entry.en.push(t);
    }
  }

  // Desired verse counts per chapter (conventional 700 verses)
  const EXPECTED_COUNTS: Record<number, number> = {
    1: 47, 2: 72, 3: 43, 4: 42, 5: 29, 6: 47,
    7: 30, 8: 28, 9: 34, 10: 42, 11: 55, 12: 20,
    13: 34, 14: 27, 15: 20, 16: 24, 17: 28, 18: 78,
  };

  const processedChapters: Chapter[] = [];
  const processedVersesByChapter = new Map<number, Verse[]>();
  const audioManifest: Array<{ verseId: string; audioSrc: string; chapter: number; verse: number; attribution: string }> = [];

  // Group raw verses by chapter_number
  const versesByCh = new Map<number, RawVerse[]>();
  for (const v of rawVerses) {
    if (!versesByCh.has(v.chapter_number)) {
      versesByCh.set(v.chapter_number, []);
    }
    versesByCh.get(v.chapter_number)!.push(v);
  }

  // Sort raw verses within each chapter by verse_number
  for (const [, list] of versesByCh) {
    list.sort((a, b) => a.verse_number - b.verse_number);
  }

  for (let chNum = 1; chNum <= 18; chNum++) {
    const rawCh = rawChapters.find((c) => c.chapter_number === chNum);
    if (!rawCh) throw new Error(`Missing chapter ${chNum}`);

    const chVersesRaw = versesByCh.get(chNum) || [];
    let versesForChapter: RawVerse[] = [];
    let prologue: Chapter["prologueVerse"] = undefined;

    if (chNum === 13) {
      // In gita/gita, Chapter 13 has 35 verses. Verse 1 is Arjuna's inquiry:
      // "अर्जुन उवाच प्रकृतिं पुरुषं चैव...".
      // In the traditional 700-verse Adi Shankaracharya & Gita Press edition,
      // Chapter 13 contains 34 verses starting with Sri Bhagavanuvacha "इदं शरीरं कौन्तेय...".
      // We preserve Arjuna's inquiry as the Chapter 13 prologue invocation so no scripture is lost,
      // while numbering the 34 verses 1..34 to adhere faithfully to the 700-verse standard.
      const inquiryVerse = chVersesRaw[0];
      const inquiryTrans = translationsMap.get(inquiryVerse.id);
      prologue = {
        sanskrit: cleanText(inquiryVerse.text),
        transliteration: cleanText(inquiryVerse.transliteration),
        meaningEnglish: cleanText(inquiryTrans?.en[0]?.description || ""),
        meaningHindi: cleanText(inquiryTrans?.hi[0]?.description || ""),
      };
      versesForChapter = chVersesRaw.slice(1); // 34 verses
    } else {
      versesForChapter = chVersesRaw;
    }

    const expectedCount = EXPECTED_COUNTS[chNum];
    if (versesForChapter.length !== expectedCount) {
      throw new Error(`Chapter ${chNum} count mismatch: expected ${expectedCount}, got ${versesForChapter.length}`);
    }

    const chapterObj: Chapter = {
      number: chNum,
      nameSanskrit: rawCh.name,
      nameTransliterated: rawCh.name_transliterated,
      nameEnglish: rawCh.name_translation,
      meaning: rawCh.name_meaning,
      description: cleanText(rawCh.chapter_summary),
      descriptionHindi: cleanText(rawCh.chapter_summary_hindi),
      verseCount: expectedCount,
      ...(prologue ? { prologueVerse: prologue } : {}),
    };
    processedChapters.push(chapterObj);

    const chapterVerses: Verse[] = [];

    for (let idx = 0; idx < versesForChapter.length; idx++) {
      const v = versesForChapter[idx];
      const verseNumber = idx + 1; // 1-indexed
      const verseId = `${chNum}.${verseNumber}`;

      const tList = translationsMap.get(v.id) || { hi: [], en: [] };

      // Preferred authors: Ramsukhdas / Tejomayananda for Hindi, Sivananda / Adidevananda / Gambirananda for English
      const hindiTrans = tList.hi.find((t) => t.authorName.includes("Ramsukhdas")) || tList.hi[0];
      const englishTrans = tList.en.find((t) => t.authorName.includes("Sivananda")) || tList.en[0];

      // Audio path in gita/gita repo
      // For chapter 13, raw audio file number is v.verse_number (which is idx+2)
      const rawAudioNumber = v.verse_number;
      const audioUrl = `https://raw.githubusercontent.com/gita/gita/main/data/verse_recitation/${chNum}/${rawAudioNumber}.mp3`;

      const verseObj: Verse = {
        id: verseId,
        chapter: chNum,
        verse: verseNumber,
        sanskrit: cleanText(v.text),
        transliteration: cleanText(v.transliteration),
        translations: {
          hindi: hindiTrans
            ? {
                text: cleanText(hindiTrans.description),
                language: "hi",
                author: hindiTrans.authorName,
                sourceId: String(hindiTrans.id),
              }
            : undefined,
          english: englishTrans
            ? {
                text: cleanText(englishTrans.description),
                language: "en",
                author: englishTrans.authorName,
                sourceId: String(englishTrans.id),
              }
            : undefined,
        },
        wordMeanings: parseWordMeanings(v.word_meanings),
        wordMeaningsRaw: cleanText(v.word_meanings),
        audioId: `${chNum}-${verseNumber}`,
        audioSrc: audioUrl,
      };

      chapterVerses.push(verseObj);
      audioManifest.push({
        verseId,
        audioSrc: audioUrl,
        chapter: chNum,
        verse: verseNumber,
        attribution: "Recitation sourced from gita/gita dataset (The Unlicense - Public Domain)",
      });
    }

    processedVersesByChapter.set(chNum, chapterVerses);
  }

  // Create destination directories
  const dataDir = path.resolve(process.cwd(), "src/data");
  const versesDir = path.join(dataDir, "verses");
  fs.mkdirSync(versesDir, { recursive: true });

  // Write chapters.json
  fs.writeFileSync(
    path.join(dataDir, "chapters.json"),
    JSON.stringify(processedChapters, null, 2),
    "utf-8"
  );
  console.log("Wrote src/data/chapters.json");

  // Write individual chapter verse files
  let totalVersesWritten = 0;
  for (let chNum = 1; chNum <= 18; chNum++) {
    const verses = processedVersesByChapter.get(chNum) || [];
    const fileName = `chapter-${String(chNum).padStart(2, "0")}.json`;
    fs.writeFileSync(
      path.join(versesDir, fileName),
      JSON.stringify(verses, null, 2),
      "utf-8"
    );
    totalVersesWritten += verses.length;
  }
  console.log(`Wrote ${totalVersesWritten} verses across 18 chapter files in src/data/verses/`);

  // Write sources.json
  const sourcesMetadata = {
    edition: "Traditional 700-verse recension (Shankaracharya / Gita Press standard baseline)",
    totalChapters: 18,
    totalVerses: 700,
    repository: "https://github.com/gita/gita",
    license: "The Unlicense (Public Domain Dedication)",
    commentatorsAndTranslators: [
      {
        name: "Swami Ramsukhdas",
        language: "Hindi",
        work: "Sadhak Sanjivani (Gita Press)",
        attribution: "Primary Hindi translation",
      },
      {
        name: "Swami Tejomayananda",
        language: "Hindi",
        work: "Chinmaya Mission",
        attribution: "Alternate Hindi translation",
      },
      {
        name: "Swami Sivananda",
        language: "English",
        work: "The Bhagavad Gita (Divine Life Society)",
        attribution: "Primary English translation",
      },
      {
        name: "Swami Adidevananda",
        language: "English",
        work: "Sri Ramanuja Gita Bhasya",
        attribution: "Alternate English translation",
      },
      {
        name: "Swami Gambhirananda",
        language: "English",
        work: "Bhagavadgita with the commentary of Sankaracarya",
        attribution: "Alternate English translation",
      },
    ],
    editorialConventions: [
      "Traditional 700-shloka canonical distribution strictly respected.",
      "In Chapter 13, Arjuna's opening inquiry ('prakṛtiṁ puruṣaṁ caiva...'), which is omitted or unnumbered in Shankara and Ramanuja recensions to achieve exactly 700 verses, is preserved as Chapter 13 prologue invocation metadata, with verses 1..34 mapping faithfully to Sri Bhagavanuvacha onward.",
      "Word-by-word meanings provided for every verse.",
      "Roman transliteration provided for every verse.",
      "Audio recitation links mapped for every verse to high-fidelity MP3 recitations from the gita/gita open archive.",
    ],
  };

  fs.writeFileSync(
    path.join(dataDir, "sources.json"),
    JSON.stringify(sourcesMetadata, null, 2),
    "utf-8"
  );
  console.log("Wrote src/data/sources.json");

  // Write audio-manifest.json
  fs.writeFileSync(
    path.join(dataDir, "audio-manifest.json"),
    JSON.stringify(audioManifest, null, 2),
    "utf-8"
  );
  console.log("Wrote src/data/audio-manifest.json");

  console.log("Scripture dataset processing successfully completed!");
}

main().catch((err) => {
  console.error("Error processing Gita data:", err);
  process.exit(1);
});
