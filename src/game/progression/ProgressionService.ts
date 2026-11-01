import { GameLevel } from '../types/level';
import { GameProgress, Achievement, RoomTasks, RoomProgress } from '../types/progression';
import { getLevelById, getLevelByGlobalIndex, getNextLevel, getLevelsForChapter } from '../content/levels';
import { CHAPTER_WORLDS, getWorldForChapter } from '../content/worlds';
import { AchievementService } from './AchievementService';
import { SaveManager } from './SaveManager';

export interface XPRewardBreakdown {
  baseXP: number;
  masteryBonusXP: number;
  chapterBonusXP: number;
  totalAwardedXP: number;
  isFirstCompletion: boolean;
}

export interface LevelCompletionResult {
  success: boolean;
  message: string;
  updatedProgress: GameProgress;
  xpEarned: number;
  rewardBreakdown: XPRewardBreakdown;
  isFirstCompletion: boolean;
  newAchievements: Achievement[];
  chapterCompleted: boolean;
  gameCompleted: boolean;
  nextLevel?: GameLevel;
}

export class ProgressionService {
  /**
   * Determine expected reward for UI display (learning-room header, etc.)
   */
  static getExpectedLevelReward(level: GameLevel, progress: GameProgress): {
    baseXP: number;
    isFirstCompletion: boolean;
    displayReward: string;
  } {
    const rewardKey = `level:${level.id}:complete`;
    const isFirstCompletion = !progress.awardedRewardIds.includes(rewardKey);
    return {
      baseXP: isFirstCompletion ? level.xpReward : 0,
      isFirstCompletion,
      displayReward: isFirstCompletion ? `+${level.xpReward} XP` : '+0 XP (Completed)'
    };
  }

  /**
   * Check if a given level ID is unlocked for the player.
   * Strict sequential unlock:
   * Level 1 (globalIndex 1) is unlocked initially.
   * Level N is unlocked if highestCompletedIndex >= N - 1.
   */
  static isLevelUnlocked(levelId: string, progress: GameProgress): boolean {
    const level = getLevelById(levelId);
    if (!level) return false;

    // Level 1 (1.1) is always unlocked
    if (level.globalIndex === 1) return true;

    // Unlocked if player has completed up to at least previous level
    return level.globalIndex <= progress.highestCompletedIndex + 1;
  }

  /**
   * Check if a chapter is unlocked.
   * Chapter 1 is always unlocked.
   * Chapter N is unlocked if the player's highest completed index has reached Chapter N's start.
   */
  static isChapterUnlocked(chapterNumber: number, progress: GameProgress): boolean {
    if (chapterNumber === 1) return true;
    const world = getWorldForChapter(chapterNumber);
    if (!world) return false;

    // Chapter is unlocked if highest completed index is at least the start of this chapter minus 1
    return progress.highestCompletedIndex >= world.levelRange.startGlobal - 1;
  }

  /**
   * Check if a chapter is fully completed (all verses finished)
   */
  static isChapterCompleted(chapterNumber: number, progress: GameProgress): boolean {
    const world = getWorldForChapter(chapterNumber);
    if (!world) return false;
    return progress.highestCompletedIndex >= world.levelRange.endGlobal;
  }

  /**
   * Get total completed count in a chapter
   */
  static getChapterCompletedCount(chapterNumber: number, progress: GameProgress): number {
    const chapterLevels = getLevelsForChapter(chapterNumber);
    const completedSet = new Set(progress.completedLevelIds);
    return chapterLevels.filter((lvl) => completedSet.has(lvl.id)).length;
  }

  /**
   * Submit completion of a level with validation, XP calculation,
   * achievement checks, and sequential unlocking.
   */
  static completeLevel(
    level: GameLevel,
    score: number,
    currentProgress: GameProgress
  ): LevelCompletionResult {
    // 1. Validate eligibility
    if (!this.isLevelUnlocked(level.id, currentProgress)) {
      return {
        success: false,
        message: 'This level is locked. Complete preceding levels sequentially.',
        updatedProgress: currentProgress,
        xpEarned: 0,
        rewardBreakdown: {
          baseXP: 0,
          masteryBonusXP: 0,
          chapterBonusXP: 0,
          totalAwardedXP: 0,
          isFirstCompletion: false
        },
        isFirstCompletion: false,
        newAchievements: [],
        chapterCompleted: false,
        gameCompleted: false
      };
    }

    if (score < level.minimumMasteryScore) {
      return {
        success: false,
        message: `Score ${score}% is below required mastery score of ${level.minimumMasteryScore}%. Retry to proceed.`,
        updatedProgress: currentProgress,
        xpEarned: 0,
        rewardBreakdown: {
          baseXP: 0,
          masteryBonusXP: 0,
          chapterBonusXP: 0,
          totalAwardedXP: 0,
          isFirstCompletion: false
        },
        isFirstCompletion: false,
        newAchievements: [],
        chapterCompleted: false,
        gameCompleted: false
      };
    }

    // 2. Determine first-time completion and XP
    const rewardKey = `level:${level.id}:complete`;
    const isFirstCompletion = !currentProgress.awardedRewardIds.includes(rewardKey);
    let baseXP = 0;
    let masteryBonusXP = 0;
    let chapterBonusXP = 0;

    const newAwardedRewards = [...currentProgress.awardedRewardIds];
    const newCompletedLevelIds = currentProgress.completedLevelIds.includes(level.id)
      ? [...currentProgress.completedLevelIds]
      : [...currentProgress.completedLevelIds, level.id];

    if (isFirstCompletion) {
      baseXP = level.xpReward;
      newAwardedRewards.push(rewardKey);

      // First attempt bonus (score === 100)
      if (score === 100) {
        masteryBonusXP = 5;
        newAwardedRewards.push(`level:${level.id}:perfect`);
      }
    }

    // 3. Update highest completed index
    const newHighestIndex = Math.max(currentProgress.highestCompletedIndex, level.globalIndex);

    // 4. Check chapter completion
    const world = getWorldForChapter(level.chapter);
    const chapterRewardKey = `chapter:${level.chapter}:complete`;
    let chapterCompleted = false;
    const newChapterCompletionDates = { ...currentProgress.chapterCompletionDates };

    if (
      world &&
      newHighestIndex >= world.levelRange.endGlobal &&
      !newAwardedRewards.includes(chapterRewardKey)
    ) {
      chapterCompleted = true;
      chapterBonusXP = 100; // 100 XP Chapter completion bonus
      newAwardedRewards.push(chapterRewardKey);
      newChapterCompletionDates[level.chapter] = new Date().toISOString();
    }

    const xpEarned = baseXP + masteryBonusXP + chapterBonusXP;
    const rewardBreakdown: XPRewardBreakdown = {
      baseXP,
      masteryBonusXP,
      chapterBonusXP,
      totalAwardedXP: xpEarned,
      isFirstCompletion
    };

    // 5. Check game completion (Level 700 / 18.78)
    const isGameCompleted = newHighestIndex >= 700;
    const completedAt = isGameCompleted
      ? currentProgress.completedAt || new Date().toISOString()
      : undefined;

    // 6. Find next level
    const nextLvl = getNextLevel(level.id);
    const nextLevelId = nextLvl ? nextLvl.id : level.id;

    // 7. Check achievements
    const newAchievements = AchievementService.evaluateNewAchievements(
      newCompletedLevelIds,
      currentProgress.unlockedAchievementIds,
      level.id
    );

    const updatedAchievementIds = [
      ...currentProgress.unlockedAchievementIds,
      ...newAchievements.map((a) => a.id)
    ];

    // 8. Assemble updated progress
    const updatedRooms = {
      ...(currentProgress.rooms || currentProgress.roomProgress || {}),
      [level.id]: {
        levelId: level.id,
        tasks: { reading: true, understanding: true, challenge: true },
        completed: true,
        completedAt: new Date().toISOString()
      }
    };

    const updatedProgress: GameProgress = {
      ...currentProgress,
      highestCompletedIndex: newHighestIndex,
      completedLevelIds: newCompletedLevelIds,
      awardedRewardIds: newAwardedRewards,
      totalXP: currentProgress.totalXP + xpEarned,
      currentLevelId: nextLevelId,
      unlockedAchievementIds: updatedAchievementIds,
      gameCompleted: isGameCompleted,
      completedAt,
      chapterCompletionDates: newChapterCompletionDates,
      lastPlayedAt: new Date().toISOString(),
      rooms: updatedRooms,
      roomProgress: updatedRooms
    };

    // 9. Persist progress
    SaveManager.saveProgress(updatedProgress);

    return {
      success: true,
      message: 'Level completed successfully!',
      updatedProgress,
      xpEarned,
      rewardBreakdown,
      isFirstCompletion,
      newAchievements,
      chapterCompleted,
      gameCompleted: isGameCompleted,
      nextLevel: nextLvl
    };
  }

  /**
   * Update individual room task status (Task 1 reading, Task 2 understanding, Task 3 challenge)
   */
  static updateRoomTask(
    levelId: string,
    taskKey: keyof RoomTasks,
    isTaskComplete: boolean,
    currentProgress: GameProgress
  ): GameProgress {
    const currentRoom = SaveManager.getRoomProgress(levelId, currentProgress);
    const updatedTasks: RoomTasks = {
      ...currentRoom.tasks,
      [taskKey]: isTaskComplete
    };

    const isAllComplete =
      updatedTasks.reading &&
      updatedTasks.understanding &&
      updatedTasks.challenge;

    const updatedRoom: RoomProgress = {
      ...currentRoom,
      tasks: updatedTasks,
      completed: isAllComplete,
      completedAt: isAllComplete ? (currentRoom.completedAt || new Date().toISOString()) : currentRoom.completedAt
    };

    const updatedRooms = {
      ...(currentProgress.rooms || currentProgress.roomProgress || {}),
      [levelId]: updatedRoom
    };

    const updatedProgress: GameProgress = {
      ...currentProgress,
      rooms: updatedRooms,
      roomProgress: updatedRooms
    };

    SaveManager.saveProgress(updatedProgress);
    return updatedProgress;
  }
}
