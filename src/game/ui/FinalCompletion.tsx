'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import { GameProgress } from '../types/progression';
import { SaveManager } from '../progression/SaveManager';
import { AchievementService } from '../progression/AchievementService';
import { Crown, Sparkles, Trophy, RotateCcw, Compass } from 'lucide-react';

interface FinalCompletionProps {
  progress: GameProgress;
  onResetProgress?: () => void;
}

export const FinalCompletion: React.FC<FinalCompletionProps> = ({
  progress,
  onResetProgress
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const rank = AchievementService.getRankForXP(progress.totalXP);

  useEffect(() => {
    try {
      const end = Date.now() + 3000;
      const interval: NodeJS.Timeout = setInterval(() => {
        if (Date.now() > end) {
          return clearInterval(interval);
        }
        confetti({
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: ['#a3e635', '#84cc16', '#f59e0b', '#22c55e', '#38bdf8']
        });
      }, 350);
    } catch {
      // Ignored
    }
  }, []);

  const handleResetConfirm = () => {
    SaveManager.resetProgress();
    if (onResetProgress) {
      onResetProgress();
    } else {
      window.location.href = '/journey';
    }
  };

  return (
    <div className="relative w-full max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-center animate-in fade-in duration-300">
      {/* Neo Card Hero */}
      <div className="neo-card p-8 sm:p-12 space-y-8 shadow-neo-lg">
        {/* Crown Icon */}
        <div className="w-20 h-20 rounded-neo bg-accent text-accent-contrast border-2 border-border-strong flex items-center justify-center mx-auto shadow-neo">
          <Crown className="w-10 h-10 fill-current animate-pulse" />
        </div>

        {/* Main Announcement */}
        <div className="space-y-3">
          <div className="neo-badge bg-surface-secondary text-accent px-3.5 py-1 text-xs">
            AVYAKTA — THE SACRED CURRICULUM
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-text-primary uppercase tracking-tight font-sans">
            The Journey is Complete
          </h1>
          <p className="text-base sm:text-lg text-text-primary font-sanskrit leading-relaxed max-w-2xl mx-auto font-bold">
            &ldquo;यत्र योगेश्वरः कृष्णो यत्र पार्थो धनुर्धरः।<br />
            तत्र श्रीर्विजयो भूतिर्ध्रुवा नीतिर्मतिर्मम॥&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl mx-auto font-sans">
            Wherever there is Sri Krishna, the Lord of Yoga, and Arjuna, the dedicated seeker of truth, there will surely be divine wealth, victory, prosperity, and unwavering righteousness. (Gita 18.78)
          </p>
        </div>

        {/* 3 Pillars Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          <div className="neo-card p-5 bg-surface-secondary shadow-neo-sm space-y-1">
            <div className="text-3xl font-black text-text-primary font-mono">18</div>
            <div className="text-xs uppercase font-mono font-bold text-text-muted">
              Chapters Mastered
            </div>
          </div>

          <div className="neo-card p-5 bg-surface-secondary shadow-neo-sm space-y-1">
            <div className="text-3xl font-black text-accent font-mono">700</div>
            <div className="text-xs uppercase font-mono font-bold text-text-muted">
              Shlokas Studied
            </div>
          </div>

          <div className="neo-card p-5 bg-surface-secondary shadow-neo-sm space-y-1">
            <div className="text-3xl font-black text-success font-mono">100%</div>
            <div className="text-xs uppercase font-mono font-bold text-text-muted">
              Journey Completed
            </div>
          </div>
        </div>

        {/* Learner Rank Showcase */}
        <div className="p-4 rounded-neo bg-background border-2 border-border-strong max-w-md mx-auto flex items-center justify-center gap-3">
          <span className="text-2xl">{rank.badge}</span>
          <div className="text-left">
            <div className="text-xs font-mono font-bold text-text-muted uppercase">Final Learner Rank</div>
            <div className="text-sm font-black text-text-primary uppercase">{rank.title} ({rank.titleSanskrit})</div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/journey"
            className="neo-btn-primary px-8 py-3.5 text-xs sm:text-sm inline-flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Review Full Journey Map</span>
          </Link>

          <Link
            href="/achievements"
            className="neo-btn-secondary px-8 py-3.5 text-xs sm:text-sm inline-flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" />
            <span>View All Badges</span>
          </Link>
        </div>

        {/* Reset Progress Section */}
        <div className="pt-6 border-t-2 border-border-strong max-w-md mx-auto">
          {showResetConfirm ? (
            <div className="space-y-3">
              <p className="text-xs text-danger font-mono font-bold">
                Are you sure you want to restart your journey from Level 1.1?
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleResetConfirm}
                  className="neo-btn bg-danger text-white border-border-strong px-4 py-2 text-xs font-black"
                >
                  Confirm Restart
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  className="neo-btn-secondary px-4 py-2 text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="text-xs font-mono font-bold text-text-muted hover:text-danger uppercase inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Begin a New Journey (Reset)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
