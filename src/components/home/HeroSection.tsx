"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { BookOpen, Compass, ArrowRight, Sparkles } from "lucide-react";
import { useReadingProgress } from "@/hooks/useReadingProgress";

export function HeroSection() {
  const { lastRead, isHydrated } = useReadingProgress();

  const continueUrl =
    isHydrated && lastRead ? `/read/${lastRead.chapter}/${lastRead.verse}` : null;

  return (
    <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Text Content */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-soft/80 border border-accent/20 text-xs font-semibold text-primary">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>Sanatana Dharma · Authentic 700 Shlokas</span>
            </div>

            <div className="space-y-2">
              <h1 className="font-sanskrit text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary tracking-tight leading-tight">
                श्रीमद्भगवद्गीता
              </h1>
              <p className="text-xl sm:text-2xl font-serif-sacred text-primary font-medium tracking-wide">
                Ancient Wisdom for Everyday Life
              </p>
            </div>

            <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Explore the timeless wisdom of the Bhagavad Gita through its original Sanskrit verses, meaningful Hindi and English translations, word-by-word meanings, and a peaceful reading experience.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/read/1/1"
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-accent text-white font-semibold text-base shadow-md hover:bg-accent-hover hover:shadow-lg transition-all transform active:scale-95"
              >
                <BookOpen className="w-5 h-5" />
                <span>Begin Reading</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              {continueUrl ? (
                <Link
                  href={continueUrl}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-surface border-2 border-accent/40 text-text-primary font-semibold text-base shadow-sm hover:border-accent hover:bg-accent-soft/30 transition-all transform active:scale-95"
                >
                  <Compass className="w-5 h-5 text-accent" />
                  <span>Continue ({lastRead?.chapter}.{lastRead?.verse})</span>
                </Link>
              ) : (
                <Link
                  href="/chapters"
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-surface border border-border text-text-secondary font-medium text-base hover:text-text-primary hover:border-accent/40 hover:bg-black/5 dark:hover:bg-white/5 transition-all"
                >
                  <Compass className="w-5 h-5 opacity-70" />
                  <span>Explore Chapters</span>
                </Link>
              )}
            </div>

            {/* Scripture Overview Quick Badges */}
            <div className="pt-6 border-t border-border/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-extrabold text-primary font-serif-sacred">
                  18
                </div>
                <div className="text-xs sm:text-sm text-text-secondary font-medium">Chapters</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-extrabold text-accent font-serif-sacred">
                  700
                </div>
                <div className="text-xs sm:text-sm text-text-secondary font-medium">Shlokas</div>
              </div>
              <div className="text-center lg:text-left">
                <div className="text-2xl sm:text-3xl font-extrabold text-primary font-serif-sacred">
                  ∞
                </div>
                <div className="text-xs sm:text-sm text-text-secondary font-medium">Timeless Wisdom</div>
              </div>
            </div>
          </div>

          {/* Sacred Artwork Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md lg:max-w-none rounded-2xl overflow-hidden shadow-xl border-4 border-surface ring-1 ring-border group">
              <div className="aspect-[16/10] sm:aspect-[16/10] relative">
                <Image
                  src="/images/hero/krishna-arjuna.jpg"
                  alt="Lord Krishna imparting sacred wisdom to warrior Arjuna at Kurukshetra"
                  fill
                  priority
                  className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="p-4 bg-surface/95 backdrop-blur-sm border-t border-border">
                <p className="text-xs font-serif-sacred text-primary font-semibold text-center tracking-wider uppercase">
                  कुरुक्षेत्र · The Dialogue at Kurukshetra
                </p>
                <p className="text-[11px] text-text-muted text-center mt-0.5">
                  Lord Krishna enlightening Arjuna with eternal truth
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
