'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SaveManager } from '@/game/progression/SaveManager';
import { ProgressionService } from '@/game/progression/ProgressionService';
import { AchievementService } from '@/game/progression/AchievementService';
import { getLevelById } from '@/game/content/levels';
import { getChapter, getAllChapters } from '@/lib/gita-data';
import { getWorldForChapter } from '@/game/content/worlds';
import { GameProgress } from '@/game/types/progression';
import { DailyShloka } from '@/components/home/DailyShloka';
import { useTranslation } from '@/i18n/useTranslation';
import { useRestoredProgress } from '@/hooks/useRestoredProgress';
import { GuestImportBanner } from '@/components/auth/GuestImportBanner';
import { GuestInvitationCard } from '@/components/auth/GuestInvitationCard';
import {
  Compass,
  Sparkles,
  ArrowRight,
  Award,
  Zap,
  BarChart3,
  RotateCcw,
  BookOpenCheck,
  CheckSquare2
} from 'lucide-react';

export default function DashboardPage() {
  const { language, t } = useTranslation();
  const { progress, isRestored } = useRestoredProgress();

  const currentLevel = getLevelById(progress.currentLevelId || '1.1') || getLevelById('1.1')!;
  const currentChapter = getChapter(currentLevel.chapter) || getChapter(1)!;
  const currentWorld = getWorldForChapter(currentLevel.chapter);

  const completedLevelsCount = progress.completedLevelIds.length;
  const overallPercentage = ((completedLevelsCount / 700) * 100).toFixed(1);

  const allChapters = getAllChapters();
  const completedChaptersCount = allChapters.filter((ch) =>
    ProgressionService.isChapterCompleted(ch.number, progress)
  ).length;

  const currentChapterCompletedCount = ProgressionService.getChapterCompletedCount(
    currentChapter.number,
    progress
  );
  const currentChapterPercent = (
    (currentChapterCompletedCount / currentChapter.verseCount) *
    100
  ).toFixed(0);

  const rank = AchievementService.getRankForXP(progress.totalXP);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 overflow-x-hidden">
      {/* Guest Progress Import Banner (for authenticated users with local progress) */}
      <GuestImportBanner />

      {/* 1. HERO LEARNING JOURNEY CARD */}
      <section className="neo-card p-6 sm:p-8 lg:p-10 relative overflow-hidden" aria-labelledby="dashboard-heading">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
          {/* Left: Current Level Callout */}
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 neo-badge bg-surface-secondary text-text-primary px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>{t('dashboard.activeLearningPath')}</span>
            </div>

            <div className="space-y-2">
              <h1 id="dashboard-heading" className="text-2xl sm:text-4xl lg:text-5xl font-black text-text-primary uppercase tracking-tight font-sans">
                {t('dashboard.continueJourney')}
              </h1>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-sans">
                {language === 'hi'
                  ? `अध्याय ${currentChapter.number}: ${currentWorld?.displayNameHindi || currentChapter.nameSanskrit} (${currentChapter.descriptionHindi || currentChapter.meaning})`
                  : `Chapter ${currentChapter.number}: ${currentChapter.nameEnglish} (${currentChapter.meaning})`}
              </p>
            </div>

            {/* Current Level Pill & Progress stats */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="neo-badge bg-background text-text-primary px-3 py-1.5">
                <span className="text-text-muted">{language === 'hi' ? 'कक्ष: ' : 'ROOM: '}</span>
                <span className="text-accent font-black">
                  {!isRestored ? (
                    <span className="inline-block w-7 h-3.5 bg-surface-secondary animate-pulse rounded-neo-sm align-middle" />
                  ) : (
                    currentLevel.id
                  )}
                </span>
              </div>

              <div className="neo-badge bg-background text-text-primary px-3 py-1.5">
                <span className="text-text-muted">{language === 'hi' ? 'पूर्ण: ' : 'COMPLETED: '}</span>
                <span className="text-text-primary font-black">
                  {!isRestored ? (
                    <span className="inline-block w-12 h-3.5 bg-surface-secondary animate-pulse rounded-neo-sm align-middle" />
                  ) : (
                    `${completedLevelsCount} / 700`
                  )}
                </span>
              </div>

              <div className="neo-badge bg-background text-text-primary px-3 py-1.5">
                <span className="text-text-muted">{language === 'hi' ? 'सिद्धि: ' : 'MASTERY: '}</span>
                <span className="text-accent font-black">
                  {!isRestored ? (
                    <span className="inline-block w-9 h-3.5 bg-surface-secondary animate-pulse rounded-neo-sm align-middle" />
                  ) : (
                    `${overallPercentage}%`
                  )}
                </span>
              </div>
            </div>

            {/* High-Impact CTA Button */}
            <div className="pt-3">
              <Link
                href={`/learn/${currentLevel.chapter}/${currentLevel.verse}`}
                className="neo-btn-primary inline-flex items-center gap-3 px-6 py-3.5 text-sm sm:text-base font-black shadow-neo hover:shadow-neo-lg"
              >
                <span>
                  {t('dashboard.continueLearning')}
                  {isRestored ? ` (${currentLevel.id})` : ''}
                </span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Right: Current Module Widget */}
          <div className="neo-card p-5 sm:p-6 bg-surface-secondary w-full lg:max-w-md space-y-4 shadow-neo-sm">
            <div className="flex items-center justify-between">
              <span className="neo-badge bg-accent text-accent-contrast px-2 py-0.5 text-[11px]">
                {language === 'hi' ? `मॉड्यूल ${currentChapter.number}` : `MODULE ${currentChapter.number}`}
              </span>
              <span className="font-mono text-xs font-black text-text-primary">
                {language === 'hi' ? `${currentChapterPercent}% पूर्ण` : `${currentChapterPercent}% DONE`}
              </span>
            </div>

            <div>
              <h2 className="text-base sm:text-lg font-black text-text-primary uppercase line-clamp-1">
                {language === 'hi' ? (currentWorld?.displayNameHindi || currentChapter.nameSanskrit) : currentChapter.nameEnglish}
              </h2>
              <div className="text-xs font-sanskrit text-primary font-bold">
                {currentChapter.nameSanskrit}
              </div>
              <p className="text-xs text-text-secondary line-clamp-2 mt-1.5 font-sans">
                {language === 'hi' ? (currentWorld?.descriptionHindi || currentChapter.descriptionHindi) : (currentWorld?.description || currentChapter.description)}
              </p>
            </div>

            {/* Custom Neo Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono font-bold text-text-muted">
                <span>{language === 'hi' ? 'मॉड्यूल प्रगति' : 'MODULE PROGRESS'}</span>
                <span className="text-text-primary">
                  {language === 'hi'
                    ? `${currentChapterCompletedCount} / ${currentChapter.verseCount} कक्ष`
                    : `${currentChapterCompletedCount} / ${currentChapter.verseCount} ROOMS`}
                </span>
              </div>
              <div className="w-full h-3 rounded-neo-sm bg-background border-2 border-border-strong overflow-hidden p-0.5">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, Number(currentChapterPercent)))}%` }}
                />
              </div>
            </div>

            <Link
              href={`/journey/chapter/${currentChapter.number}`}
              className="neo-btn-secondary w-full py-2.5 text-xs uppercase font-extrabold flex items-center justify-center gap-2"
            >
              <span>{t('dashboard.viewModuleCurriculum')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 2. STATS ROW (5 NEO-BRUTALIST METRIC CARDS) */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-4" aria-label="Learning Statistics">
        {/* Stat 1: Levels */}
        <div className="neo-card p-4 sm:p-5 space-y-1.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
            {t('dashboard.levelsCompleted')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-text-primary font-mono">
            {completedLevelsCount} <span className="text-xs text-text-muted font-normal">/ 700</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-accent">
            {language === 'hi' ? 'क्रमिक मार्ग' : 'SEQUENTIAL PATH'}
          </span>
        </div>

        {/* Stat 2: Chapters */}
        <div className="neo-card p-4 sm:p-5 space-y-1.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
            {t('dashboard.chaptersCompleted')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-text-primary font-mono">
            {completedChaptersCount} <span className="text-xs text-text-muted font-normal">/ 18</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-text-muted">
            {language === 'hi' ? 'सम्पूर्ण पाठ्यक्रम' : 'FULL CURRICULUM'}
          </span>
        </div>

        {/* Stat 3: XP & Rank */}
        <div className="neo-card p-4 sm:p-5 space-y-1.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
            {t('dashboard.experiencePoints')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-accent flex items-center gap-1 font-mono">
            <Zap className="w-5 h-5 fill-current" />
            <span>{progress.totalXP}</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-text-secondary truncate block">
            {language === 'hi' ? rank.titleSanskrit : rank.title}
          </span>
        </div>

        {/* Stat 4: Achievements */}
        <div className="neo-card p-4 sm:p-5 space-y-1.5">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
            {t('dashboard.achievementsUnlocked')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-text-primary font-mono">
            {progress.unlockedAchievementIds.length}
          </div>
          <span className="text-[11px] font-mono font-bold text-text-muted">
            {language === 'hi' ? 'पदक अनलॉक' : 'BADGES UNLOCKED'}
          </span>
        </div>

        {/* Stat 5: Overall Progress */}
        <div className="neo-card p-4 sm:p-5 space-y-1.5 col-span-2 md:col-span-1">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-text-muted">
            {t('dashboard.pathMastery')}
          </span>
          <div className="text-2xl sm:text-3xl font-black text-success font-mono">
            {overallPercentage}%
          </div>
          <span className="text-[11px] font-mono font-bold text-text-muted">
            {language === 'hi' ? 'लक्ष्य: 100%' : 'TARGET: 100%'}
          </span>
        </div>
      </section>

      {/* 3. DAILY SHLOKA CONTEMPLATION */}
      <section aria-labelledby="daily-shloka-heading">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent" />
            <h2 id="daily-shloka-heading" className="text-base font-black text-text-primary uppercase tracking-wide">
              {t('dashboard.dailyWisdom')}
            </h2>
          </div>
          <Link
            href="/journey"
            className="text-xs font-mono font-bold uppercase text-accent hover:underline flex items-center gap-1"
          >
            <span>{language === 'hi' ? 'सभी 18 अध्याय देखें' : 'Explore All 18 Modules'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <DailyShloka />
      </section>

      {/* 4. RECOMMENDED ACTIONS */}
      <section className="space-y-4" aria-labelledby="quick-actions-heading">
        <h2 id="quick-actions-heading" className="text-base font-black text-text-primary uppercase tracking-wide">
          {t('dashboard.quickActions')}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Action 1: My Journey */}
          <Link
            href="/journey"
            className="neo-card p-5 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-neo-sm bg-accent text-accent-contrast border-2 border-border-strong flex items-center justify-center shadow-neo-sm">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-text-primary uppercase">{t('nav.journey')}</h3>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                {language === 'hi'
                  ? 'अठारह अध्यायों का अवलोकन करें और अपने अगले क्रमिक श्लोक कक्ष का अध्ययन जारी रखें।'
                  : 'Explore the 18 chapters and resume your next sequential shloka room.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-accent group-hover:translate-x-1 transition-transform">
              <span>{t('dashboard.viewCurriculum')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Action 2: My Progress */}
          <Link
            href="/progress"
            className="neo-card p-5 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-neo-sm bg-surface-secondary text-text-primary border-2 border-border-strong flex items-center justify-center shadow-neo-sm">
                <BarChart3 className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-sm font-black text-text-primary uppercase">{t('nav.progress')}</h3>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                {language === 'hi'
                  ? 'पूर्ण किए गए कक्ष, अध्याय सिद्धि दर और गहन अध्ययन सांख्यिकी देखें।'
                  : 'Track completed rooms, chapter mastery rates, and learning analytics.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-accent group-hover:translate-x-1 transition-transform">
              <span>{language === 'hi' ? 'सांख्यिकी देखें' : 'Review Stats'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Action 3: Achievements */}
          <Link
            href="/achievements"
            className="neo-card p-5 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-neo-sm bg-surface-secondary text-text-primary border-2 border-border-strong flex items-center justify-center shadow-neo-sm">
                <Award className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-sm font-black text-text-primary uppercase">{t('nav.achievements')}</h3>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                {language === 'hi'
                  ? 'साधक पदवियाँ, अध्याय उपलब्धि पदक और आध्यात्मिक सम्मान देखें।'
                  : 'Track learner ranks, chapter milestone badges, and mastery honors.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-accent group-hover:translate-x-1 transition-transform">
              <span>{language === 'hi' ? 'पदक देखें' : 'See Badges'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>

          {/* Action 4: Settings */}
          <Link
            href="/settings"
            className="neo-card p-5 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-neo transition-all group flex flex-col justify-between space-y-4"
          >
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-neo-sm bg-surface-secondary text-text-primary border-2 border-border-strong flex items-center justify-center shadow-neo-sm">
                <RotateCcw className="w-5 h-5 text-accent" />
              </div>
              <h3 className="text-sm font-black text-text-primary uppercase">{t('nav.settings')}</h3>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                {language === 'hi'
                  ? 'थीम, वेबसाइट की भाषा, वाचन ध्वनि और प्रगति सुरक्षित रखने की व्यवस्था।'
                  : 'Configure themes, translations, typography, and backup save data.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-accent group-hover:translate-x-1 transition-transform">
              <span>{language === 'hi' ? 'सेटिंग्स खोलें' : 'Open Settings'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Link>
        </div>
      </section>

      {/* Subtle Guest Account Invitation (Section 3 requirement) */}
      <GuestInvitationCard />
    </div>
  );
}
