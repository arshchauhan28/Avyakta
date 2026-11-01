import { describe, it, expect } from 'vitest';
import { getLevelById, getNextLevel, getPreviousLevel } from '@/game/content/levels';
import { getChapter, getVerse, getAllChapters } from '@/lib/gita-data';
import { SaveManager } from '@/game/progression/SaveManager';
import { ProgressionService } from '@/game/progression/ProgressionService';
import fs from 'fs';
import path from 'path';

describe('Route Integrity & Obsolete System Removal Audit', () => {
  it('confirms obsolete feature directories and files are completely removed from filesystem', () => {
    const cwd = process.cwd();
    const removedPaths = [
      'src/app/search',
      'src/app/chapters',
      'src/app/bookmarks',
      'src/app/read',
      'src/app/scripture',
      'src/components/search',
      'src/components/bookmarks',
      'src/components/chapters',
      'src/components/reader',
      'src/lib/search.ts',
      'src/hooks/useBookmarks.ts',
      'src/game/simulation',
      'src/game/world',
      'src/game/cinematic',
      'src/game/engine/GameStateMachine.ts'
    ];

    for (const relPath of removedPaths) {
      const fullPath = path.join(cwd, relPath);
      expect(fs.existsSync(fullPath), `Expected ${relPath} to be removed`).toBe(false);
    }
  });

  it('safely handles invalid level IDs without crashing or returning corrupted data', () => {
    expect(getLevelById('99.99')).toBeUndefined();
    expect(getLevelById('invalid')).toBeUndefined();
    expect(getLevelById('0.0')).toBeUndefined();
    expect(getLevelById('1.48')).toBeUndefined(); // Chapter 1 has only 47 verses
    expect(getLevelById('2.73')).toBeUndefined(); // Chapter 2 has only 72 verses
    expect(getLevelById('')).toBeUndefined();

    // Verify valid boundaries
    expect(getLevelById('1.1')).toBeDefined();
    expect(getLevelById('1.47')).toBeDefined();
    expect(getLevelById('2.1')).toBeDefined();
    expect(getLevelById('2.72')).toBeDefined();
    expect(getLevelById('18.78')).toBeDefined();
  });

  it('verifies nextLevel and previousLevel navigation across all chapter transitions', () => {
    // 1.1 -> previous is undefined, next is 1.2
    expect(getPreviousLevel('1.1')).toBeUndefined();
    expect(getNextLevel('1.1')?.id).toBe('1.2');

    // Chapter 1 -> Chapter 2 transition (1.47 -> 2.1)
    expect(getNextLevel('1.47')?.id).toBe('2.1');
    expect(getPreviousLevel('2.1')?.id).toBe('1.47');

    // Chapter 2 -> Chapter 3 transition (2.72 -> 3.1)
    expect(getNextLevel('2.72')?.id).toBe('3.1');
    expect(getPreviousLevel('3.1')?.id).toBe('2.72');

    // Chapter 18 conclusion (18.77 -> 18.78 -> undefined)
    expect(getNextLevel('18.77')?.id).toBe('18.78');
    expect(getNextLevel('18.78')).toBeUndefined();
    expect(getPreviousLevel('18.78')?.id).toBe('18.77');
  });

  it('validates canonical scripture integrity: exactly 18 chapters and 700 verses', () => {
    const chapters = getAllChapters();
    expect(chapters).toHaveLength(18);

    let totalVerses = 0;
    for (const ch of chapters) {
      expect(ch.number).toBeGreaterThanOrEqual(1);
      expect(ch.number).toBeLessThanOrEqual(18);
      expect(ch.nameSanskrit).toBeDefined();
      expect(ch.nameEnglish).toBeDefined();
      expect(ch.verseCount).toBeGreaterThan(0);
      totalVerses += ch.verseCount;

      // Verify every verse in chapter exists
      for (let v = 1; v <= ch.verseCount; v++) {
        const verse = getVerse(ch.number, v);
        expect(verse, `Missing verse ${ch.number}.${v}`).toBeDefined();
        expect(verse?.sanskrit).toBeTruthy();
        expect(verse?.transliteration).toBeTruthy();
      }
    }

    expect(totalVerses).toBe(700);
  });
});
