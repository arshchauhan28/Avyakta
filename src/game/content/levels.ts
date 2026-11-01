import { GameLevel } from '../types/level';
import levelsData from './levels-data.json';
import { getLifeLessonByVerseId } from './life-lessons';

// Cast and export immutable typed levels collection with life lessons populated
export const ALL_GAME_LEVELS: GameLevel[] = (levelsData as unknown as GameLevel[]).map((lvl) => ({
  ...lvl,
  lifeLesson: lvl.lifeLesson || getLifeLessonByVerseId(lvl.id)
}));

// Map index for O(1) level lookups
const levelMapById = new Map<string, GameLevel>();
const levelMapByIndex = new Map<number, GameLevel>();
const levelsByChapterMap = new Map<number, GameLevel[]>();

ALL_GAME_LEVELS.forEach((lvl) => {
  levelMapById.set(lvl.id, lvl);
  levelMapByIndex.set(lvl.globalIndex, lvl);

  const chapterLevels = levelsByChapterMap.get(lvl.chapter) || [];
  chapterLevels.push(lvl);
  levelsByChapterMap.set(lvl.chapter, chapterLevels);
});

export function getAllLevels(): GameLevel[] {
  return ALL_GAME_LEVELS;
}

export function getLevelById(id: string): GameLevel | undefined {
  return levelMapById.get(id);
}

export function getLevelByGlobalIndex(globalIndex: number): GameLevel | undefined {
  return levelMapByIndex.get(globalIndex);
}

export function getLevelsForChapter(chapter: number): GameLevel[] {
  return levelsByChapterMap.get(chapter) || [];
}

export function getTotalLevelCount(): number {
  return ALL_GAME_LEVELS.length;
}

export function getNextLevel(currentId: string): GameLevel | undefined {
  const current = levelMapById.get(currentId);
  if (!current) return undefined;
  return levelMapByIndex.get(current.globalIndex + 1);
}

export function getPreviousLevel(currentId: string): GameLevel | undefined {
  const current = levelMapById.get(currentId);
  if (!current) return undefined;
  return levelMapByIndex.get(current.globalIndex - 1);
}
