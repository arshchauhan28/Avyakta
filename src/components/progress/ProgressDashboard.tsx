"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getAllChapters } from "@/lib/gita-data";
import { SaveManager } from "@/game/progression/SaveManager";
import { GameProgress } from "@/game/types/progression";
import { useTranslation } from "@/i18n/useTranslation";
import { getWorldByChapter } from "@/game/content/worlds";
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Award,
  RotateCcw,
  BookOpenCheck,
} from "lucide-react";

export function ProgressDashboard() {
  const { t, language } = useTranslation();
  const [gameProgress, setGameProgress] = useState<GameProgress | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setGameProgress(SaveManager.loadProgress());
  }, []);

  if (!gameProgress) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-8 animate-pulse">
        <div className="h-44 neo-card" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-32 neo-card" />
          <div className="h-32 neo-card" />
          <div className="h-32 neo-card" />
        </div>
      </div>
    );
  }

  const chapters = getAllChapters();
  const completedSet = new Set(gameProgress.completedLevelIds);
  const completedCount = completedSet.size;
  const remainingCount = Math.max(0, 700 - completedCount);
  const overallPercent = ((completedCount / 700) * 100).toFixed(1);

  const [currentChapStr, currentVerseStr] = gameProgress.currentLevelId.split(".");
  const currentChapterNum = parseInt(currentChapStr, 10) || 1;
  const currentChapter = chapters.find((c) => c.number === currentChapterNum);
  const currentWorld = getWorldByChapter(currentChapterNum);
  const continueUrl = `/learn/${currentChapStr}/${currentVerseStr || 1}`;

  const currentChapterTitle =
    language === "hi" && currentWorld?.displayNameHindi
      ? currentWorld.displayNameHindi
      : currentChapter?.nameEnglish || "Gita";

  const handleResetProgress = () => {
    const defaultProg = SaveManager.createDefaultProgress();
    SaveManager.saveProgress(defaultProg);
    setGameProgress(defaultProg);
    setShowResetConfirm(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header Banner */}
      <section className="neo-card p-6 sm:p-8 space-y-4" aria-labelledby="progress-dashboard-heading">
        <div className="inline-flex items-center gap-2 neo-badge bg-surface-secondary text-text-primary px-3 py-1">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>{t.progressPage.curriculumMasteryBadge}</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 id="progress-dashboard-heading" className="text-2xl sm:text-4xl font-black text-text-primary uppercase tracking-tight font-sans">
              {t.progressPage.title}
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary mt-1 font-sans">
              {t.progressPage.subtitle}
            </p>
          </div>
          <Link
            href={continueUrl}
            className="neo-btn-primary px-6 py-3 text-xs inline-flex items-center gap-2 self-start sm:self-auto"
          >
            <span>{t.progressPage.resumeLevel} {gameProgress.currentLevelId}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* 2. Main KPI Grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6" aria-label="Progress Metrics">
        <div className="neo-card p-5 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">{t.progressPage.completedMetric}</span>
            <BookOpenCheck className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-text-primary">
            {completedCount} <span className="text-xs font-normal text-text-muted">/ 700</span>
          </div>
          <p className="text-xs font-sans text-text-secondary">{t.progressPage.completedSub}</p>
        </div>

        <div className="neo-card p-5 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">{t.progressPage.remainingMetric}</span>
            <Compass className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-text-primary">
            {remainingCount}
          </div>
          <p className="text-xs font-sans text-text-secondary">{t.progressPage.remainingSub}</p>
        </div>

        <div className="neo-card p-5 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">{t.progressPage.totalXpMetric}</span>
            <Zap className="w-4 h-4 text-accent fill-accent" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-accent">
            {gameProgress.totalXP.toLocaleString()}
          </div>
          <p className="text-xs font-sans text-text-secondary">{t.progressPage.totalXpSub}</p>
        </div>

        <div className="neo-card p-5 space-y-2">
          <div className="flex items-center justify-between text-text-muted">
            <span className="text-xs font-mono font-bold uppercase tracking-wider">{t.progressPage.achievementsMetric}</span>
            <Award className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono text-text-primary">
            {gameProgress.unlockedAchievementIds.length}
          </div>
          <p className="text-xs font-sans text-text-secondary">{t.progressPage.achievementsSub}</p>
        </div>
      </section>

      {/* 3. Progress Bar Overview Card */}
      <section className="neo-card p-6 sm:p-8 space-y-4" aria-labelledby="overall-journey-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 id="overall-journey-heading" className="text-base sm:text-lg font-black text-text-primary uppercase font-sans">
              {t.progressPage.overallJourney}
            </h2>
            <p className="text-xs text-text-secondary font-sans">
              {t.progressPage.currentFocus}: {t.progressPage.chapterLabel} {currentChapterNum} ({currentChapterTitle}) · {t.learningRoom.roomTitle} {gameProgress.currentLevelId}
            </p>
          </div>
          <span className="text-2xl font-black font-mono text-accent">{overallPercent}%</span>
        </div>

        <div className="w-full h-3 rounded-neo-sm bg-background border-2 border-border-strong overflow-hidden p-0.5">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${overallPercent}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs font-mono font-bold text-text-muted border-t-2 border-border-strong">
          <span>{completedCount} of 700 {t.progressPage.levelsFinished}</span>
          <Link
            href="/journey"
            className="neo-badge bg-surface text-text-primary px-3 py-1 inline-flex items-center gap-1.5 hover:bg-surface-hover hover:translate-x-[-1px] transition-all"
          >
            <span>{t.progressPage.viewJourneyMap}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

      {/* 4. Chapter-by-Chapter Breakdown */}
      <section className="space-y-4" aria-labelledby="chapters-breakdown-heading">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="chapters-breakdown-heading" className="text-base sm:text-lg font-black text-text-primary uppercase tracking-wide">
              {t.progressPage.chaptersTitle}
            </h2>
            <p className="text-xs text-text-secondary font-sans">
              {t.progressPage.chaptersSubtitle}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {chapters.map((chapter) => {
            const world = getWorldByChapter(chapter.number);
            let chapterCompletedCount = 0;
            for (let v = 1; v <= chapter.verseCount; v++) {
              if (completedSet.has(`${chapter.number}.${v}`)) {
                chapterCompletedCount++;
              }
            }
            const chapterPercent = Math.round((chapterCompletedCount / chapter.verseCount) * 100);
            const isCompleted = chapterCompletedCount === chapter.verseCount;

            const chapterName =
              language === "hi" && world?.displayNameHindi
                ? world.displayNameHindi
                : chapter.nameEnglish;

            return (
              <div
                key={chapter.number}
                className="neo-card p-5 space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="neo-badge bg-accent text-accent-contrast px-2 py-0.5 text-xs font-black">
                      {t.progressPage.chapterLabel} {chapter.number}
                    </span>

                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-success neo-badge bg-surface-secondary px-2 py-0.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{t.progressPage.masteredLabel}</span>
                      </span>
                    ) : (
                      <span className="text-xs font-mono font-bold text-text-muted">
                        {chapterCompletedCount} / {chapter.verseCount} {t.progressPage.levelsLabel}
                      </span>
                    )}
                  </div>

                  <h3
                    lang="sa-Deva"
                    className="font-sanskrit text-lg font-bold text-text-primary"
                  >
                    {chapter.nameSanskrit}
                  </h3>
                  <p className="text-xs font-bold text-text-muted uppercase font-sans line-clamp-1">
                    {chapterName}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t-2 border-border-strong">
                  <div className="w-full h-2 rounded-neo-sm bg-background border-2 border-border-strong overflow-hidden p-0.2">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? "bg-success" : "bg-accent"
                      }`}
                      style={{ width: `${chapterPercent}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-mono font-bold text-text-muted">
                      {chapterPercent}% {t.progressPage.completeLabel}
                    </span>
                    <Link
                      href={`/journey/chapter/${chapter.number}`}
                      className="neo-btn-secondary px-3 py-1 text-xs inline-flex items-center gap-1 font-bold"
                    >
                      <span>{t.progressPage.exploreBtn}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. Danger Zone: Reset Progress */}
      <section className="pt-6 border-t-2 border-border-strong" aria-labelledby="reset-section-heading">
        <div className="neo-card p-6 bg-surface border-danger flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <h3 id="reset-section-heading" className="text-sm font-black uppercase text-danger">
              {t.progressPage.dangerTitle}
            </h3>
            <p className="text-xs text-text-secondary max-w-lg font-sans">
              {t.progressPage.dangerDesc}
            </p>
          </div>

          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetProgress}
                className="neo-btn bg-danger text-white border-border-strong px-4 py-2 text-xs font-black shadow-neo-sm"
              >
                {t.progressPage.confirmResetBtn}
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="neo-btn-secondary px-4 py-2 text-xs font-bold"
              >
                {t.progressPage.cancelBtn}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="neo-btn bg-surface border-danger text-danger hover:bg-danger/10 px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.progressPage.resetProgressBtn}</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
