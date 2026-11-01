'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SaveManager } from '@/game/progression/SaveManager';
import { AchievementService, LEARNER_RANKS } from '@/game/progression/AchievementService';
import { GameProgress } from '@/game/types/progression';
import { useTranslation } from '@/i18n/useTranslation';
import { Trophy, ArrowLeft, Sparkles, CheckCircle2, Lock, Zap } from 'lucide-react';

export default function AchievementsPage() {
  const { language, t } = useTranslation();
  const [progress, setProgress] = useState<GameProgress | null>(null);

  useEffect(() => {
    setProgress(SaveManager.loadProgress());
  }, []);

  if (!progress) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8 text-center text-accent">
        <Sparkles className="w-8 h-8 animate-spin mx-auto" />
      </div>
    );
  }

  const rank = AchievementService.getRankForXP(progress.totalXP);
  const nextRank = AchievementService.getNextRank(progress.totalXP);
  const achievements = AchievementService.getAllAchievementsWithStatus(progress.unlockedAchievementIds);

  const unlockedCount = achievements.filter((a) => a.unlockedAt).length;
  const progressToNextRank = nextRank
    ? Math.min(100, Math.max(0, ((progress.totalXP - rank.minXP) / (nextRank.minXP - rank.minXP)) * 100))
    : 100;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Top Breadcrumb */}
      <div>
        <Link
          href="/"
          className="neo-badge bg-surface text-text-primary px-3 py-1.5 inline-flex items-center gap-2 hover:bg-surface-hover hover:translate-x-[-1px] transition-all text-xs font-mono font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'hi' ? 'सीखने के डैशबोर्ड पर लौटें' : 'Back to Learning Dashboard'}</span>
        </Link>
      </div>

      {/* 2. Header & Rank Showcase */}
      <section className="neo-card p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6" aria-labelledby="achievements-heading">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 neo-badge bg-surface-secondary text-text-primary px-3 py-1">
            <Trophy className="w-4 h-4 text-accent" />
            <span>{t('achievements.subtitle')}</span>
          </div>
          <h1 id="achievements-heading" className="text-2xl sm:text-4xl font-black text-text-primary uppercase tracking-tight font-sans">
            {t('achievements.title')}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
            {language === 'hi'
              ? 'सभी 18 अध्यायों और 700 श्लोकों में अपनी शैक्षणिक उपलब्धियों को ट्रैक करें। अर्जित XP आपकी वास्तविक अध्ययन निष्ठा, आत्म-चिंतन और ज्ञान परीक्षा में सफलता को दर्शाता है।'
              : 'Track your educational milestones across all 18 chapters and 700 shlokas. XP reflects genuine reading engagement, philosophical contemplation, and mastery challenge completion.'}
          </p>
        </div>

        {/* Current Rank Card */}
        <div className="neo-card p-5 bg-surface-secondary flex items-center gap-4 shrink-0 min-w-[260px] shadow-neo-sm">
          <div className="w-14 h-14 rounded-neo-sm bg-surface border-2 border-border-strong flex items-center justify-center text-3xl shadow-neo-sm">
            {rank.badge}
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-text-muted">
              {language === 'hi' ? `वर्तमान पदवी · श्रेणी ${rank.tier}` : `Current Rank · Tier ${rank.tier}`}
            </span>
            <div className="text-base font-black text-text-primary uppercase">
              {language === 'hi' ? rank.titleSanskrit : rank.title}
            </div>
            <div className="text-xs font-sanskrit text-primary font-bold">{rank.titleSanskrit}</div>
            <div className="flex items-center gap-1 text-xs font-mono font-black text-accent pt-0.5">
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{progress.totalXP} XP</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Rank Progression Bar */}
      <section className="neo-card p-6 space-y-4" aria-labelledby="rank-progression-heading">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 id="rank-progression-heading" className="text-sm font-black text-text-primary uppercase font-sans">
              {language === 'hi' ? 'साधक पदवी प्रगति' : 'Curriculum Rank Progression'}
            </h2>
            <p className="text-xs text-text-secondary font-sans">
              {nextRank
                ? (language === 'hi'
                    ? `श्रेणी ${nextRank.tier} (${nextRank.titleSanskrit}) के लिए ${nextRank.minXP - progress.totalXP} XP आवश्यक है`
                    : `${nextRank.minXP - progress.totalXP} XP required to attain Tier ${nextRank.tier}: ${nextRank.title} (${nextRank.titleSanskrit})`)
                : (language === 'hi'
                    ? 'सर्वोच्च साधक पदवी प्राप्त! आपने सम्पूर्ण पाठ्यक्रम पूरा किया है।'
                    : 'Maximum learner rank achieved! You have mastered the full curriculum.')}
            </p>
          </div>
          <span className="text-xs font-mono font-black text-accent">
            {progressToNextRank.toFixed(0)}% {language === 'hi' ? 'अगली श्रेणी की ओर' : 'TO NEXT TIER'}
          </span>
        </div>

        <div className="w-full h-3 rounded-neo-sm bg-background border-2 border-border-strong overflow-hidden p-0.5">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${progressToNextRank}%` }}
          />
        </div>

        {/* 7 Learner Ranks Showcase */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
          {LEARNER_RANKS.map((r) => {
            const isAttained = progress.totalXP >= r.minXP;
            const isCurrent = rank.tier === r.tier;
            return (
              <div
                key={r.tier}
                className={`p-3 rounded-neo-sm border-2 text-center space-y-1 transition-all ${
                  isCurrent
                    ? 'border-accent bg-accent/20 text-text-primary shadow-neo-sm font-bold'
                    : isAttained
                    ? 'border-border-strong bg-surface text-text-primary'
                    : 'border-border bg-surface/40 text-text-muted opacity-50'
                }`}
              >
                <div className="text-2xl">{r.badge}</div>
                <div className="text-xs font-black uppercase truncate">
                  {language === 'hi' ? r.titleSanskrit : r.title}
                </div>
                <div className="text-[10px] text-text-muted font-mono font-bold">{r.minXP} XP</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Badges Grid */}
      <section className="space-y-4" aria-labelledby="milestones-heading">
        <div className="flex items-center justify-between">
          <h2 id="milestones-heading" className="text-base font-black text-text-primary uppercase tracking-wide">
            {language === 'hi'
              ? `उपलब्धि पदक (${unlockedCount} / ${achievements.length} अनलॉक)`
              : `Milestone Badges (${unlockedCount} / ${achievements.length} Unlocked)`}
          </h2>
          <span className="text-xs font-mono font-bold uppercase text-accent">
            {language === 'hi' ? 'स्थायी उपलब्धि' : 'Permanent Save Attribution'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((ach) => {
            const isUnlocked = Boolean(ach.unlockedAt);
            const titleDisplay = language === 'hi' ? ach.titleHindi : ach.title;
            const descDisplay = language === 'hi' ? (ach.descriptionHindi || ach.description) : ach.description;

            return (
              <div
                key={ach.id}
                className={`neo-card p-5 flex items-start gap-4 transition-all ${
                  isUnlocked
                    ? 'border-border-strong bg-surface shadow-neo-sm'
                    : 'border-border bg-surface/50 opacity-60'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-neo-sm flex items-center justify-center text-2xl shrink-0 border-2 ${
                    isUnlocked
                      ? 'border-border-strong bg-accent/20 text-text-primary shadow-neo-sm'
                      : 'border-border bg-background text-text-muted'
                  }`}
                >
                  {isUnlocked ? ach.icon : <Lock className="w-5 h-5 text-text-muted" />}
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-text-primary uppercase truncate">
                      {titleDisplay}
                    </h3>
                    {isUnlocked && (
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    )}
                  </div>
                  <div className="text-xs font-sanskrit text-primary font-bold">
                    {ach.titleHindi}
                  </div>
                  <p className="text-xs text-text-secondary leading-snug font-sans">
                    {descDisplay}
                  </p>
                  {isUnlocked && ach.unlockedAt && (
                    <div className="text-[10px] text-text-muted font-mono pt-1">
                      {language === 'hi'
                        ? `अनलॉक: ${new Date(ach.unlockedAt).toLocaleDateString('hi-IN')}`
                        : `Unlocked on ${new Date(ach.unlockedAt).toLocaleDateString()}`}
                    </div>
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
