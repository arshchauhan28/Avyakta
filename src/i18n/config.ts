import { Language } from './types';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'hi'];
export const DEFAULT_LANGUAGE: Language = 'en';
export const FALLBACK_LANGUAGE: Language = 'en';

export const LANGUAGE_LABELS: Record<Language, { label: string; nativeLabel: string }> = {
  en: { label: 'English', nativeLabel: 'English' },
  hi: { label: 'Hindi', nativeLabel: 'हिन्दी' }
};
