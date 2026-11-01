'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { getChapter } from '@/lib/gita-data';
import { getLevelsForChapter } from '@/game/content/levels';
import { getWorldForChapter } from '@/game/content/worlds';
import { SaveManager } from '@/game/progression/SaveManager';
import { ProgressionService } from '@/game/progression/ProgressionService';
import { GameProgress } from '@/game/types/progression';
import { Chapter } from '@/types/gita';
import { GameLevel } from '@/game/types/level';
import { useTranslation } from '@/i18n/useTranslation';
import { useRestoredProgress } from '@/hooks/useRestoredProgress';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Lock,
  BookOpen
} from 'lucide-react';

interface ChapterModulePageProps {
  params: Promise<{ chapter: string }>;
}

export default function ChapterModulePage({ params }: ChapterModulePageProps) {
  const resolvedParams = use(params);
  const chapterNumber = parseInt(resolvedParams.chapter, 10);
  const { language, t } = useTranslation();
  const { progress } = useRestoredProgress();

  const [chapter, setChapter] = useState<Chapter | null>(() => getChapter(chapterNumber) || null);
  const [levels, setLevels] = useState<GameLevel[]>(() => getLevelsForChapter(chapterNumber));

  useEffect(() => {
    const ch = getChapter(chapterNumber);
    const lvls = getLevelsForChapter(chapterNumber);

    setChapter(ch || null);
    setLevels(lvls);
  }, [chapterNumber]);

  if (!chapter || !progress) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-black text-text-primary uppercase">
          {language === 'hi' ? 'अध्याय मॉड्यूल नहीं मिला' : 'Chapter Module Not Found'}
        </h2>
        <Link
          href="/journey"
          className="neo-btn-primary inline-flex px-6 py-2.5 text-xs"
        >
          {language === 'hi' ? 'यात्रा पर लौटें' : 'Return to Journey Map'}
        </Link>
      </div>
    );
  }

  const world = getWorldForChapter(chapterNumber);
  const completedCount = ProgressionService.getChapterCompletedCount(chapterNumber, progress);
  const percentComplete = ((completedCount / chapter.verseCount) * 100).toFixed(0);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Back button */}
      <div>
        <Link
          href="/journey"
          className="neo-badge bg-surface text-text-primary px-3 py-1.5 inline-flex items-center gap-2 hover:bg-surface-hover hover:translate-x-[-1px] transition-all text-xs font-mono font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('journey.backToJourney')}</span>
        </Link>
      </div>

      {/* 2. Module Overview Hero Banner */}
      <section className="neo-card p-6 sm:p-8 space-y-5" aria-labelledby="chapter-module-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="neo-badge bg-accent text-accent-contrast px-2.5 py-0.5 text-xs font-black">
                {language === 'hi' ? `मॉड्यूल ${chapter.number}` : `MODULE ${chapter.number}`}
              </span>
              <span className="text-xs font-sanskrit text-primary font-bold">
                {chapter.nameSanskrit}
              </span>
            </div>
            <h1 id="chapter-module-heading" className="text-2xl sm:text-3xl font-black text-text-primary uppercase tracking-tight font-sans">
              {language === 'hi'
                ? `अध्याय ${chapter.number}: ${world?.displayNameHindi || chapter.nameSanskrit}`
                : `Chapter ${chapter.number}: ${chapter.nameEnglish}`}
            </h1>
            <p className="text-xs sm:text-sm font-sans font-medium text-text-muted">
              {language === 'hi' ? (world?.subtitleHindi || chapter.descriptionHindi || chapter.meaning) : chapter.meaning}
            </p>
          </div>

          {/* Module Progress Card */}
          <div className="neo-card p-4 bg-surface-secondary min-w-[220px] space-y-2 shadow-neo-sm">
            <div className="flex justify-between items-center text-xs font-mono font-bold">
              <span className="text-text-muted uppercase">{language === 'hi' ? 'पूर्णता' : 'COMPLETION'}</span>
              <span className="text-accent text-sm">{percentComplete}%</span>
            </div>
            <div className="w-full h-3 rounded-neo-sm bg-background border-2 border-border-strong overflow-hidden p-0.5">
              <div
                className="h-full bg-accent transition-all duration-300"
                style={{ width: `${Math.min(100, Math.max(0, Number(percentComplete)))}%` }}
              />
            </div>
            <div className="text-[11px] text-text-muted text-right font-mono font-bold">
              {language === 'hi'
                ? `${completedCount} / ${chapter.verseCount} कक्ष पूर्ण`
                : `${completedCount} / ${chapter.verseCount} ROOMS DONE`}
            </div>
          </div>
        </div>

        {/* Chapter Introduction & Teaching Focus */}
        <div className="p-4 rounded-neo-sm bg-background border-2 border-border-strong text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
          {language === 'hi' ? (world?.descriptionHindi || chapter.descriptionHindi) : (world?.description || chapter.description)}
        </div>
      </section>

      {/* 3. Sequential Shloka Rooms List */}
      <section className="space-y-4" aria-labelledby="rooms-list-heading">
        <div className="flex items-center justify-between">
          <h2 id="rooms-list-heading" className="text-base font-black text-text-primary uppercase tracking-wide">
            {language === 'hi' ? `शिक्षण कक्ष (${levels.length} श्लोक)` : `Learning Rooms (${levels.length} Shlokas)`}
          </h2>
          <span className="text-xs font-mono font-bold uppercase text-accent">
            {language === 'hi' ? 'प्रति कक्ष 3 कार्य' : '3 Tasks per Room'}
          </span>
        </div>

        <div className="space-y-3">
          {levels.map((lvl) => {
            const isUnlocked = ProgressionService.isLevelUnlocked(lvl.id, progress);
            const isCompleted = progress.completedLevelIds.includes(lvl.id);
            const isCurrent = progress.currentLevelId === lvl.id;
            const roomProg = SaveManager.getRoomProgress(lvl.id, progress);
            const tasksDone = [
              roomProg.tasks.reading,
              roomProg.tasks.understanding,
              roomProg.tasks.challenge
            ].filter(Boolean).length;

            const objectiveText = language === 'hi' ? (lvl.learningObjectiveHindi || lvl.learningObjective) : lvl.learningObjective;

            return (
              <div
                key={lvl.id}
                className={`neo-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 transition-all ${
                  isCurrent
                    ? 'border-border-strong bg-surface shadow-neo'
                    : isCompleted
                    ? 'border-border-strong bg-surface'
                    : isUnlocked
                    ? 'border-border-strong bg-surface'
                    : 'border-border bg-surface/50 opacity-60'
                }`}
              >
                {/* Left: Level Status & Title */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-neo-sm border-2 border-border-strong flex items-center justify-center text-xs font-black font-mono shrink-0 shadow-neo-sm ${
                      isCompleted
                        ? 'bg-success text-white'
                        : isCurrent
                        ? 'bg-accent text-accent-contrast'
                        : isUnlocked
                        ? 'bg-surface-secondary text-text-primary'
                        : 'bg-background text-text-muted'
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : !isUnlocked ? (
                      <Lock className="w-4 h-4" />
                    ) : (
                      lvl.verse
                    )}
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-black text-text-primary uppercase">
                        {language === 'hi' ? `कक्ष ${lvl.id}` : `Room ${lvl.id}`}
                      </span>
                      {isCurrent && (
                        <span className="neo-badge bg-accent text-accent-contrast px-2 py-0.2 text-[10px] font-black">
                          {language === 'hi' ? 'सक्रिय कक्ष' : 'ACTIVE ROOM'}
                        </span>
                      )}
                      {isCompleted && (
                        <span className="neo-badge bg-success/20 text-success border-success px-2 py-0.2 text-[10px]">
                          {t('common.completed')}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-secondary truncate font-sans">
                      {objectiveText}
                    </p>
                  </div>
                </div>

                {/* Right: Task Progress Pill & Action Button */}
                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                  <div className="text-xs font-mono font-bold text-text-muted">
                    {language === 'hi' ? `${tasksDone}/3 कार्य` : `${tasksDone}/3 TASKS`}
                  </div>

                  {isUnlocked ? (
                    <Link
                      href={`/learn/${chapterNumber}/${lvl.verse}`}
                      aria-label={`Enter Room ${lvl.id}`}
                      className={`neo-btn py-2 px-4 text-xs ${
                        isCurrent
                          ? 'neo-btn-primary'
                          : isCompleted
                          ? 'neo-btn-secondary'
                          : 'neo-btn-secondary hover:bg-accent hover:text-accent-contrast'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>
                        {isCompleted
                          ? (language === 'hi' ? 'कक्ष दोहराएँ' : 'Review Room')
                          : isCurrent
                          ? (language === 'hi' ? 'कक्ष जारी रखें' : 'Continue Room')
                          : (language === 'hi' ? 'कक्ष आरंभ करें' : 'Start Room')}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2 rounded-neo-sm bg-background border-2 border-border text-text-muted font-mono font-bold text-xs uppercase flex items-center gap-1.5 cursor-not-allowed"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>{t('common.locked')}</span>
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
