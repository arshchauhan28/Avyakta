import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressionService } from '@/game/progression/ProgressionService';
import { SaveManager, INITIAL_GAME_PROGRESS } from '@/game/progression/SaveManager';
import { getLevelById } from '@/game/content/levels';
import { GameProgress } from '@/game/types/progression';

/**
 * XP Contract Tests — Verifies exact parity for canonical reward breakdown:
 * - Normal shloka: 20 XP
 * - Introductory / Special shloka: 20 XP
 * - Perfect challenge bonus (score 100): +5 XP
 * - Imperfect challenge (score < 100): +0 XP bonus
 * - Chapter finale completion: 20 XP + 100 XP Chapter Milestone
 * - Replay / repeated completion: 0 XP
 */
describe('XP Contract Tests — Frontend Canonical Progression', () => {
  let progress: GameProgress;

  beforeEach(() => {
    progress = {
      ...INITIAL_GAME_PROGRESS,
      completedLevelIds: [],
      awardedRewardIds: [],
      unlockedAchievementIds: [],
      highestCompletedIndex: 0,
      totalXP: 0,
    };
  });

  it('awards 20 base XP for normal level completion (imperfect challenge)', () => {
    const level1 = getLevelById('1.1')!;
    const res = ProgressionService.completeLevel(level1, 80, progress);

    expect(res.success).toBe(true);
    expect(res.isFirstCompletion).toBe(true);
    expect(res.rewardBreakdown.baseXP).toBe(20);
    expect(res.rewardBreakdown.masteryBonusXP).toBe(0);
    expect(res.rewardBreakdown.chapterBonusXP).toBe(0);
    expect(res.rewardBreakdown.totalAwardedXP).toBe(20);
    expect(res.updatedProgress.totalXP).toBe(20);
  });

  it('awards 20 base XP + 5 perfect challenge bonus for 100% score (total 25 XP)', () => {
    const level1 = getLevelById('1.1')!;
    const res = ProgressionService.completeLevel(level1, 100, progress);

    expect(res.success).toBe(true);
    expect(res.isFirstCompletion).toBe(true);
    expect(res.rewardBreakdown.baseXP).toBe(20);
    expect(res.rewardBreakdown.masteryBonusXP).toBe(5);
    expect(res.rewardBreakdown.chapterBonusXP).toBe(0);
    expect(res.rewardBreakdown.totalAwardedXP).toBe(25);
    expect(res.updatedProgress.totalXP).toBe(25);
  });

  it('awards 0 XP on replay of already completed level', () => {
    const level1 = getLevelById('1.1')!;
    const firstRes = ProgressionService.completeLevel(level1, 100, progress);
    expect(firstRes.updatedProgress.totalXP).toBe(25);

    const replayRes = ProgressionService.completeLevel(level1, 100, firstRes.updatedProgress);
    expect(replayRes.success).toBe(true);
    expect(replayRes.isFirstCompletion).toBe(false);
    expect(replayRes.rewardBreakdown.baseXP).toBe(0);
    expect(replayRes.rewardBreakdown.masteryBonusXP).toBe(0);
    expect(replayRes.rewardBreakdown.chapterBonusXP).toBe(0);
    expect(replayRes.rewardBreakdown.totalAwardedXP).toBe(0);
    expect(replayRes.updatedProgress.totalXP).toBe(25);
  });

  it('awards 20 base XP + 5 bonus + 100 chapter milestone for chapter finale (total 125 XP)', () => {
    const progNearEnd: GameProgress = {
      ...progress,
      highestCompletedIndex: 46,
      completedLevelIds: Array.from({ length: 46 }, (_, i) => `1.${i + 1}`),
    };

    const finale = getLevelById('1.47')!;
    const res = ProgressionService.completeLevel(finale, 100, progNearEnd);

    expect(res.success).toBe(true);
    expect(res.chapterCompleted).toBe(true);
    expect(res.rewardBreakdown.baseXP).toBe(20);
    expect(res.rewardBreakdown.masteryBonusXP).toBe(5);
    expect(res.rewardBreakdown.chapterBonusXP).toBe(100);
    expect(res.rewardBreakdown.totalAwardedXP).toBe(125);
  });
});
