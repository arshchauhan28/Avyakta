'use client';

import { useMemo, useCallback, useEffect } from 'react';
import { useReaderPreferences } from '@/hooks/useReaderPreferences';
import { Language, TranslationDictionary } from './types';
import { DEFAULT_LANGUAGE } from './config';
import { SaveManager } from '@/game/progression/SaveManager';
import enDict from './dictionaries/en.json';
import hiDict from './dictionaries/hi.json';

const DICTIONARIES: Record<Language, TranslationDictionary> = {
  en: enDict as unknown as TranslationDictionary,
  hi: hiDict as unknown as TranslationDictionary,
};

export function useTranslation() {
  const prefs = useReaderPreferences();
  const rawLang = prefs?.language;
  const currentLang: Language = rawLang === 'hi' ? 'hi' : 'en';

  // Keep html lang attribute in sync
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('lang', currentLang);
    }
  }, [currentLang]);

  const dict = useMemo(() => {
    return DICTIONARIES[currentLang] || DICTIONARIES[DEFAULT_LANGUAGE];
  }, [currentLang]);

  const setLanguage = useCallback((newLang: Language) => {
    if (prefs?.setLanguage) {
      prefs.setLanguage(newLang);
    }
    // Synchronize with SaveManager settings
    try {
      const currentProgress = SaveManager.loadProgress();
      if (currentProgress.settings.language !== newLang) {
        SaveManager.saveProgress({
          ...currentProgress,
          settings: {
            ...currentProgress.settings,
            language: newLang
          }
        });
      }
    } catch {
      // Ignored in non-browser or test environments
    }
  }, [prefs]);

  // Dot-notation translation helper with dictionary properties attached: e.g. t('nav.dashboard') or t.nav.dashboard
  const tFunc = useCallback((path: string): string => {
    const keys = path.split('.');
    let current: any = dict;
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to English dictionary
        let fallback: any = DICTIONARIES.en;
        for (const fbKey of keys) {
          if (fallback && typeof fallback === 'object' && fbKey in fallback) {
            fallback = fallback[fbKey];
          } else {
            return path;
          }
        }
        return typeof fallback === 'string' ? fallback : path;
      }
    }
    return typeof current === 'string' ? current : path;
  }, [dict]);

  const t = useMemo(() => {
    return Object.assign(tFunc, dict) as ((path: string) => string) & TranslationDictionary;
  }, [tFunc, dict]);

  return {
    language: currentLang,
    setLanguage,
    isHindi: currentLang === 'hi',
    dict,
    t
  };
}
