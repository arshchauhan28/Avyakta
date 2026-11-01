'use client';

import React, { useState } from 'react';
import { ChallengeDefinition } from '../types/level';
import { CheckCircle2, XCircle, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

interface ChallengeEngineProps {
  challenge: ChallengeDefinition;
  onPass: (score: number) => void;
  onFail?: (score: number) => void;
}

export const ChallengeEngine: React.FC<ChallengeEngineProps> = ({
  challenge,
  onPass,
  onFail
}) => {
  const { language, t } = useTranslation();
  const isHindi = language === 'hi';

  // Common states
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string>('');

  // Matching Challenge State
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({});

  // Shloka Puzzle Ordering State
  const initialSegments = challenge.shlokaSegments ? [...challenge.shlokaSegments] : [];
  const [orderedSegmentIds, setOrderedSegmentIds] = useState<string[]>(
    initialSegments.length > 2
      ? [initialSegments[1].id, initialSegments[0].id, ...initialSegments.slice(2).map(s => s.id)]
      : initialSegments.map(s => s.id)
  );

  // --- 1. MULTIPLE CHOICE & DECISION HANDLER ---
  const handleOptionSelect = (optionId: string) => {
    if (submitted) return;
    setSelectedOptionId(optionId);
  };

  const handleOptionSubmit = () => {
    if (!selectedOptionId || !challenge.options) return;
    const option = challenge.options.find((o) => o.id === selectedOptionId);
    if (!option) return;

    const correct = Boolean(option.isCorrect);
    setIsCorrect(correct);
    setSubmitted(true);

    if (correct) {
      const exp = isHindi
        ? (option.explanationHindi || challenge.explanationHindi || option.explanation || challenge.explanation)
        : (option.explanation || challenge.explanation);
      setFeedback(exp);
    } else {
      const wrongMsg = isHindi
        ? (option.explanationHindi || 'श्लोक के मर्म पर सावधानी से विचार करें और विवेकपूर्ण विकल्प चुनें।')
        : (option.explanation || 'Reflect carefully on the verse and choose the option that upholds spiritual discrimination.');
      setFeedback(wrongMsg);
    }
  };

  // --- 2. MATCHING PAIRS HANDLER ---
  const handleWordClick = (sanskritWord: string) => {
    if (submitted) return;
    setSelectedWord(sanskritWord);
  };

  const handleMeaningClick = (meaning: string) => {
    if (submitted || !selectedWord) return;
    const newMatched = { ...matchedPairs, [selectedWord]: meaning };
    setMatchedPairs(newMatched);
    setSelectedWord(null);

    const total = challenge.matchingPairs?.length || 0;
    if (Object.keys(newMatched).length === total) {
      let allCorrect = true;
      challenge.matchingPairs?.forEach((pair) => {
        const expectedMeaning = isHindi ? (pair.meaningHindi || pair.meaning) : pair.meaning;
        if (newMatched[pair.sanskritWord] !== expectedMeaning) {
          allCorrect = false;
        }
      });
      setIsCorrect(allCorrect);
      setSubmitted(true);
      const matchRight = isHindi ? (challenge.explanationHindi || challenge.explanation) : challenge.explanation;
      const matchWrong = isHindi ? 'कुछ पद सही सुमेलित नहीं हुए। पुनः प्रयास करें।' : 'Some terms were matched incorrectly. Review and retry.';
      setFeedback(allCorrect ? matchRight : matchWrong);
    }
  };

  // --- 3. SHLOKA PUZZLE MOVE HANDLER ---
  const handleMoveSegment = (index: number, direction: 'up' | 'down') => {
    if (submitted) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= orderedSegmentIds.length) return;

    const newArr = [...orderedSegmentIds];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    setOrderedSegmentIds(newArr);
  };

  const handlePuzzleSubmit = () => {
    if (!challenge.shlokaSegments) return;
    let correctlyOrdered = true;
    for (let i = 0; i < orderedSegmentIds.length; i++) {
      const seg = challenge.shlokaSegments.find(s => s.id === orderedSegmentIds[i]);
      if (!seg || seg.order !== i + 1) {
        correctlyOrdered = false;
        break;
      }
    }

    setIsCorrect(correctlyOrdered);
    setSubmitted(true);
    const puzRight = isHindi ? (challenge.explanationHindi || challenge.explanation) : challenge.explanation;
    const puzWrong = isHindi ? 'श्लोक के चरण सही क्रम में नहीं हैं। छंद का ध्यान रखकर पुनः प्रयास करें।' : 'The verse segments are not in canonical sequence. Review the meter and try again.';
    setFeedback(correctlyOrdered ? puzRight : puzWrong);
  };

  // --- 4. REFLECTION HANDLER ---
  const handleReflectionSelect = (optionId: string) => {
    if (submitted) return;
    setSelectedOptionId(optionId);
    setIsCorrect(true);
    setSubmitted(true);
    const refFeedback = isHindi ? (challenge.explanationHindi || challenge.explanation) : challenge.explanation;
    setFeedback(refFeedback);
  };

  const handleRetry = () => {
    setSelectedOptionId(null);
    setSubmitted(false);
    setIsCorrect(false);
    setFeedback('');
    setMatchedPairs({});
    setSelectedWord(null);
  };

  const handleContinue = () => {
    if (isCorrect) {
      onPass(100);
    } else {
      if (onFail) onFail(50);
    }
  };

  const displayPrompt = isHindi ? (challenge.promptHindi || challenge.prompt) : challenge.prompt;
  const displayInstruction = isHindi ? (challenge.instructionHindi || challenge.instruction) : challenge.instruction;

  return (
    <div className="w-full neo-card p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-border-strong pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-neo-sm bg-accent text-accent-contrast border-2 border-border-strong shadow-neo-sm">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-accent font-mono font-bold">
              {t('learningRoom.task3')}
            </div>
            <h3 className="text-base sm:text-lg font-black text-text-primary tracking-wide">
              {displayPrompt}
            </h3>
          </div>
        </div>

        <div className="neo-badge bg-surface-secondary text-text-primary px-3 py-1 text-xs">
          {challenge.type}
        </div>
      </div>

      <div className="text-xs sm:text-sm text-text-secondary font-sans leading-relaxed">
        {displayInstruction}
      </div>

      {/* --- CONTENT BASED ON TYPE --- */}

      {/* 1. MULTIPLE CHOICE & DECISION */}
      {(challenge.type === 'multiple-choice' || challenge.type === 'decision') && challenge.options && (
        <div className="space-y-3">
          {challenge.options.map((option, idx) => {
            const isSelected = selectedOptionId === option.id;
            let borderStyle = 'border-2 border-border-strong bg-background text-text-primary hover:border-accent hover:bg-surface-secondary';

            if (submitted) {
              if (option.isCorrect) {
                borderStyle = 'border-2 border-success bg-success/15 text-text-primary';
              } else if (isSelected && !option.isCorrect) {
                borderStyle = 'border-2 border-danger bg-danger/15 text-text-primary';
              }
            } else if (isSelected) {
              borderStyle = 'border-2 border-accent bg-accent/20 text-text-primary shadow-neo-sm font-bold';
            }

            const optionText = isHindi ? (option.textHindi || option.text) : option.text;
            const consequenceText = isHindi ? (option.consequenceHindi || option.consequence) : option.consequence;

            return (
              <button
                key={option.id}
                onClick={() => handleOptionSelect(option.id)}
                disabled={submitted}
                className={`w-full text-left p-4 rounded-neo-sm transition-all flex items-start space-x-3.5 ${borderStyle} ${
                  submitted ? 'cursor-default' : 'cursor-pointer'
                }`}
              >
                <span className={`w-6 h-6 rounded-neo-sm border-2 border-border-strong flex items-center justify-center text-xs font-mono font-bold shrink-0 mt-0.5 ${
                  isSelected ? 'bg-accent text-accent-contrast' : 'bg-surface text-text-primary'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {optionText}
                  </p>
                  {consequenceText && (
                    <p className="text-xs text-text-muted italic">
                      {isHindi ? 'परिणाम' : 'Consequence'}: {consequenceText}
                    </p>
                  )}
                </div>
              </button>
            );
          })}

          {!submitted && (
            <button
              onClick={handleOptionSubmit}
              disabled={!selectedOptionId}
              className="mt-4 neo-btn-primary px-6 py-2.5 text-xs inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>{t('learningRoom.submitAnswer')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 2. MATCHING PAIRS */}
      {challenge.type === 'matching' && challenge.matchingPairs && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sanskrit Terms */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold uppercase text-text-muted">
                {isHindi ? 'संस्कृत पद' : 'Sanskrit Terms'}
              </div>
              {challenge.matchingPairs.map((pair) => {
                const isMatched = Boolean(matchedPairs[pair.sanskritWord]);
                const isSelected = selectedWord === pair.sanskritWord;

                return (
                  <button
                    key={pair.id}
                    onClick={() => handleWordClick(pair.sanskritWord)}
                    disabled={isMatched || submitted}
                    className={`w-full text-left p-3 rounded-neo-sm border-2 font-sanskrit font-bold text-sm transition-all ${
                      isMatched
                        ? 'border-success/60 bg-success/15 text-success line-through'
                        : isSelected
                        ? 'border-accent bg-accent/25 text-text-primary shadow-neo-sm'
                        : 'border-border-strong bg-background text-text-primary hover:border-accent'
                    }`}
                  >
                    {pair.sanskritWord}
                  </button>
                );
              })}
            </div>

            {/* Meanings */}
            <div className="space-y-2">
              <div className="text-xs font-mono font-bold uppercase text-text-muted">
                {isHindi ? 'अर्थ' : 'English Meanings'}
              </div>
              {challenge.matchingPairs.map((pair) => {
                const localizedMeaning = isHindi ? (pair.meaningHindi || pair.meaning) : pair.meaning;
                const isClaimed = Object.values(matchedPairs).includes(localizedMeaning);

                return (
                  <button
                    key={pair.id}
                    onClick={() => handleMeaningClick(localizedMeaning)}
                    disabled={isClaimed || submitted || !selectedWord}
                    className={`w-full text-left p-3 rounded-neo-sm border-2 text-xs sm:text-sm font-sans transition-all ${
                      isClaimed
                        ? 'border-success/60 bg-success/15 text-success'
                        : selectedWord
                        ? 'border-border-strong bg-surface hover:border-accent text-text-primary cursor-pointer'
                        : 'border-border bg-surface/40 text-text-muted cursor-not-allowed'
                    }`}
                  >
                    {localizedMeaning}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. SHLOKA PUZZLE (Ordering) */}
      {challenge.type === 'shloka-puzzle' && challenge.shlokaSegments && (
        <div className="space-y-3">
          {orderedSegmentIds.map((id, index) => {
            const seg = challenge.shlokaSegments?.find((s) => s.id === id);
            if (!seg) return null;

            return (
              <div
                key={id}
                className="flex items-center justify-between p-3.5 rounded-neo-sm border-2 border-border-strong bg-background"
              >
                <div className="flex items-center gap-3">
                  <span className="neo-badge bg-surface px-2 py-0.5 text-xs text-text-muted">
                    {isHindi ? `चरण ${index + 1}` : `Line ${index + 1}`}
                  </span>
                  <span className="font-sanskrit text-sm sm:text-base font-bold text-text-primary">
                    {seg.sanskrit}
                  </span>
                </div>

                {!submitted && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMoveSegment(index, 'up')}
                      disabled={index === 0}
                      className="px-2 py-1 rounded-neo-sm border-2 border-border-strong bg-surface text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-hover"
                      title="Move segment up"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveSegment(index, 'down')}
                      disabled={index === orderedSegmentIds.length - 1}
                      className="px-2 py-1 rounded-neo-sm border-2 border-border-strong bg-surface text-xs font-bold disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-hover"
                      title="Move segment down"
                    >
                      ▼
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {!submitted && (
            <button
              type="button"
              onClick={handlePuzzleSubmit}
              className="mt-4 neo-btn-primary px-6 py-2.5 text-xs inline-flex items-center gap-2"
            >
              <span>{isHindi ? 'प्रामाणिक क्रम प्रस्तुत करें' : 'Submit Canonical Order'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* 4. REFLECTION */}
      {challenge.type === 'reflection' && (
        <div className="space-y-3">
          {(challenge.reflectionPrompt || challenge.reflectionPromptHindi) && (
            <div className="p-3.5 rounded-neo-sm border-2 border-border-strong bg-surface-secondary text-xs sm:text-sm italic text-text-secondary">
              {isHindi ? (challenge.reflectionPromptHindi || challenge.reflectionPrompt) : challenge.reflectionPrompt}
            </div>
          )}
          {challenge.options && challenge.options.map((option) => {
            const optText = isHindi ? (option.textHindi || option.text) : option.text;
            return (
              <button
                key={option.id}
                onClick={() => handleReflectionSelect(option.id)}
                disabled={submitted}
                className={`w-full text-left p-4 rounded-neo-sm border-2 transition-all text-xs sm:text-sm ${
                  selectedOptionId === option.id
                    ? 'border-accent bg-accent/20 text-text-primary shadow-neo-sm font-bold'
                    : 'border-border-strong bg-background text-text-primary hover:border-accent hover:bg-surface-secondary'
                }`}
              >
                &ldquo;{optText}&rdquo;
              </button>
            );
          })}
        </div>
      )}

      {/* FEEDBACK & COMPLETION BAR */}
      {submitted && (
        <div
          className={`p-5 rounded-neo-sm border-2 transition-all ${
            isCorrect
              ? 'bg-success/15 border-success text-text-primary shadow-neo-sm'
              : 'bg-danger/15 border-danger text-text-primary shadow-neo-sm'
          }`}
        >
          <div className="flex items-start space-x-3">
            {isCorrect ? (
              <CheckCircle2 className="w-6 h-6 text-success shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-6 h-6 text-danger shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-black text-sm uppercase tracking-wide">
                {isCorrect
                  ? (isHindi ? 'सफलतापूर्वक सत्यापित!' : 'Mastery Verified!')
                  : (isHindi ? 'पुनर्विचार की आवश्यकता है' : 'Needs Contemplation')}
              </div>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans">
                {feedback}
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end space-x-3 pt-3 border-t-2 border-border-strong">
            {!isCorrect ? (
              <button
                onClick={handleRetry}
                className="neo-btn-secondary px-4 py-2 text-xs inline-flex items-center gap-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t('learningRoom.retryChallenge')}</span>
              </button>
            ) : (
              <button
                onClick={handleContinue}
                className="neo-btn-primary px-6 py-2.5 text-xs inline-flex items-center gap-2"
              >
                <span>{t('learningRoom.completeLevelBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

