'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAllChapters } from '@/lib/gita-data';
import { SaveManager } from '@/game/progression/SaveManager';
import { ProgressionService } from '@/game/progression/ProgressionService';
import { getWorldForChapter } from '@/game/content/worlds';
import { GameProgress } from '@/game/types/progression';
import { Chapter } from '@/types/gita';
import { useTranslation } from '@/i18n/useTranslation';
import { useRestoredProgress } from '@/hooks/useRestoredProgress';
import {
  Compass,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';

export default function JourneyPage() {
  const { language, t } = useTranslation();
  const [chapters] = useState<Chapter[]>(() => getAllChapters());
  const { progress } = useRestoredProgress();

  const completedCount = progress.completedLevelIds.length;
  const overallPercent = ((completedCount / 700) * 100).toFixed(1);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HERO BANNER */}
      <section className="neo-card p-6 sm:p-8 lg:p-10" aria-labelledby="journey-heading">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 neo-badge bg-surface-secondary text-text-primary px-3 py-1">
              <Compass className="w-4 h-4 text-accent" />
              <span>{t('journey.curriculumOverview')}</span>
            </div>
            <h1 id="journey-heading" className="text-2xl sm:text-4xl font-black text-text-primary uppercase tracking-tight font-sans">
              {t('journey.title')}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
              {t('journey.subtitle')}
            </p>
          </div>

          {/* Quick Stat Box */}
          <div className="neo-card p-5 bg-surface-secondary min-w-[240px] space-y-3 shadow-neo-sm">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="text-text-muted uppercase">{t('journey.pathMastery')}</span>
              <span className="text-accent text-sm">{overallPercent}%</span>
            </div>
            <div className="w-full h-3 rounded-neo-sm bg-background border-2 border-border-strong overflow-hidden p-0.5">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, Number(overallPercent)))}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-mono font-bold text-text-muted">
              <span>{language === 'hi' ? `${completedCount} / 700 कक्ष` : `${completedCount} / 700 ROOMS`}</span>
              <span className="text-text-primary flex items-center gap-1">
                <Zap className="w-3 h-3 text-accent fill-accent" />
                {progress.totalXP} XP
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. 18 CHAPTER MODULES GRID */}
      <section className="space-y-4" aria-labelledby="modules-heading">
        <div className="flex items-center justify-between">
          <h2 id="modules-heading" className="text-base sm:text-lg font-black text-text-primary uppercase tracking-wide">
            {t('journey.allChapters')}
          </h2>
          <span className="text-xs font-mono font-bold uppercase text-accent">
            {language === 'hi' ? 'क्रमिक मार्ग' : 'Sequential Progression'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((ch) => {
            const world = getWorldForChapter(ch.number);
            const isUnlocked = ProgressionService.isChapterUnlocked(ch.number, progress);
            const isCompleted = ProgressionService.isChapterCompleted(ch.number, progress);
            const chapterCompletedCount = ProgressionService.getChapterCompletedCount(ch.number, progress);
            const percent = ((chapterCompletedCount / ch.verseCount) * 100).toFixed(0);

            return (
              <div
                key={ch.number}
                className={`neo-card flex flex-col justify-between p-5 sm:p-6 transition-all ${
                  !isUnlocked
                    ? 'opacity-65 bg-surface/50 border-border'
                    : isCompleted
                    ? 'border-border-strong hover:shadow-neo-lg'
                    : 'border-border-strong hover:shadow-neo-lg'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Module Header */}
                  <div className="flex items-center justify-between">
                    <span className="neo-badge bg-accent text-accent-contrast px-2.5 py-0.5 text-xs font-black">
                      {language === 'hi' ? `मॉड्यूल ${ch.number}` : `MODULE ${ch.number}`}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                      {isCompleted ? (
                        <span className="inline-flex items-center gap-1 text-success neo-badge bg-surface-secondary px-2 py-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{t('common.completed')}</span>
                        </span>
                      ) : !isUnlocked ? (
                        <span className="inline-flex items-center gap-1 text-text-muted neo-badge bg-background px-2 py-0.5">
                          <Lock className="w-3 h-3" />
                          <span>{t('common.locked')}</span>
                        </span>
                      ) : (
                        <span className="neo-badge bg-surface-secondary text-text-primary px-2 py-0.5">
                          {language === 'hi' ? `${percent}% पूर्ण` : `${percent}% DONE`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-base font-black text-text-primary uppercase font-sans line-clamp-1">
                      {language === 'hi' ? (world?.displayNameHindi || ch.nameSanskrit) : ch.nameEnglish}
                    </h3>
                    <div className="text-xs font-sanskrit text-primary font-bold">
                      {ch.nameSanskrit}
                    </div>
                    <div className="text-xs font-sans text-text-muted mt-0.5">
                      {language === 'hi' ? (ch.descriptionHindi || ch.meaning) : ch.meaning}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2 font-sans">
                    {language === 'hi' ? (world?.descriptionHindi || ch.descriptionHindi) : (world?.description || ch.description)}
                  </p>
                </div>

                {/* Progress bar & CTA */}
                <div className="pt-4 mt-4 border-t-2 border-border-strong space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono font-bold text-text-muted">
                      <span>{language === 'hi' ? 'मॉड्यूल प्रगति' : 'MODULE PROGRESS'}</span>
                      <span className="text-text-primary">
                        {language === 'hi'
                          ? `${chapterCompletedCount} / ${ch.verseCount} कक्ष`
                          : `${chapterCompletedCount} / ${ch.verseCount} ROOMS`}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-neo-sm bg-background border-2 border-border-strong overflow-hidden p-0.5">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-success' : 'bg-accent'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(0, Number(percent)))}%` }}
                      />
                    </div>
                  </div>

                  {isUnlocked ? (
                    <Link
                      href={`/journey/chapter/${ch.number}`}
                      className="neo-btn-primary w-full py-2.5 text-xs inline-flex items-center justify-center gap-2"
                    >
                      <span>
                        {isCompleted
                          ? (language === 'hi' ? 'अध्याय दोहराएँ' : 'Review Chapter Module')
                          : t('journey.openModule')}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="w-full py-2.5 rounded-neo-sm bg-background border-2 border-border text-text-muted font-mono font-bold text-xs uppercase flex items-center justify-center gap-1.5 cursor-not-allowed"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{language === 'hi' ? `पहले मॉड्यूल ${ch.number - 1} पूर्ण करें` : `Complete Module ${ch.number - 1} First`}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
