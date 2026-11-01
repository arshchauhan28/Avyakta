'use client';

import React from 'react';
import { useTranslation } from '@/i18n/useTranslation';
import { Language } from '@/i18n/types';

interface LanguageSwitcherProps {
  className?: string;
}

export function LanguageSwitcher({ className = '' }: LanguageSwitcherProps) {
  const { language, setLanguage, t } = useTranslation();

  const handleToggle = (newLang: Language) => {
    if (newLang !== language) {
      setLanguage(newLang);
    }
  };

  return (
    <div
      className={`inline-flex items-center rounded-none border-2 border-neo-border bg-neo-bg shadow-neo-sm overflow-hidden text-xs font-mono font-bold ${className}`}
      role="group"
      aria-label={t('settings.primaryLanguage')}
    >
      <button
        type="button"
        onClick={() => handleToggle('en')}
        className={`px-2.5 py-1 transition-colors uppercase ${
          language === 'en'
            ? 'bg-neo-accent text-neo-bg font-extrabold'
            : 'text-neo-text-muted hover:text-neo-text hover:bg-neo-surface'
        }`}
        aria-pressed={language === 'en'}
      >
        EN
      </button>
      <div className="w-[2px] h-full bg-neo-border" aria-hidden="true" />
      <button
        type="button"
        onClick={() => handleToggle('hi')}
        className={`px-2.5 py-1 transition-colors ${
          language === 'hi'
            ? 'bg-neo-accent text-neo-bg font-extrabold'
            : 'text-neo-text-muted hover:text-neo-text hover:bg-neo-surface'
        }`}
        aria-pressed={language === 'hi'}
      >
        हिन्दी
      </button>
    </div>
  );
}
