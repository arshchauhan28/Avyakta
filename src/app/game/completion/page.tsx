'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SaveManager } from '@/game/progression/SaveManager';
import { GameProgress } from '@/game/types/progression';
import { FinalCompletion } from '@/game/ui/FinalCompletion';
import { Sparkles, ArrowLeft } from 'lucide-react';

export default function CompletionPage() {
  const [progress, setProgress] = useState<GameProgress | null>(null);

  useEffect(() => {
    setProgress(SaveManager.loadProgress());
  }, []);

  if (!progress) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-accent">
        <Sparkles className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background text-text-primary py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/journey"
          className="neo-badge bg-surface text-text-primary px-3 py-1.5 inline-flex items-center gap-2 hover:bg-surface-hover hover:translate-x-[-1px] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Journey</span>
        </Link>

        {/* Grand Finale Card */}
        <FinalCompletion progress={progress} />
      </div>
    </div>
  );
}
