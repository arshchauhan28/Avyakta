'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Heart } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

export function Footer() {
  const { t, language } = useTranslation();

  return (
    <footer className="mt-20 border-t-2 border-border-strong bg-navbar transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Overview */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-neo-sm bg-accent text-accent-contrast border-2 border-border-strong flex items-center justify-center shadow-neo-sm">
                <Sparkles className="w-4 h-4 fill-current" />
              </div>
              <span className="font-extrabold text-base tracking-wider text-text-primary uppercase font-sans">
                AVYAKTA
              </span>
              <span className="font-sanskrit text-lg font-bold text-primary">
                श्रीमद्भगवद्गीता
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary max-w-md leading-relaxed font-sans">
              {t.footer.description}
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-text-primary mb-3">
              {t.footer.navigationHeading}
            </h2>
            <ul className="space-y-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider font-mono">
              <li>
                <Link href="/" className="hover:text-accent transition-colors">
                  {t.nav.dashboard}
                </Link>
              </li>
              <li>
                <Link href="/journey" className="hover:text-accent transition-colors">
                  {t.nav.journey} ({language === 'hi' ? '१८ अध्याय' : '18 Chapters'})
                </Link>
              </li>
              <li>
                <Link href="/achievements" className="hover:text-accent transition-colors">
                  {t.nav.achievements}
                </Link>
              </li>
              <li>
                <Link href="/progress" className="hover:text-accent transition-colors">
                  {t.nav.progress}
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-accent transition-colors">
                  {t.nav.settings}
                </Link>
              </li>
            </ul>
          </div>

          {/* Sources & Attribution */}
          <div>
            <h2 className="text-xs font-mono font-bold tracking-wider uppercase text-text-primary mb-3">
              {t.footer.sourcesHeading}
            </h2>
            <div className="text-xs text-text-secondary space-y-1.5 leading-relaxed font-sans">
              <p>
                <strong className="text-text-primary">{t.footer.recensionLabel}</strong> {t.footer.recensionDesc}
              </p>
              <p>
                <strong className="text-text-primary">{t.footer.hindiMeaningsLabel}</strong> {t.footer.hindiMeaningsDesc}
              </p>
              <p>
                <strong className="text-text-primary">{t.footer.englishTranslationsLabel}</strong> {t.footer.englishTranslationsDesc}
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t-2 border-border-strong flex flex-col sm:flex-row items-center justify-between text-xs text-text-muted gap-3 font-mono">
          <p className="flex items-center gap-1.5">
            <span>{t.footer.builtForSeekers}</span>
            <Heart className="w-3.5 h-3.5 text-accent fill-accent" />
          </p>
          <p>
            {t.footer.privateClientSide}
          </p>
        </div>
      </div>
    </footer>
  );
}
