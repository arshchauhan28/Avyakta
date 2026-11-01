export interface UnderstandingOption {
  id: string;
  text: string;
  textHindi?: string;
}

export interface UnderstandingCheck {
  question: string;
  questionHindi?: string;
  options: UnderstandingOption[];
  correctAnswerId: string;
  feedback: string;
  feedbackHindi?: string;
}

import { ContentReviewStatus } from './level';

export interface GitaLifeLesson {
  verseId: string; // e.g. "1.1", "2.47", "18.78"

  // Section A: The Gita Says
  gitaExplanation: {
    text: string;
    textHindi?: string;
    context: string;
    contextHindi?: string;
  };

  // Section B: Deeper Understanding
  deeperUnderstanding: {
    explanation: string;
    explanationHindi?: string;
    sourceReferences: string[];
  };

  // Section C: Gita In Real Life
  realLifeApplication: {
    title: string;
    titleHindi?: string;
    scenario: string;
    scenarioHindi?: string;
    connection: string;
    connectionHindi?: string;
    isInterpretive: boolean;
  };

  // Section D: Key Takeaway
  keyTakeaway: string;
  keyTakeawayHindi?: string;

  // Section E: Check Your Understanding
  understandingCheck: UnderstandingCheck;

  reviewStatus: ContentReviewStatus | "reviewed";
}
