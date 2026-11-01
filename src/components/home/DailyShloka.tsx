"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Share2, Check, BookOpen } from "lucide-react";
import { getDailyShloka } from "@/lib/daily-shloka";
import { getChapter } from "@/lib/gita-data";
import { Verse, Chapter } from "@/types/gita";
import { useReaderPreferences } from "@/hooks/useReaderPreferences";

export function DailyShloka() {
  const [verse, setVerse] = useState<Verse | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [copied, setCopied] = useState(false);
  const { language } = useReaderPreferences();

  useEffect(() => {
    const daily = getDailyShloka(new Date());
    setVerse(daily);
    const ch = getChapter(daily.chapter);
    if (ch) setChapter(ch);
  }, []);

  const handleCopy = () => {
    if (!verse) return;
    const textToCopy = `${verse.sanskrit}\n\n— Shrimad Bhagavad Gita (${verse.chapter}.${verse.verse})`;
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!verse || !chapter) {
    return (
      <section className="w-full my-8">
        <div className="neo-card p-8 animate-pulse h-64" />
      </section>
    );
  }

  const meaning =
    language === "hi" && verse.translations.hindi
      ? verse.translations.hindi.text
      : verse.translations.english?.text || verse.translations.hindi?.text;

  return (
    <section className="w-full my-8">
      <div className="neo-card p-6 sm:p-8 space-y-6">
        {/* Header Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-border-strong pb-4">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-neo-sm bg-accent text-accent-contrast border-2 border-border-strong">
              <Sparkles className="w-4 h-4 fill-current" />
            </span>
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-text-primary">
              Daily Wisdom · दैनिक श्लोक
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="neo-badge bg-surface-secondary text-text-primary px-3 py-1">
              Chapter {verse.chapter} · Verse {verse.verse}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              title="Copy Shloka text"
              className="p-1.5 rounded-neo-sm bg-surface border-2 border-border-strong text-text-primary hover:bg-surface-hover shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
              aria-label="Copy Daily Shloka"
            >
              {copied ? <Check className="w-4 h-4 text-success" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Chapter title */}
        <div>
          <h2 className="text-xs sm:text-sm font-mono uppercase font-bold text-text-muted">
            Chapter {chapter.number}: {chapter.nameEnglish} ({chapter.nameSanskrit})
          </h2>
        </div>

        {/* Sanskrit Verse Display */}
        <div className="p-6 rounded-neo-sm bg-background border-2 border-border-strong text-center space-y-3">
          <p
            lang="sa-Deva"
            className="font-sanskrit text-lg sm:text-2xl font-bold text-text-primary leading-relaxed whitespace-pre-line"
          >
            {verse.sanskrit}
          </p>
          {verse.transliteration && (
            <p
              lang="sa-Latn"
              className="text-xs sm:text-sm text-text-muted italic max-w-2xl mx-auto leading-relaxed font-sans"
            >
              {verse.transliteration}
            </p>
          )}
        </div>

        {/* Meaning Box */}
        {meaning && (
          <div className="p-4 rounded-neo-sm bg-surface-secondary border-2 border-border-strong">
            <div className="text-[11px] font-mono font-bold uppercase text-accent mb-1">
              {language === "hi" ? "हिंदी भावार्थ" : "English Meaning"}
            </div>
            <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
              {meaning}
            </p>
          </div>
        )}

        {/* Action Link */}
        <div className="flex justify-end pt-2">
          <Link
            href={`/learn/${verse.chapter}/${verse.verse}`}
            className="neo-btn-primary px-5 py-2.5 text-xs inline-flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>Open Learning Room {verse.chapter}.{verse.verse}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
