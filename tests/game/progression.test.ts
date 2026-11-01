import { describe, it, expect, beforeEach } from 'vitest';
import { ProgressionService } from '@/game/progression/ProgressionService';
import { INITIAL_GAME_PROGRESS } from '@/game/progression/SaveManager';
import { getLevelById } from '@/game/content/levels';
import { GameProgress } from '@/game/types/progression';

describe('ProgressionService — Sequential Unlocking & Progression Rules', () => {
  let progress: GameProgress;

  beforeEach(() => {
    progress = {
      ...INITIAL_GAME_PROGRESS,
      completedLevelIds: [],
      awardedRewardIds: [],
      unlockedAchievementIds: [],
      highestCompletedIndex: 0,
      totalXP: 0
    };
  });

  it('initially only unlocks Level 1 (Shloka 1.1)', () => {
    expect(ProgressionService.isLevelUnlocked('1.1', progress)).toBe(true);
    expect(ProgressionService.isLevelUnlocked('1.2', progress)).toBe(false);
    expect(ProgressionService.isLevelUnlocked('2.47', progress)).toBe(false);
    expect(ProgressionService.isLevelUnlocked('18.78', progress)).toBe(false);
  });

  it('completing Level 1 unlocks Level 2 (1.2)', () => {
    const level1 = getLevelById('1.1')!;
    expect(level1).toBeDefined();

    const res = ProgressionService.completeLevel(level1, 100, progress);
    expect(res.success).toBe(true);
    expect(res.xpEarned).toBeGreaterThan(0);
    expect(res.updatedProgress.highestCompletedIndex).toBe(1);

    expect(ProgressionService.isLevelUnlocked('1.2', res.updatedProgress)).toBe(true);
    expect(ProgressionService.isLevelUnlocked('1.3', res.updatedProgress)).toBe(false);
  });

  it('rejects completion if score is below minimum mastery threshold', () => {
    const level1 = getLevelById('1.1')!;
    const res = ProgressionService.completeLevel(level1, 50, progress);
    expect(res.success).toBe(false);
    expect(res.message).toContain('below required mastery score');
  });

  it('rejects attempt to complete a locked level directly', () => {
    const lockedLevel = getLevelById('2.47')!;
    const res = ProgressionService.completeLevel(lockedLevel, 100, progress);
    expect(res.success).toBe(false);
    expect(res.message).toContain('locked');
  });

  it('prevents duplicate XP rewards when replaying completed levels', () => {
    const level1 = getLevelById('1.1')!;
    const firstRes = ProgressionService.completeLevel(level1, 100, progress);
    expect(firstRes.xpEarned).toBeGreaterThan(0);
    const initialXP = firstRes.updatedProgress.totalXP;

    // Replay
    const replayRes = ProgressionService.completeLevel(level1, 100, firstRes.updatedProgress);
    expect(replayRes.success).toBe(true);
    expect(replayRes.isFirstCompletion).toBe(false);
    expect(replayRes.xpEarned).toBe(0);
    expect(replayRes.updatedProgress.totalXP).toBe(initialXP);
  });

  it('unlocks Chapter 2 upon completing all 47 levels of Chapter 1', () => {
    const progChapter1Done: GameProgress = {
      ...progress,
      highestCompletedIndex: 47,
      completedLevelIds: Array.from({ length: 47 }, (_, i) => `1.${i + 1}`)
    };

    expect(ProgressionService.isLevelUnlocked('2.1', progChapter1Done)).toBe(true);
    expect(ProgressionService.isChapterUnlocked(2, progChapter1Done)).toBe(true);
  });

  it('completing Level 699 unlocks the 700th and final level (18.78)', () => {
    const progNearEnd: GameProgress = {
      ...progress,
      highestCompletedIndex: 699
    };

    expect(ProgressionService.isLevelUnlocked('18.78', progNearEnd)).toBe(true);
  });

  it('provides authoritative rewardBreakdown with baseXP and masteryBonusXP', () => {
    const level1 = getLevelById('1.1')!;
    const res = ProgressionService.completeLevel(level1, 100, progress);
    expect(res.success).toBe(true);
    expect(res.rewardBreakdown).toBeDefined();
    expect(res.rewardBreakdown.baseXP).toBe(20);
    expect(res.rewardBreakdown.masteryBonusXP).toBe(5);
    expect(res.rewardBreakdown.chapterBonusXP).toBe(0);
    expect(res.rewardBreakdown.totalAwardedXP).toBe(25);
    expect(res.rewardBreakdown.isFirstCompletion).toBe(true);
    expect(res.xpEarned).toBe(25);
    expect(res.updatedProgress.totalXP).toBe(25);
  });

  it('does not award mastery bonus when score is less than 100', () => {
    const level1 = getLevelById('1.1')!;
    // level1 minimumMasteryScore is 70
    const res = ProgressionService.completeLevel(level1, 80, progress);
    expect(res.success).toBe(true);
    expect(res.rewardBreakdown.baseXP).toBe(20);
    expect(res.rewardBreakdown.masteryBonusXP).toBe(0);
    expect(res.rewardBreakdown.chapterBonusXP).toBe(0);
    expect(res.rewardBreakdown.totalAwardedXP).toBe(20);
    expect(res.rewardBreakdown.isFirstCompletion).toBe(true);
    expect(res.xpEarned).toBe(20);
    expect(res.updatedProgress.totalXP).toBe(20);
  });

  it('awards +100 XP chapter completion milestone when finishing chapter finale', () => {
    // Chapter 1 has 47 levels; simulate progress at level 46 completed
    const progNearChapterEnd: GameProgress = {
      ...progress,
      highestCompletedIndex: 46,
      completedLevelIds: Array.from({ length: 46 }, (_, i) => `1.${i + 1}`)
    };

    const chapterFinale = getLevelById('1.47')!;
    expect(chapterFinale).toBeDefined();
    expect(chapterFinale.xpReward).toBe(20);

    const res = ProgressionService.completeLevel(chapterFinale, 100, progNearChapterEnd);
    expect(res.success).toBe(true);
    expect(res.chapterCompleted).toBe(true);
    expect(res.rewardBreakdown.baseXP).toBe(20);
    expect(res.rewardBreakdown.masteryBonusXP).toBe(5);
    expect(res.rewardBreakdown.chapterBonusXP).toBe(100);
    expect(res.rewardBreakdown.totalAwardedXP).toBe(125);
    expect(res.xpEarned).toBe(125);
  });

  it('getExpectedLevelReward returns correct values for uncompleted and completed levels', () => {
    const level1 = getLevelById('1.1')!;
    const expectedInitial = ProgressionService.getExpectedLevelReward(level1, progress);
    expect(expectedInitial.baseXP).toBe(20);
    expect(expectedInitial.isFirstCompletion).toBe(true);
    expect(expectedInitial.displayReward).toBe('+20 XP');

    // Complete the level
    const completed = ProgressionService.completeLevel(level1, 100, progress);
    const expectedAfter = ProgressionService.getExpectedLevelReward(level1, completed.updatedProgress);
    expect(expectedAfter.baseXP).toBe(0);
    expect(expectedAfter.isFirstCompletion).toBe(false);
    expect(expectedAfter.displayReward).toBe('+0 XP (Completed)');
  });

  it('completing Level 700 (18.78) marks the game as completed', () => {
    const progAtLastLevel: GameProgress = {
      ...progress,
      highestCompletedIndex: 699,
      completedLevelIds: Array.from({ length: 699 }, (_, i) => `lvl-${i + 1}`)
    };

    const finalLevel = getLevelById('18.78')!;
    expect(finalLevel).toBeDefined();

    const res = ProgressionService.completeLevel(finalLevel, 100, progAtLastLevel);
    expect(res.success).toBe(true);
    expect(res.gameCompleted).toBe(true);
    expect(res.updatedProgress.gameCompleted).toBe(true);
    expect(res.updatedProgress.completedAt).toBeDefined();
  });
});
