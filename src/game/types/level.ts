export type GameplayMode =
  | "exploration"
  | "cinematic"
  | "decision"
  | "shloka-puzzle"
  | "reflection"
  | "mastery";

export type ChallengeType =
  | "multiple-choice"
  | "matching"
  | "ordering"
  | "decision"
  | "shloka-puzzle"
  | "reflection";

export type ContentReviewStatus =
  | "draft"
  | "automated_checked"
  | "source_checked"
  | "language_reviewed"
  | "scholarly_reviewed"
  | "approved";

export type ReviewStatus = ContentReviewStatus | "reviewed";

export interface ChallengeOption {
  id: string;
  text: string;
  textHindi?: string;
  isCorrect?: boolean;
  explanation?: string;
  explanationHindi?: string;
  consequence?: string; // For decision simulations
  consequenceHindi?: string;
}

export interface MatchingPair {
  id: string;
  sanskritWord: string;
  transliteration?: string;
  meaning: string;
  meaningHindi?: string;
}

export interface ShlokaSegment {
  id: string;
  sanskrit: string;
  order: number;
}

export interface ChallengeDefinition {
  id: string;
  verseId: string;
  type: ChallengeType;
  prompt: string;
  promptHindi?: string;
  instruction: string;
  instructionHindi?: string;
  options?: ChallengeOption[];
  matchingPairs?: MatchingPair[];
  shlokaSegments?: ShlokaSegment[];
  correctAnswer?: string | string[]; // Option ID(s) or segment IDs in order
  explanation: string;
  explanationHindi?: string;
  reflectionPrompt?: string;
  reflectionPromptHindi?: string;
  practicalApplication?: string;
  practicalApplicationHindi?: string;
}

import { GitaLifeLesson } from './life-lesson';

export interface GameLevel {
  id: string; // e.g. "1.1", "2.47", "18.78"
  globalIndex: number; // 1 to 700
  chapter: number; // 1 to 18
  verse: number; // 1 to chapter.verseCount
  title: string;
  titleHindi?: string;
  gameplayMode: GameplayMode;
  learningObjective: string;
  learningObjectiveHindi?: string;
  narrativeContext: string;
  narrativeContextHindi?: string;
  explanation: string;
  explanationHindi?: string;
  interpretationSourceIds: string[];
  worldId?: string; // Legacy field retained for backwards-compatible JSON parsing
  sceneId?: string; // Legacy field
  cinematicId?: string; // Legacy field
  challengeId: string;
  challenge: ChallengeDefinition;
  lifeLesson?: GitaLifeLesson;
  requiredObjectives: string[];
  minimumMasteryScore: number;
  xpReward: number;
  reviewStatus: ReviewStatus;
}
