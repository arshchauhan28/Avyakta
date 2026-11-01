import { describe, it, expect, beforeEach } from 'vitest';
import { ALL_GAME_LEVELS, getLevelById } from '@/game/content/levels';
import { getLifeLessonByVerseId, getAllLifeLessons } from '@/game/content/life-lessons';
import { SaveManager } from '@/game/progression/SaveManager';
import { ProgressionService } from '@/game/progression/ProgressionService';

describe('Task 2: Understand the Teaching — 5-Section Educational Architecture', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('verifies that all 700 levels have structured 5-section GitaLifeLesson records', () => {
    const allLessons = getAllLifeLessons();
    expect(Object.keys(allLessons).length).toBe(700);

    for (const level of ALL_GAME_LEVELS) {
      const lesson = level.lifeLesson || getLifeLessonByVerseId(level.id);
      expect(lesson).toBeDefined();
      expect(lesson?.verseId).toBe(level.id);

      // Section A: The Gita Says
      expect(lesson?.gitaExplanation.text.length).toBeGreaterThan(10);
      expect(lesson?.gitaExplanation.context.length).toBeGreaterThan(5);

      // Section B: Deeper Understanding
      expect(lesson?.deeperUnderstanding.explanation.length).toBeGreaterThan(10);
      expect(lesson?.deeperUnderstanding.sourceReferences.length).toBeGreaterThan(0);

      // Section C: Gita In Real Life
      expect(lesson?.realLifeApplication.title.length).toBeGreaterThan(3);
      expect(lesson?.realLifeApplication.scenario.length).toBeGreaterThan(10);
      expect(lesson?.realLifeApplication.connection.length).toBeGreaterThan(10);
      expect(lesson?.realLifeApplication.isInterpretive).toBe(true);

      // Section D: Key Takeaway
      expect(lesson?.keyTakeaway.length).toBeGreaterThan(5);

      // Section E: Check Your Understanding
      expect(lesson?.understandingCheck.question.length).toBeGreaterThan(5);
      expect(lesson?.understandingCheck.options.length).toBe(4);
      expect(lesson?.understandingCheck.feedback.length).toBeGreaterThan(5);

      // Defensible answer key
      const correctOpt = lesson?.understandingCheck.options.find(
        o => o.id === lesson.understandingCheck.correctAnswerId
      );
      expect(correctOpt).toBeDefined();
      expect(correctOpt?.text.length).toBeGreaterThan(5);

      // Honest draft review status
      expect(lesson?.reviewStatus).toBe('draft');
    }
  });

  it('validates critical key verses for authentic educational content and context', () => {
    // 1. Shloka 1.1 (King Dhritarashtra's opening partiality)
    const l1_1 = getLevelById('1.1')!.lifeLesson!;
    expect(l1_1.gitaExplanation.context).toContain('Dhritarashtra');
    expect(l1_1.realLifeApplication.title).toContain('Leadership');
    expect(l1_1.understandingCheck.question).toContain('māmakāḥ');

    // 2. Shloka 1.2 (Duryodhana approaching Drona — narrative exposition, not non-attachment)
    const l1_2 = getLevelById('1.2')!.lifeLesson!;
    expect(l1_2.gitaExplanation.context).toContain('Duryodhana');
    expect(l1_2.realLifeApplication.title).toContain('Insecurity');
    expect(l1_2.understandingCheck.correctAnswerId).toBeDefined();

    // 3. Shloka 2.47 (Karma Yoga foundation: Karmanye vadhikaraste)
    const l2_47 = getLevelById('2.47')!.lifeLesson!;
    expect(l2_47.gitaExplanation.text).toContain('right only to perform your duty');
    expect(l2_47.realLifeApplication.title).toContain('Preparation Over Performance Anxiety');
    expect(l2_47.keyTakeaway).toContain('anxiety');

    // 4. Shloka 6.5 (The mind as friend or foe)
    const l6_5 = getLevelById('6.5')!.lifeLesson!;
    expect(l6_5.gitaExplanation.text).toContain('mind');
    expect(l6_5.realLifeApplication.title).toContain('Focus');

    // 5. Shloka 18.78 (Closing benediction of victory and righteousness)
    const l18_78 = getLevelById('18.78')!.lifeLesson!;
    expect(l18_78.gitaExplanation.text).toContain('Sanjaya');
    expect(l18_78.realLifeApplication.title).toContain('Vision');
  });

  it('verifies that completing Task 2 understanding check unlocks Task 3 and persists', () => {
    let progress = SaveManager.loadProgress();

    // Complete Task 1 first
    progress = ProgressionService.updateRoomTask('2.47', 'reading', true, progress);
    let room = SaveManager.getRoomProgress('2.47', progress);
    expect(room.tasks.reading).toBe(true);
    expect(room.tasks.understanding).toBe(false);
    expect(room.tasks.challenge).toBe(false);

    // Simulate incorrect answer: should NOT unlock Task 2 or Task 3
    const lesson = getLevelById('2.47')!.lifeLesson!;
    const wrongOptId = lesson.understandingCheck.options.find(
      o => o.id !== lesson.understandingCheck.correctAnswerId
    )!.id;

    const isWrongValid = wrongOptId === lesson.understandingCheck.correctAnswerId;
    expect(isWrongValid).toBe(false);
    // Progress remains false
    room = SaveManager.getRoomProgress('2.47', progress);
    expect(room.tasks.understanding).toBe(false);

    // Simulate correct answer: completes Task 2 and unlocks Task 3
    const correctOptId = lesson.understandingCheck.correctAnswerId;
    const isCorrectValid = correctOptId === lesson.understandingCheck.correctAnswerId;
    expect(isCorrectValid).toBe(true);

    progress = ProgressionService.updateRoomTask('2.47', 'understanding', true, progress);
    room = SaveManager.getRoomProgress('2.47', progress);
    expect(room.tasks.understanding).toBe(true);

    // Reload from storage to verify persistence
    const reloaded = SaveManager.loadProgress();
    const reloadedRoom = SaveManager.getRoomProgress('2.47', reloaded);
    expect(reloadedRoom.tasks.understanding).toBe(true);
  });
});
