import fs from 'fs';
import path from 'path';
import { ALL_GAME_LEVELS } from '../src/game/content/levels';
import { CHAPTER_WORLDS, getWorldByChapter } from '../src/game/content/worlds';
import { GameLevel } from '../src/game/types/level';

interface ValidationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
  stats: {
    totalChapters: number;
    totalLevels: number;
    totalWorlds: number;
    uniquePromptsCount: number;
    gameplayModes: Record<string, number>;
    challengeTypes: Record<string, number>;
    reviewStatusCount: Record<string, number>;
  };
}

export function validateGameContent(): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const stats = {
    totalChapters: CHAPTER_WORLDS.length,
    totalLevels: ALL_GAME_LEVELS.length,
    totalWorlds: CHAPTER_WORLDS.length,
    uniquePromptsCount: 0,
    gameplayModes: {} as Record<string, number>,
    challengeTypes: {} as Record<string, number>,
    reviewStatusCount: {} as Record<string, number>
  };

  // 1. Verify exactly 18 chapter learning modules
  if (CHAPTER_WORLDS.length !== 18) {
    errors.push(`Expected 18 chapter learning modules, found ${CHAPTER_WORLDS.length}`);
  }

  // 2. Verify exactly 700 canonical levels
  if (ALL_GAME_LEVELS.length !== 700) {
    errors.push(`Expected exactly 700 levels, found ${ALL_GAME_LEVELS.length}`);
  }

  const seenLevelIds = new Set<string>();
  const seenGlobalIndices = new Set<number>();
  const seenPrompts = new Set<string>();

  // Known legacy generic template signatures to ban
  const BANNED_GENERIC_PATTERNS = [
    'It advocates renouncing all social action and living in total isolation',
    'Act out of anger or anxiety over what the outcome might be',
    'I acknowledge the tendency to cling to outcomes',
    'What central insight does Shloka 1.2 convey?'
  ];

  for (let i = 0; i < ALL_GAME_LEVELS.length; i++) {
    const level: GameLevel = ALL_GAME_LEVELS[i];
    const expectedGlobal = i + 1;

    // Global index sequence
    if (level.globalIndex !== expectedGlobal) {
      errors.push(`Level ${level.id} has globalIndex ${level.globalIndex}, expected ${expectedGlobal}`);
    }

    if (seenGlobalIndices.has(level.globalIndex)) {
      errors.push(`Duplicate global index found: ${level.globalIndex}`);
    }
    seenGlobalIndices.add(level.globalIndex);

    // Duplicate level ID check
    if (seenLevelIds.has(level.id)) {
      errors.push(`Duplicate level ID found: ${level.id}`);
    }
    seenLevelIds.add(level.id);

    // Track mode stats
    stats.gameplayModes[level.gameplayMode] = (stats.gameplayModes[level.gameplayMode] || 0) + 1;
    stats.reviewStatusCount[level.reviewStatus] = (stats.reviewStatusCount[level.reviewStatus] || 0) + 1;

    // Check canonical chapter reference
    const world = getWorldByChapter(level.chapter);
    if (!world) {
      errors.push(`Level ${level.id} references invalid chapter ${level.chapter}.`);
    } else if (level.verse < world.levelRange.startVerse || level.verse > world.levelRange.endVerse) {
      errors.push(`Level ${level.id} verse ${level.verse} out of canonical range [${world.levelRange.startVerse}, ${world.levelRange.endVerse}] for Chapter ${level.chapter}.`);
    }

    // Check learning objective
    if (!level.learningObjective || level.learningObjective.trim().length < 10) {
      errors.push(`Level ${level.id} has empty or trivial learning objective.`);
    }

    // Check explanation
    if (!level.explanation || level.explanation.trim().length < 5) {
      errors.push(`Level ${level.id} has empty explanation.`);
    }

    // Check challenge
    if (!level.challenge) {
      errors.push(`Level ${level.id} is missing challenge definition.`);
    } else {
      const chal = level.challenge;
      stats.challengeTypes[chal.type] = (stats.challengeTypes[chal.type] || 0) + 1;

      if (!chal.prompt || chal.prompt.trim().length === 0) {
        errors.push(`Level ${level.id} challenge prompt is empty.`);
      }

      // Automated check for repeated prompts
      if (seenPrompts.has(chal.prompt)) {
        errors.push(`Level ${level.id} has duplicate challenge prompt: "${chal.prompt.slice(0, 60)}..."`);
      }
      seenPrompts.add(chal.prompt);

      // Automated check for generic distractors / templates
      const challengeStr = JSON.stringify(chal);
      for (const banned of BANNED_GENERIC_PATTERNS) {
        if (challengeStr.includes(banned)) {
          errors.push(`Level ${level.id} contains banned generic template text: "${banned}"`);
        }
      }

      // Check answer validation criteria
      if (chal.type === 'multiple-choice' || chal.type === 'decision' || chal.type === 'reflection') {
        if (!chal.options || chal.options.length < 2) {
          errors.push(`Level ${level.id} challenge options missing or fewer than 2.`);
        } else {
          const hasCorrect = chal.options.some(o => o.isCorrect === true);
          if (!hasCorrect) {
            errors.push(`Level ${level.id} challenge has no correct option designated.`);
          }
          if (!chal.correctAnswer) {
            errors.push(`Level ${level.id} challenge missing correctAnswer key.`);
          }
        }
      } else if (chal.type === 'matching') {
        if (!chal.matchingPairs || chal.matchingPairs.length < 2) {
          errors.push(`Level ${level.id} matching challenge has fewer than 2 pairs.`);
        }
      } else if (chal.type === 'shloka-puzzle') {
        if (!chal.shlokaSegments || chal.shlokaSegments.length < 2) {
          errors.push(`Level ${level.id} shloka puzzle has fewer than 2 segments.`);
        }
        if (!chal.correctAnswer) {
          errors.push(`Level ${level.id} shloka puzzle missing correctAnswer order array.`);
        }
      }

      if (!chal.explanation || chal.explanation.trim().length < 5) {
        errors.push(`Level ${level.id} challenge has empty explanation.`);
      }
    }

    // Check Task 2: GitaLifeLesson (Understand the Teaching)
    if (!level.lifeLesson) {
      errors.push(`Level ${level.id} is missing Task 2 lifeLesson definition.`);
    } else {
      const lesson = level.lifeLesson;
      if (lesson.verseId !== level.id) {
        errors.push(`Level ${level.id} lifeLesson.verseId "${lesson.verseId}" does not match level.id`);
      }
      if (!lesson.gitaExplanation?.text || lesson.gitaExplanation.text.trim().length < 10) {
        errors.push(`Level ${level.id} lifeLesson is missing Section A (The Gita Says) text.`);
      }
      if (!lesson.deeperUnderstanding?.explanation || lesson.deeperUnderstanding.explanation.trim().length < 10) {
        errors.push(`Level ${level.id} lifeLesson is missing Section B (Deeper Understanding) explanation.`);
      }
      if (!lesson.deeperUnderstanding?.sourceReferences || lesson.deeperUnderstanding.sourceReferences.length === 0) {
        errors.push(`Level ${level.id} lifeLesson is missing source references.`);
      }
      if (!lesson.realLifeApplication?.scenario || lesson.realLifeApplication.scenario.trim().length < 10) {
        errors.push(`Level ${level.id} lifeLesson is missing Section C (Real Life Application) scenario.`);
      }
      if (!lesson.keyTakeaway || lesson.keyTakeaway.trim().length < 5) {
        errors.push(`Level ${level.id} lifeLesson is missing Section D (Key Takeaway).`);
      }
      if (!lesson.understandingCheck) {
        errors.push(`Level ${level.id} lifeLesson is missing Section E (Understanding Check).`);
      } else {
        const check = lesson.understandingCheck;
        if (!check.question || check.question.trim().length < 5) {
          errors.push(`Level ${level.id} understandingCheck is missing question.`);
        }
        if (!check.options || check.options.length < 4) {
          errors.push(`Level ${level.id} understandingCheck has fewer than 4 options.`);
        }
        const hasValidAnswer = check.options?.some(o => o.id === check.correctAnswerId);
        if (!hasValidAnswer) {
          errors.push(`Level ${level.id} understandingCheck has invalid correctAnswerId "${check.correctAnswerId}".`);
        }
        if (!check.feedback || check.feedback.trim().length < 5) {
          errors.push(`Level ${level.id} understandingCheck is missing feedback.`);
        }
      }
    }

    // Check level ID format ch.v
    const [chStr, vStr] = level.id.split('.');
    if (parseInt(chStr, 10) !== level.chapter || parseInt(vStr, 10) !== level.verse) {
      errors.push(`Level id ${level.id} does not match chapter ${level.chapter} and verse ${level.verse}`);
    }

    // Verify first and last level
    if (i === 0 && level.id !== '1.1') {
      errors.push(`First level must be 1.1, got ${level.id}`);
    }
    if (i === 699 && level.id !== '18.78') {
      errors.push(`Final 700th level must be 18.78, got ${level.id}`);
    }
  }

  stats.uniquePromptsCount = seenPrompts.size;

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    stats
  };
}

// Direct execution
const result = validateGameContent();
console.log('--- AVYAKTA GAME CONTENT VALIDATION REPORT ---');
console.log(`Total Chapters:       ${result.stats.totalChapters}`);
console.log(`Total Levels:         ${result.stats.totalLevels}`);
console.log(`Unique Prompts:       ${result.stats.uniquePromptsCount}`);
console.log(`Gameplay Modes:       `, JSON.stringify(result.stats.gameplayModes, null, 2));
console.log(`Challenge Types:      `, JSON.stringify(result.stats.challengeTypes, null, 2));
console.log(`Review Status Count:  `, JSON.stringify(result.stats.reviewStatusCount, null, 2));

if (!result.passed) {
  console.error(`\nValidation FAILED with ${result.errors.length} errors:`);
  result.errors.slice(0, 15).forEach(e => console.error(` - ${e}`));
  process.exit(1);
} else {
  console.log('\n[PASS] All 700 levels, 18 chapter learning modules, and challenge definitions validated successfully with ZERO generic templates!');
}
