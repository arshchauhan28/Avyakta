import { describe, it, expect } from 'vitest';
import { ALL_GAME_LEVELS, getLevelById } from '@/game/content/levels';
import { ChallengeDefinition } from '@/game/types/level';

describe('Challenge Content Quality & Shloka-Specificity Audit', () => {
  it('contains exactly 700 canonical game levels', () => {
    expect(ALL_GAME_LEVELS.length).toBe(700);
    expect(ALL_GAME_LEVELS[0].id).toBe('1.1');
    expect(ALL_GAME_LEVELS[699].id).toBe('18.78');
  });

  it('guarantees 700 completely unique challenge prompts', () => {
    const promptSet = new Set(ALL_GAME_LEVELS.map((l) => l.challenge.prompt));
    expect(promptSet.size).toBe(700);
  });

  it('eliminates all legacy generic template strings across all 700 levels', () => {
    const BANNED_PATTERNS = [
      'It advocates renouncing all social action and living in total isolation',
      'Act out of anger or anxiety over what the outcome might be',
      'I acknowledge the tendency to cling to outcomes',
      'What central insight does Shloka 1.2 convey?'
    ];

    ALL_GAME_LEVELS.forEach((level) => {
      const challengeStr = JSON.stringify(level.challenge);
      BANNED_PATTERNS.forEach((banned) => {
        expect(challengeStr.includes(banned)).toBe(false);
      });
    });
  });

  it('ensures every multiple-choice challenge has 4 distinct options and one valid correct answer', () => {
    const mcLevels = ALL_GAME_LEVELS.filter((l) => l.challenge.type === 'multiple-choice');
    expect(mcLevels.length).toBe(253);

    mcLevels.forEach((level) => {
      const chal = level.challenge;
      expect(chal.options?.length).toBe(4);

      const correctOptions = chal.options?.filter((o) => o.isCorrect === true);
      expect(correctOptions?.length).toBe(1);
      expect(chal.correctAnswer).toBeDefined();

      // Check option texts are distinct
      const optionTexts = new Set(chal.options?.map((o) => o.text));
      expect(optionTexts.size).toBe(4);
    });
  });

  it('ensures every decision simulation contains setting, dilemma, and 3 distinct choices with consequences', () => {
    const decisionLevels = ALL_GAME_LEVELS.filter((l) => l.challenge.type === 'decision');
    expect(decisionLevels.length).toBe(109);

    decisionLevels.forEach((level) => {
      const chal = level.challenge;
      expect(chal.options?.length).toBe(3);
      expect(chal.instruction.length).toBeGreaterThan(15);

      chal.options?.forEach((opt) => {
        expect(opt.text.length).toBeGreaterThan(10);
        expect(opt.consequence).toBeDefined();
        expect(opt.consequence!.length).toBeGreaterThan(10);
      });
    });
  });

  it('ensures every reflection activity contains contemplation prompt and 3 distinct perspectives', () => {
    const reflectionLevels = ALL_GAME_LEVELS.filter((l) => l.challenge.type === 'reflection');
    expect(reflectionLevels.length).toBe(107);

    reflectionLevels.forEach((level) => {
      const chal = level.challenge;
      expect(chal.reflectionPrompt).toBeDefined();
      expect(chal.reflectionPrompt!.length).toBeGreaterThan(15);
      expect(chal.options?.length).toBe(3);

      const perspectiveTexts = new Set(chal.options?.map((o) => o.text));
      expect(perspectiveTexts.size).toBe(3);
    });
  });

  it('honestly marks all programmatically upgraded content as draft review status', () => {
    ALL_GAME_LEVELS.forEach((level) => {
      expect(level.reviewStatus).toBe('draft');
    });
  });
});
