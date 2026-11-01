import { GitaLifeLesson } from '../types/life-lesson';
import lifeLessonsData from './life-lessons-data.json';

const lessonsMap = lifeLessonsData as Record<string, GitaLifeLesson>;

export function getLifeLessonByVerseId(verseId: string): GitaLifeLesson | undefined {
  return lessonsMap[verseId];
}

export function getAllLifeLessons(): Record<string, GitaLifeLesson> {
  return lessonsMap;
}

export function getTotalLifeLessonCount(): number {
  return Object.keys(lessonsMap).length;
}
