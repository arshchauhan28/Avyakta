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
  id: string; // e.g. "1.1", "2.47"
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

export interface AudioManifestItem {
  verseId: string;
  audioSrc: string;
  chapter: number;
  verse: number;
  attribution: string;
}

export interface GitaSourceMetadata {
  edition: string;
  totalChapters: number;
  totalVerses: number;
  repository: string;
  license: string;
  commentatorsAndTranslators: Array<{
    name: string;
    language: string;
    work: string;
    attribution: string;
  }>;
  editorialConventions: string[];
}
