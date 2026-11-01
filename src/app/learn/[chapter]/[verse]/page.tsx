'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getChapter, getVerse } from '@/lib/gita-data';
import { getLevelById, getPreviousLevel, getNextLevel } from '@/game/content/levels';
import { getLifeLessonByVerseId } from '@/game/content/life-lessons';
import { getWorldByChapter } from '@/game/content/worlds';
import { SaveManager } from '@/game/progression/SaveManager';
import { ProgressionService, LevelCompletionResult } from '@/game/progression/ProgressionService';
import { GameProgress } from '@/game/types/progression';
import { apiClient } from '@/lib/api';
import { ChallengeEngine } from '@/game/challenges/ChallengeEngine';
import { useReaderPreferences } from '@/hooks/useReaderPreferences';
import { useTranslation } from '@/i18n/useTranslation';
import confetti from 'canvas-confetti';
import {
  BookOpen,
  Brain,
  Target,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Lock,
  Volume2,
  VolumeX,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  HeartHandshake,
  Lightbulb,
  HelpCircle,
  Trophy,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface LearnRoomPageProps {
  params: Promise<{ chapter: string; verse: string }>;
}

export default function LearnRoomPage({ params }: LearnRoomPageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const chapterNum = parseInt(resolvedParams.chapter, 10);
  const verseNum = parseInt(resolvedParams.verse, 10);

  const { t, language } = useTranslation();

  // Client hydration guard to prevent premature locked flash
  const [mounted, setMounted] = useState(false);
  const [progress, setProgress] = useState<GameProgress>(() => SaveManager.createDefaultProgress());

  // Preferences & Audio
  const { showTransliteration } = useReaderPreferences();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showWordMeanings, setShowWordMeanings] = useState(false);

  // Active accordion task tab (1, 2, or 3)
  const [activeTask, setActiveTask] = useState<number>(1);

  // Task 2: Understanding interactive assessment state
  const [selectedUnderstandingOption, setSelectedUnderstandingOption] = useState<string | null>(null);
  const [understandingSubmitted, setUnderstandingSubmitted] = useState<boolean>(false);
  const [understandingFeedback, setUnderstandingFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Level Completion Modal State
  const [completionModal, setCompletionModal] = useState<LevelCompletionResult | null>(null);
  const [isSubmittingCompletion, setIsSubmittingCompletion] = useState<boolean>(false);

  // Resolve dynamic entities
  const chapter = getChapter(chapterNum);
  const verse = getVerse(chapterNum, verseNum);
  const level = getLevelById(`${chapterNum}.${verseNum}`);
  const world = getWorldByChapter(chapterNum);
  const lifeLesson = level ? getLifeLessonByVerseId(level.id) : undefined;
  const prevLvl = level ? getPreviousLevel(level.id) : null;
  const nextLvl = level ? getNextLevel(level.id) : null;

  // Track room state
  const [roomProgress, setRoomProgress] = useState(() =>
    level ? SaveManager.getRoomProgress(level.id, progress) : null
  );

  useEffect(() => {
    const loadedProgress = SaveManager.loadProgress();
    setProgress(loadedProgress);
    if (level) {
      const rp = SaveManager.getRoomProgress(level.id, loadedProgress);
      setRoomProgress(rp);
      if (rp.tasks.reading && !rp.tasks.understanding) {
        setActiveTask(2);
      } else if (rp.tasks.reading && rp.tasks.understanding) {
        setActiveTask(3);
      }
    }
    setMounted(true);
  }, [chapterNum, verseNum, level]);

  // Loading skeleton while mounting
  if (!mounted) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-surface border-2 border-border-strong rounded-neo-sm" />
        <div className="h-44 bg-surface border-2 border-border-strong rounded-neo" />
        <div className="h-96 bg-surface border-2 border-border-strong rounded-neo" />
      </div>
    );
  }

  // Handle missing verse / level
  if (!chapter || !level || !verse) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
        <h2 className="text-xl font-black text-text-primary uppercase">
          {language === 'hi' ? 'श्लोक कक्ष उपलब्ध नहीं है' : 'Shloka Room Not Found'}
        </h2>
        <p className="text-sm text-text-secondary">
          {language === 'hi'
            ? `अध्याय ${chapterNum}, श्लोक ${verseNum} अधिकृत पाठ्यक्रम में उपलब्ध नहीं है।`
            : `Chapter ${chapterNum}, Shloka ${verseNum} does not exist in the canonical curriculum.`}
        </p>
        <Link
          href="/journey"
          className="neo-btn-primary px-6 py-2.5 text-xs inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.journey.backToJourney}</span>
        </Link>
      </div>
    );
  }

  // Sequential progression check
  const isUnlocked = ProgressionService.isLevelUnlocked(level.id, progress);

  if (!isUnlocked) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5 max-w-lg mx-auto">
        <div className="w-16 h-16 rounded-neo bg-background border-2 border-border-strong flex items-center justify-center text-text-muted shadow-neo">
          <Lock className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <div className="neo-badge bg-surface-secondary text-text-muted px-3 py-1">
            LEVEL {level.globalIndex} · {t.achievements.lockedBadge}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-text-primary uppercase">
            {t.learningRoom.roomLocked} ({level.id})
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {t.learningRoom.roomLockedDesc}
          </p>
        </div>
        <Link
          href={progress.currentLevelId ? `/learn/${progress.currentLevelId.replace('.', '/')}` : '/journey'}
          className="neo-btn-primary px-6 py-3 text-xs inline-flex items-center gap-2"
        >
          <span>{t.learningRoom.resumeLevel} ({progress.currentLevelId || '1.1'})</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  if (!roomProgress) return null;

  const completedTaskCount = [
    roomProgress.tasks.reading,
    roomProgress.tasks.understanding,
    roomProgress.tasks.challenge
  ].filter(Boolean).length;

  // Localized Titles
  const localizedLevelTitle =
    language === 'hi' && level.titleHindi ? level.titleHindi : level.title;
  const localizedChapterTitle =
    language === 'hi' && world?.displayNameHindi
      ? world.displayNameHindi
      : chapter.nameEnglish;

  // --- Task 1: Complete Reading Handler ---
  const handleCompleteReading = () => {
    const updated = ProgressionService.updateRoomTask(level.id, 'reading', true, progress);
    setProgress(updated);
    setRoomProgress(SaveManager.getRoomProgress(level.id, updated));
    setActiveTask(2);
    // Cloud sync in background
    apiClient.completeTask({ levelId: level.id, taskId: 'task1' }).catch(() => {});
  };

  // --- Task 2: Verify & Complete Understanding ---
  const handleVerifyUnderstanding = () => {
    if (!selectedUnderstandingOption || !lifeLesson) return;
    const isCorrect = selectedUnderstandingOption === lifeLesson.understandingCheck.correctAnswerId;
    setUnderstandingSubmitted(true);
    if (isCorrect) {
      const correctMsg =
        language === 'hi' && lifeLesson.understandingCheck.feedbackHindi
          ? lifeLesson.understandingCheck.feedbackHindi
          : lifeLesson.understandingCheck.feedback ||
            (language === 'hi'
              ? 'सत्य! आपने इस श्लोक की शिक्षा एवं उसके व्यावहारिक अनुप्रयोग को भली-भाँति समझा है।'
              : 'Correct! You have accurately understood the teaching and its real-life application.');
      setUnderstandingFeedback({
        isCorrect: true,
        message: correctMsg
      });
      const updated = ProgressionService.updateRoomTask(level.id, 'understanding', true, progress);
      setProgress(updated);
      setRoomProgress(SaveManager.getRoomProgress(level.id, updated));
      // Cloud sync in background
      apiClient.completeTask({ levelId: level.id, taskId: 'task2' }).catch(() => {});
    } else {
      const incorrectMsg =
        language === 'hi'
          ? 'यह विकल्प इस श्लोक के वास्तविक भाव को सटीक रूप से व्यक्त नहीं करता। ऊपर दी गई गहन व्याख्या और जीवन से जुड़ाव को पुनः पढ़ें और पुनः प्रयास करें।'
          : 'That choice does not accurately reflect the authentic wisdom of this verse. Review the deeper explanation and real-life application above, then try again.';
      setUnderstandingFeedback({
        isCorrect: false,
        message: incorrectMsg
      });
    }
  };

  const handleRetryUnderstanding = () => {
    setSelectedUnderstandingOption(null);
    setUnderstandingSubmitted(false);
    setUnderstandingFeedback(null);
  };

  // --- Task 3: Complete Knowledge Challenge & Level ---
  const handleChallengePass = (score: number) => {
    if (isSubmittingCompletion) return;
    setIsSubmittingCompletion(true);
    try {
      const updatedProg = ProgressionService.updateRoomTask(level.id, 'challenge', true, progress);
      const result = ProgressionService.completeLevel(level, score, updatedProg);
      setProgress(result.updatedProgress);
      setRoomProgress(SaveManager.getRoomProgress(level.id, result.updatedProgress));

      // Cloud sync in background
      apiClient.completeTask({
        levelId: level.id,
        taskId: 'task3',
        perfectChallenge: score === 100
      }).catch(() => {});

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Ignored in non-DOM/test environments
      }

      setCompletionModal(result);
    } finally {
      setIsSubmittingCompletion(false);
    }
  };

  // Audio synthesis: hooks to saved recitation volume
  const handlePlayAudio = () => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      return;
    }
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(verse.sanskrit);
      utterance.lang = 'hi-IN';
      utterance.rate = 0.85;
      utterance.volume = (progress.settings.recitationVolume ?? 100) / 100;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      setIsPlayingAudio(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleCopy = () => {
    const text = `${verse.sanskrit}\n\n${verse.translations.hindi?.text || ''}\n\n${verse.translations.english?.text || ''}\n— Shrimad Bhagavad Gita (${level.id})`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="w-full flex flex-col min-h-screen bg-background">
      {/* Top Breadcrumb & Quick Subnav */}
      <div className="w-full bg-navbar border-b-2 border-border-strong px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono">
          <Link
            href={`/journey/chapter/${chapter.number}`}
            className="text-text-secondary hover:text-accent font-bold uppercase transition-colors"
          >
            {t.progressPage.chapterLabel} {chapter.number} {t.learningRoom.chapterModule}
          </Link>
          <span className="text-text-muted">/</span>
          <span className="text-text-primary font-black uppercase">
            {t.learningRoom.roomTitle} {level.id}
          </span>
          <span className="text-text-muted truncate hidden md:inline font-sans">
            · {localizedLevelTitle}
          </span>
        </div>

        {/* Task Progress & Next/Prev Controls */}
        <div className="flex items-center gap-3">
          <div className="neo-badge bg-surface text-text-primary px-3 py-1 text-xs">
            <span className="text-text-muted hidden sm:inline">{t.learningRoom.tasksProgress}: </span>
            <span className="text-accent font-black">{completedTaskCount}/3 {language === 'hi' ? 'कार्य' : 'Tasks'}</span>
          </div>

          <div className="flex items-center gap-1.5">
            {prevLvl && (
              <Link
                href={`/learn/${prevLvl.chapter}/${prevLvl.verse}`}
                className="p-1.5 rounded-neo-sm bg-surface border-2 border-border-strong text-text-primary hover:bg-surface-hover shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
                title={`${t.learningRoom.prevRoom}: ${prevLvl.id}`}
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
            )}
            {nextLvl && ProgressionService.isLevelUnlocked(nextLvl.id, progress) && (
              <Link
                href={`/learn/${nextLvl.chapter}/${nextLvl.verse}`}
                className="p-1.5 rounded-neo-sm bg-surface border-2 border-border-strong text-text-primary hover:bg-surface-hover shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
                title={`${t.learningRoom.nextRoom}: ${nextLvl.id}`}
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Focused Educational Workspace */}
      <div className="max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        {/* Room Header Hero Card */}
        <div className="neo-card p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="neo-badge bg-accent text-accent-contrast px-2.5 py-0.5 text-xs font-black">
                  {t.learningRoom.roomTitle} {level.id}
                </span>
                <span className="text-xs font-sanskrit text-primary font-bold">
                  {chapter.nameSanskrit} · {language === 'hi' ? `श्लोक ${verseNum}` : `Shloka ${verseNum}`}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-text-primary uppercase tracking-tight font-sans">
                {localizedLevelTitle}
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans max-w-2xl">
                {t.progressPage.chapterLabel} {chapter.number}: {localizedChapterTitle} ({chapter.meaning})
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
              {(() => {
                const expectedReward = ProgressionService.getExpectedLevelReward(level, progress);
                return (
                  <div className="neo-card p-2.5 bg-surface-secondary text-center min-w-[80px] shadow-neo-sm">
                    <div className="text-[10px] uppercase font-mono font-bold text-text-muted">{t.learningRoom.reward}</div>
                    <div className={`text-sm font-black font-mono ${expectedReward.isFirstCompletion ? 'text-accent' : 'text-text-muted'}`}>
                      {expectedReward.displayReward}
                    </div>
                  </div>
                );
              })()}
              <div className="neo-card p-2.5 bg-surface-secondary text-center min-w-[80px] shadow-neo-sm">
                <div className="text-[10px] uppercase font-mono font-bold text-text-muted">{t.learningRoom.status}</div>
                <div className={`text-sm font-black font-mono ${roomProgress.completed ? 'text-success' : 'text-text-primary'}`}>
                  {roomProgress.completed ? (language === 'hi' ? 'पूर्ण' : 'Complete') : `${completedTaskCount}/3`}
                </div>
              </div>
            </div>
          </div>

          {/* 3-Step Visual Progress Indicator */}
          <div className="pt-3 border-t-2 border-border-strong">
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Step 1 */}
              <button
                type="button"
                onClick={() => setActiveTask(1)}
                className={`p-2.5 rounded-neo-sm border-2 text-left font-mono text-xs font-bold transition-all ${
                  roomProgress.tasks.reading
                    ? 'border-success bg-success/15 text-text-primary shadow-neo-sm'
                    : activeTask === 1
                    ? 'border-accent bg-accent/20 text-text-primary shadow-neo-sm font-black'
                    : 'border-border-strong bg-background text-text-muted hover:border-accent'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {roomProgress.tasks.reading ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  ) : (
                    <span>1.</span>
                  )}
                  <span className="truncate uppercase">{t.learningRoom.task1Title}</span>
                </div>
              </button>

              {/* Step 2 */}
              <button
                type="button"
                onClick={() => roomProgress.tasks.reading && setActiveTask(2)}
                disabled={!roomProgress.tasks.reading}
                className={`p-2.5 rounded-neo-sm border-2 text-left font-mono text-xs font-bold transition-all ${
                  roomProgress.tasks.understanding
                    ? 'border-success bg-success/15 text-text-primary shadow-neo-sm'
                    : activeTask === 2
                    ? 'border-accent bg-accent/20 text-text-primary shadow-neo-sm font-black'
                    : roomProgress.tasks.reading
                    ? 'border-border-strong bg-background text-text-secondary hover:border-accent'
                    : 'border-border bg-background/50 text-text-muted opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {roomProgress.tasks.understanding ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  ) : !roomProgress.tasks.reading ? (
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <span>2.</span>
                  )}
                  <span className="truncate uppercase">{t.learningRoom.task2Title}</span>
                </div>
              </button>

              {/* Step 3 */}
              <button
                type="button"
                onClick={() => roomProgress.tasks.understanding && setActiveTask(3)}
                disabled={!roomProgress.tasks.understanding}
                className={`p-2.5 rounded-neo-sm border-2 text-left font-mono text-xs font-bold transition-all ${
                  roomProgress.tasks.challenge
                    ? 'border-success bg-success/15 text-text-primary shadow-neo-sm'
                    : activeTask === 3
                    ? 'border-accent bg-accent/20 text-text-primary shadow-neo-sm font-black'
                    : roomProgress.tasks.understanding
                    ? 'border-border-strong bg-background text-text-secondary hover:border-accent'
                    : 'border-border bg-background/50 text-text-muted opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {roomProgress.tasks.challenge ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />
                  ) : !roomProgress.tasks.understanding ? (
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <span>3.</span>
                  )}
                  <span className="truncate uppercase">{t.learningRoom.task3Title}</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TASK 1: READ THE SHLOKA (AUTHENTIC SANSKRIT ALWAYS IN DEVANAGARI)         */}
        {/* ========================================================================= */}
        <div className="neo-card overflow-hidden">
          <button
            type="button"
            onClick={() => setActiveTask(activeTask === 1 ? 0 : 1)}
            className="w-full px-6 py-4 flex items-center justify-between gap-4 bg-surface hover:bg-surface-hover transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-neo-sm border-2 border-border-strong flex items-center justify-center text-xs font-bold shadow-neo-sm ${
                  roomProgress.tasks.reading
                    ? 'bg-success text-white'
                    : 'bg-accent text-accent-contrast'
                }`}
              >
                {roomProgress.tasks.reading ? <CheckCircle2 className="w-4 h-4" /> : <BookOpen className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-accent">
                    {t.learningRoom.task1Number}
                  </span>
                  <span className="text-sm font-black text-text-primary uppercase">
                    {t.learningRoom.task1Title}
                  </span>
                </div>
                <p className="text-xs text-text-secondary font-sans">
                  {t.learningRoom.task1Subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {roomProgress.tasks.reading && (
                <span className="neo-badge bg-success/20 text-success border-success px-2.5 py-0.5 text-xs hidden sm:inline">
                  {language === 'hi' ? 'पूर्ण' : 'Completed'}
                </span>
              )}
              {activeTask === 1 ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
            </div>
          </button>

          {activeTask === 1 && (
            <div className="p-6 sm:p-8 space-y-6 border-t-2 border-border-strong animate-in fade-in duration-200">
              {/* Scripture Card */}
              <div className="p-6 rounded-neo bg-background border-2 border-border-strong space-y-4">
                <div className="flex items-center justify-between pb-3 border-b-2 border-border-strong">
                  <span className="text-xs font-mono font-black uppercase text-accent">
                    {language === 'hi' ? `श्लोक ${chapterNum}.${verseNum}` : `SHLOKA ${chapterNum}.${verseNum}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePlayAudio}
                      className={`p-2 rounded-neo-sm border-2 border-border-strong text-xs font-bold shadow-neo-sm flex items-center gap-1.5 transition-all ${
                        isPlayingAudio
                          ? 'bg-accent text-accent-contrast'
                          : 'bg-surface text-text-primary hover:bg-surface-hover'
                      }`}
                      title={isPlayingAudio ? t.learningRoom.stopAudio : t.learningRoom.listenAudio}
                    >
                      {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline font-mono uppercase">{isPlayingAudio ? t.learningRoom.stopAudio : t.learningRoom.listenAudio}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="p-2 rounded-neo-sm bg-surface border-2 border-border-strong text-text-primary hover:bg-surface-hover shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
                      title={t.learningRoom.copySanskrit}
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Sanskrit Devanagari - Always Authentic Sanskrit */}
                <div className="py-2 text-center">
                  <p
                    lang="sa"
                    className="font-sanskrit sanskrit-verse font-bold text-text-primary whitespace-pre-line tracking-wide"
                  >
                    {verse.sanskrit}
                  </p>
                </div>

                {/* Transliteration */}
                {showTransliteration && verse.transliteration && (
                  <div className="pt-3 border-t-2 border-border-strong text-center">
                    <p lang="sa-Latn" className="text-xs sm:text-sm text-text-muted italic leading-relaxed font-sans">
                      {verse.transliteration}
                    </p>
                  </div>
                )}
              </div>

              {/* Translations (Prioritized by Selected Website Language) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Hindi Meaning */}
                {verse.translations.hindi && (
                  <div className={`p-5 rounded-neo bg-surface border-2 ${language === 'hi' ? 'border-accent shadow-neo' : 'border-border-strong shadow-neo-sm'} space-y-2`}>
                    <div className="flex items-center justify-between text-xs font-bold text-accent font-mono uppercase">
                      <span>{t.learningRoom.hindiMeaningTitle}</span>
                      {verse.translations.hindi.author && (
                        <span className="text-[10px] text-text-muted font-sans font-normal">
                          {t.learningRoom.translationBy}: {verse.translations.hindi.author}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-text-primary leading-relaxed font-sans">
                      {verse.translations.hindi.text}
                    </p>
                  </div>
                )}

                {/* English Meaning */}
                {verse.translations.english && (
                  <div className={`p-5 rounded-neo bg-surface border-2 ${language === 'en' ? 'border-accent shadow-neo' : 'border-border-strong shadow-neo-sm'} space-y-2`}>
                    <div className="flex items-center justify-between text-xs font-bold text-accent font-mono uppercase">
                      <span>{t.learningRoom.englishMeaningTitle}</span>
                      {verse.translations.english.author && (
                        <span className="text-[10px] text-text-muted font-sans font-normal">
                          {t.learningRoom.translationBy}: {verse.translations.english.author}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-text-primary leading-relaxed font-sans">
                      {verse.translations.english.text}
                    </p>
                  </div>
                )}
              </div>

              {/* Word-by-Word Meanings (Collapsible) */}
              {verse.wordMeanings && verse.wordMeanings.length > 0 && (
                <div className="rounded-neo border-2 border-border-strong overflow-hidden bg-background">
                  <button
                    type="button"
                    onClick={() => setShowWordMeanings(!showWordMeanings)}
                    className="w-full px-4 py-2.5 bg-surface flex items-center justify-between text-xs font-mono font-bold text-text-primary hover:bg-surface-hover transition-colors"
                  >
                    <span>{t.learningRoom.wordMeaningsToggle} ({verse.wordMeanings.length} {language === 'hi' ? 'शब्द' : 'Words'})</span>
                    <span className="text-accent font-mono">{showWordMeanings ? '▲' : '▼'}</span>
                  </button>

                  {showWordMeanings && (
                    <div className="p-4 bg-background border-t-2 border-border-strong grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                      {verse.wordMeanings?.map((wm, idx) => (
                        <div key={idx} className="p-2.5 rounded-neo-sm bg-surface border-2 border-border-strong space-y-0.5">
                          <div className="font-sanskrit font-bold text-text-primary text-sm">
                            {wm.word}
                          </div>
                          <div className="text-[11px] text-text-muted italic">{wm.transliteration}</div>
                          <div className="text-[11px] text-text-secondary">
                            {language === 'hi' && wm.meaningHindi ? wm.meaningHindi : wm.meaningEnglish}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Action Button: Mark Reading Complete */}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleCompleteReading}
                  className={`neo-btn py-3 px-6 text-xs sm:text-sm ${
                    roomProgress.tasks.reading
                      ? 'neo-btn-secondary border-success text-success'
                      : 'neo-btn-primary'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {roomProgress.tasks.reading
                      ? (language === 'hi' ? 'पठन पूर्ण (अगले कार्य की समीक्षा करें)' : 'Reading Completed (Review Next Task)')
                      : t.learningRoom.markReadingComplete}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TASK 2: UNDERSTAND THE TEACHING (GITA AND LIFE - 5 EDUCATIONAL SECTIONS)   */}
        {/* ========================================================================= */}
        <div className="neo-card overflow-hidden">
          <button
            type="button"
            onClick={() => roomProgress.tasks.reading && setActiveTask(activeTask === 2 ? 0 : 2)}
            disabled={!roomProgress.tasks.reading}
            className={`w-full px-6 py-4 flex items-center justify-between gap-4 transition-colors text-left ${
              !roomProgress.tasks.reading
                ? 'bg-surface/50 opacity-60 cursor-not-allowed'
                : 'bg-surface hover:bg-surface-hover'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-neo-sm border-2 border-border-strong flex items-center justify-center text-xs font-bold shadow-neo-sm ${
                  roomProgress.tasks.understanding
                    ? 'bg-success text-white'
                    : !roomProgress.tasks.reading
                    ? 'bg-background text-text-muted'
                    : 'bg-accent text-accent-contrast'
                }`}
              >
                {roomProgress.tasks.understanding ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : !roomProgress.tasks.reading ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Brain className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-accent">
                    {t.learningRoom.task2Number}
                  </span>
                  <span className="text-sm font-black text-text-primary uppercase">
                    {t.learningRoom.task2Title}
                  </span>
                </div>
                <p className="text-xs text-text-secondary font-sans">
                  {t.learningRoom.task2Subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {roomProgress.tasks.understanding && (
                <span className="neo-badge bg-success/20 text-success border-success px-2.5 py-0.5 text-xs hidden sm:inline">
                  {language === 'hi' ? 'पूर्ण' : 'Completed'}
                </span>
              )}
              {activeTask === 2 ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
            </div>
          </button>

          {activeTask === 2 && lifeLesson && (
            <div className="p-6 sm:p-8 space-y-6 border-t-2 border-border-strong animate-in fade-in duration-200">
              {/* Section A: The Gita Says */}
              <div className="p-5 rounded-neo bg-background border-2 border-border-strong space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-accent uppercase">
                  <BookOpen className="w-4 h-4" />
                  <span>{t.learningRoom.sectionA}</span>
                </div>
                <p className="text-xs sm:text-sm text-text-primary leading-relaxed font-sans">
                  {language === 'hi' && lifeLesson.gitaExplanation.textHindi
                    ? lifeLesson.gitaExplanation.textHindi
                    : lifeLesson.gitaExplanation.text}
                </p>
              </div>

              {/* Section B: Deeper Understanding */}
              <div className="p-5 rounded-neo bg-background border-2 border-border-strong space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary uppercase">
                    <Lightbulb className="w-4 h-4" />
                    <span>{t.learningRoom.sectionB}</span>
                  </div>
                  {lifeLesson.deeperUnderstanding.sourceReferences?.length > 0 && (
                    <div className="text-[11px] text-text-muted font-mono hidden sm:inline">
                      {t.learningRoom.sources}: {lifeLesson.deeperUnderstanding.sourceReferences.join(', ')}
                    </div>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
                  {language === 'hi' && lifeLesson.deeperUnderstanding.explanationHindi
                    ? lifeLesson.deeperUnderstanding.explanationHindi
                    : lifeLesson.deeperUnderstanding.explanation}
                </p>
              </div>

              {/* Section C: Gita in Real Life */}
              <div className="p-5 rounded-neo bg-surface border-2 border-accent/40 space-y-3 shadow-neo-sm">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-accent uppercase">
                  <HeartHandshake className="w-4 h-4" />
                  <span>{t.learningRoom.sectionC}</span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-text-secondary font-sans">
                  <div>
                    <strong className="text-text-primary">{t.learningRoom.modernScenario}: </strong>
                    <span>
                      {language === 'hi' && lifeLesson.realLifeApplication.scenarioHindi
                        ? lifeLesson.realLifeApplication.scenarioHindi
                        : lifeLesson.realLifeApplication.scenario}
                    </span>
                  </div>
                  <div>
                    <strong className="text-text-primary">{t.learningRoom.scripturalConnection}: </strong>
                    <span>
                      {language === 'hi' && lifeLesson.realLifeApplication.connectionHindi
                        ? lifeLesson.realLifeApplication.connectionHindi
                        : lifeLesson.realLifeApplication.connection}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section D: Key Takeaway */}
              <div className="p-4 rounded-neo bg-surface-secondary border-2 border-border-strong flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-accent block">
                    {t.learningRoom.sectionD}
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-text-primary font-sans">
                    {language === 'hi' && lifeLesson.keyTakeawayHindi
                      ? lifeLesson.keyTakeawayHindi
                      : lifeLesson.keyTakeaway}
                  </p>
                </div>
              </div>

              {/* Section E: Check Your Understanding (Stable ID assessment) */}
              <div className="p-6 rounded-neo bg-surface border-2 border-border-strong shadow-neo-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b-2 border-border-strong">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-accent uppercase">
                    <HelpCircle className="w-4 h-4" />
                    <span>{t.learningRoom.sectionE}</span>
                  </div>
                  {roomProgress.tasks.understanding && (
                    <span className="text-xs font-mono font-bold text-success flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {language === 'hi' ? 'सत्यापित' : 'VERIFIED'}
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm font-bold text-text-primary font-sans">
                  {language === 'hi' && lifeLesson.understandingCheck.questionHindi
                    ? lifeLesson.understandingCheck.questionHindi
                    : lifeLesson.understandingCheck.question}
                </p>

                {/* 4 Interactive Options */}
                <div className="space-y-2.5">
                  {lifeLesson.understandingCheck.options.map((option) => {
                    const isSelected = selectedUnderstandingOption === option.id;
                    const optionText =
                      language === 'hi' && option.textHindi ? option.textHindi : option.text;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => !understandingSubmitted && setSelectedUnderstandingOption(option.id)}
                        disabled={understandingSubmitted}
                        className={`w-full p-3.5 rounded-neo-sm border-2 text-left text-xs sm:text-sm transition-all flex items-start gap-3 ${
                          isSelected
                            ? 'bg-accent/25 border-accent text-text-primary font-bold shadow-neo-sm'
                            : 'bg-background border-border-strong text-text-secondary hover:text-text-primary hover:border-accent'
                        } ${understandingSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                      >
                        <div
                          className={`w-5 h-5 rounded-neo-sm border-2 border-border-strong flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono font-bold ${
                            isSelected
                              ? 'bg-accent text-accent-contrast'
                              : 'bg-surface text-text-muted'
                          }`}
                        >
                          {option.id.toUpperCase()}
                        </div>
                        <span className="flex-1 leading-snug">{optionText}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Alert */}
                {understandingFeedback && (
                  <div
                    className={`p-4 rounded-neo-sm border-2 flex items-start gap-3 text-xs sm:text-sm animate-in fade-in duration-200 ${
                      understandingFeedback.isCorrect
                        ? 'bg-success/15 border-success text-text-primary shadow-neo-sm'
                        : 'bg-danger/15 border-danger text-text-primary shadow-neo-sm'
                    }`}
                  >
                    {understandingFeedback.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-danger shrink-0 mt-0.5" />
                    )}
                    <div className="space-y-1">
                      <div className="font-black uppercase tracking-wide">
                        {understandingFeedback.isCorrect
                          ? t.learningRoom.wellUnderstood
                          : (language === 'hi' ? 'पुनर्विचार आवश्यक' : 'Reflection Needed')}
                      </div>
                      <p className="leading-relaxed font-sans">{understandingFeedback.message}</p>
                    </div>
                  </div>
                )}

                {/* Verification Actions */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  {understandingSubmitted && !understandingFeedback?.isCorrect && (
                    <button
                      type="button"
                      onClick={handleRetryUnderstanding}
                      className="neo-btn-secondary px-4 py-2 text-xs inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t.learningRoom.retryUnderstanding}</span>
                    </button>
                  )}

                  {!understandingSubmitted && (
                    <button
                      type="button"
                      onClick={handleVerifyUnderstanding}
                      disabled={!selectedUnderstandingOption}
                      className={`ml-auto neo-btn py-2.5 px-5 text-xs inline-flex items-center gap-2 ${
                        selectedUnderstandingOption
                          ? 'neo-btn-primary'
                          : 'bg-surface-secondary text-text-muted border-border cursor-not-allowed'
                      }`}
                    >
                      <span>{t.learningRoom.verifyUnderstanding}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}

                  {understandingSubmitted && understandingFeedback?.isCorrect && (
                    <button
                      type="button"
                      onClick={() => setActiveTask(3)}
                      className="ml-auto neo-btn-primary px-5 py-2.5 text-xs inline-flex items-center gap-2"
                    >
                      <span>{t.learningRoom.proceedToChallenge}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* TASK 3: KNOWLEDGE CHALLENGE                                               */}
        {/* ========================================================================= */}
        <div className="neo-card overflow-hidden">
          <button
            type="button"
            onClick={() => roomProgress.tasks.understanding && setActiveTask(activeTask === 3 ? 0 : 3)}
            disabled={!roomProgress.tasks.understanding}
            className={`w-full px-6 py-4 flex items-center justify-between gap-4 transition-colors text-left ${
              !roomProgress.tasks.understanding
                ? 'bg-surface/50 opacity-60 cursor-not-allowed'
                : 'bg-surface hover:bg-surface-hover'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-neo-sm border-2 border-border-strong flex items-center justify-center text-xs font-bold shadow-neo-sm ${
                  roomProgress.tasks.challenge
                    ? 'bg-success text-white'
                    : !roomProgress.tasks.understanding
                    ? 'bg-background text-text-muted'
                    : 'bg-accent text-accent-contrast'
                }`}
              >
                {roomProgress.tasks.challenge ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : !roomProgress.tasks.understanding ? (
                  <Lock className="w-4 h-4" />
                ) : (
                  <Target className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-accent">
                    {t.learningRoom.task3Number}
                  </span>
                  <span className="text-sm font-black text-text-primary uppercase">
                    {t.learningRoom.task3Title}
                  </span>
                </div>
                <p className="text-xs text-text-secondary font-sans">
                  {t.learningRoom.task3Subtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {roomProgress.tasks.challenge && (
                <span className="neo-badge bg-success/20 text-success border-success px-2.5 py-0.5 text-xs hidden sm:inline">
                  {language === 'hi' ? 'पूर्ण' : 'Completed'}
                </span>
              )}
              {activeTask === 3 ? <ChevronUp className="w-5 h-5 text-text-muted" /> : <ChevronDown className="w-5 h-5 text-text-muted" />}
            </div>
          </button>

          {activeTask === 3 && (
            <div className="p-6 sm:p-8 space-y-6 border-t-2 border-border-strong animate-in fade-in duration-200">
              <ChallengeEngine
                challenge={level.challenge}
                onPass={handleChallengePass}
              />
            </div>
          )}
        </div>

        {/* Level Navigation Footer */}
        <div className="pt-4 border-t-2 border-border-strong flex items-center justify-between gap-4">
          {prevLvl ? (
            <Link
              href={`/learn/${prevLvl.chapter}/${prevLvl.verse}`}
              className="neo-btn-secondary px-4 py-2.5 text-xs inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.learningRoom.prevRoom} ({prevLvl.id})</span>
            </Link>
          ) : (
            <div />
          )}

          {nextLvl && ProgressionService.isLevelUnlocked(nextLvl.id, progress) ? (
            <Link
              href={`/learn/${nextLvl.chapter}/${nextLvl.verse}`}
              className="neo-btn-primary px-5 py-2.5 text-xs inline-flex items-center gap-2"
            >
              <span>{t.learningRoom.nextRoom} ({nextLvl.id})</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : nextLvl ? (
            <div className="neo-badge bg-surface text-text-muted px-4 py-2.5 text-xs inline-flex items-center gap-2 cursor-not-allowed">
              <Lock className="w-3.5 h-3.5" />
              <span>{t.learningRoom.nextRoomLocked} ({nextLvl.id})</span>
            </div>
          ) : (
            <Link
              href="/journey"
              className="neo-btn-primary px-5 py-2.5 text-xs inline-flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>{t.learningRoom.journeyCompleted}</span>
            </Link>
          )}
        </div>
      </div>

      {/* Level Completion Modal */}
      {completionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md neo-card p-6 sm:p-8 shadow-neo-lg text-center space-y-6">
            <div className="w-16 h-16 rounded-neo bg-accent text-accent-contrast border-2 border-border-strong flex items-center justify-center mx-auto shadow-neo-sm">
              <CheckCircle2 className="w-8 h-8 fill-current" />
            </div>

            <div className="space-y-1.5">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-accent">
                {language === 'hi' ? `७०० में से स्तर ${level.globalIndex} पूर्ण` : `Level ${level.globalIndex} of 700 Completed`}
              </div>
              <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">
                {t.learningRoom.roomTitle} {level.id} {t.learningRoom.levelFinishedTitle}
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed font-sans">
                {localizedLevelTitle}
              </p>
            </div>

            {/* Itemized XP Reward Breakdown */}
            <div className="p-4 rounded-neo-sm bg-background border-2 border-border-strong space-y-2.5 text-xs font-mono text-left">
              <div className="flex justify-between items-center text-text-secondary">
                <span>{t.learningRoom.baseVerseReward}</span>
                <span className="font-bold text-text-primary">
                  {completionModal.rewardBreakdown.isFirstCompletion
                    ? `+${completionModal.rewardBreakdown.baseXP} XP`
                    : (language === 'hi' ? '+0 XP (पुनः खेला)' : '+0 XP (Replayed)')}
                </span>
              </div>

              {completionModal.rewardBreakdown.masteryBonusXP > 0 && (
                <div className="flex justify-between items-center text-accent">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Sparkles className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.learningRoom.perfectBonus}</span>
                  </span>
                  <span className="font-black">+{completionModal.rewardBreakdown.masteryBonusXP} XP</span>
                </div>
              )}

              {completionModal.rewardBreakdown.chapterBonusXP > 0 && (
                <div className="flex justify-between items-center text-accent">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Trophy className="w-3.5 h-3.5 shrink-0" />
                    <span>{t.learningRoom.chapterMilestoneBonus}</span>
                  </span>
                  <span className="font-black">+{completionModal.rewardBreakdown.chapterBonusXP} XP</span>
                </div>
              )}

              {!completionModal.rewardBreakdown.isFirstCompletion && (
                <div className="text-[11px] text-text-muted italic pt-1 border-t border-border-strong/40">
                  {t.learningRoom.replayNotice}
                </div>
              )}

              <div className="pt-2 border-t-2 border-border-strong flex justify-between items-center">
                <span className="uppercase text-text-primary font-black">{t.learningRoom.totalEarned}</span>
                <span className="text-base font-black text-accent">
                  +{completionModal.rewardBreakdown.totalAwardedXP} XP
                </span>
              </div>
            </div>

            {/* Total Player XP Banner */}
            <div className="p-3 rounded-neo-sm bg-surface-secondary border-2 border-border-strong flex items-center justify-between text-xs font-mono">
              <span className="text-text-muted uppercase font-bold">{t.learningRoom.totalLifetimeXp}</span>
              <span className="font-black text-text-primary text-sm">{completionModal.updatedProgress.totalXP} XP</span>
            </div>

            {/* Modal Actions */}
            <div className="space-y-2.5 pt-2">
              {completionModal.nextLevel ? (
                <button
                  type="button"
                  onClick={() => {
                    const next = completionModal.nextLevel!;
                    setCompletionModal(null);
                    router.push(`/learn/${next.chapter}/${next.verse}`);
                  }}
                  className="w-full neo-btn-primary py-3.5 px-6 text-sm flex items-center justify-center gap-2"
                >
                  <span>{t.learningRoom.continueToNext} ({completionModal.nextLevel.id})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <Link
                  href="/journey"
                  className="w-full neo-btn-primary py-3.5 px-6 text-sm flex items-center justify-center gap-2"
                >
                  <span>{t.learningRoom.viewJourneyCompletion}</span>
                  <Trophy className="w-4 h-4" />
                </Link>
              )}

              <button
                type="button"
                onClick={() => setCompletionModal(null)}
                className="w-full neo-btn-secondary py-2.5 px-4 text-xs"
              >
                {t.learningRoom.reviewRoomTasks}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
