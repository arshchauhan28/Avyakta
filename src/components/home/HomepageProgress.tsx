"use client";

import React from "react";
import Link from "next/link";
import { Compass, BookOpen, ArrowRight, Award } from "lucide-react";
import { useReadingProgress } from "@/hooks/useReadingProgress";

export function HomepageProgress() {
  const { isHydrated, completedVerses, overallProgress, lastRead } = useReadingProgress();

  if (!isHydrated) {
    return null;
  }

  const hasProgress = completedVerses.length > 0 || lastRead !== null;
  const continueUrl = lastRead ? `/read/${lastRead.chapter}/${lastRead.verse}` : "/read/1/1";

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10">
      <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-primary">
              <Award className="w-5 h-5 text-accent" />
              <h2 className="text-lg font-bold font-serif-sacred">
                Your Reading Journey · पठन यात्रा
              </h2>
            </div>

            {hasProgress ? (
              <p className="text-sm text-text-secondary">
                You have completed <strong className="text-text-primary">{overallProgress.completedCount}</strong> of 700 shlokas ({overallProgress.percentage}% complete).
              </p>
            ) : (
              <p className="text-sm text-text-secondary max-w-lg">
                Welcome to your sacred reading experience. Mark shlokas as read and bookmark meaningful verses to track your spiritual study.
              </p>
            )}

            {/* Progress Bar */}
            <div className="w-full max-w-md pt-2">
              <div className="w-full h-2.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(overallProgress.percentage, hasProgress ? 1 : 0))}%` }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={continueUrl}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent text-white font-semibold text-sm shadow-sm hover:bg-accent-hover transition-all"
            >
              {lastRead ? <Compass className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              <span>{lastRead ? `Continue (${lastRead.chapter}.${lastRead.verse})` : "Start Chapter 1"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/progress"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface border border-border text-text-secondary hover:text-text-primary font-medium text-sm transition-all"
            >
              <span>View Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
