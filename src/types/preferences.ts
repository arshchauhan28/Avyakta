export type AppTheme = "light" | "dark" | "parchment";
export type TranslationLanguage = "hi" | "en";

export interface ReaderPreferences {
  theme: AppTheme;
  language: TranslationLanguage;
  fontSize: number; // in pixels or step: e.g. 18, 20, 22, 24, 28
  showTransliteration: boolean;
  showWordMeanings: boolean;
}
