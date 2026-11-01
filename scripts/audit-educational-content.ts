import fs from 'fs';
import path from 'path';

interface ShlokaData {
  chapter: number;
  verse: number;
  sanskrit: string;
  transliteration: string;
  wordMeanings?: string;
  translations: {
    english?: { text: string; author?: string };
    hindi?: { text: string; author?: string };
  };
  commentary?: {
    english?: { text: string; author?: string };
    hindi?: { text: string; author?: string };
  };
}

interface LifeLesson {
  verseId: string;
  chapter: number;
  verse: number;
  gitaExplanation: {
    text: string;
    textHindi: string;
    keyThemes?: string[];
    keyThemesHindi?: string[];
  };
  deeperUnderstanding: {
    explanation: string;
    explanationHindi: string;
    sourceReferences: string[];
    philosophicalConcepts?: string[];
  };
  realLifeApplication: {
    title: string;
    titleHindi: string;
    scenario: string;
    scenarioHindi: string;
    applicationSteps?: string[];
    applicationStepsHindi?: string[];
  };
  keyTakeaway: string;
  keyTakeawayHindi: string;
  understandingCheck: {
    question: string;
    questionHindi: string;
    options: Array<{
      id: string;
      text: string;
      textHindi: string;
    }>;
    correctAnswerId: string;
    feedback: string;
    feedbackHindi: string;
  };
}

interface GameLevel {
  id: string;
  globalIndex: number;
  chapter: number;
  verse: number;
  title: string;
  titleHindi?: string;
  gameplayMode: string;
  learningObjective: string;
  learningObjectiveHindi?: string;
  narrativeContext: string;
  narrativeContextHindi?: string;
  explanation: string;
  explanationHindi?: string;
  interpretationSourceIds: string[];
  challenge: {
    id: string;
    verseId: string;
    type: string;
    prompt: string;
    promptHindi?: string;
    instruction: string;
    instructionHindi?: string;
    options?: Array<{
      id: string;
      text: string;
      textHindi?: string;
      isCorrect?: boolean;
      explanation?: string;
      explanationHindi?: string;
    }>;
    matchingPairs?: Array<{
      id: string;
      sanskritWord: string;
      meaning: string;
      meaningHindi?: string;
    }>;
    shlokaSegments?: Array<{
      id: string;
      sanskrit: string;
      order: number;
    }>;
    correctAnswer?: string | string[];
    explanation: string;
    explanationHindi?: string;
  };
  reviewStatus: string;
}

function runAudit() {
  console.log('================================================================');
  console.log('   AVYAKTA COMPLETE EDUCATIONAL CONTENT QUALITY AUDIT');
  console.log('================================================================\n');

  const rootDir = process.cwd();
  const chaptersPath = path.join(rootDir, 'src/data/chapters.json');
  const versesDir = path.join(rootDir, 'src/data/verses');
  const levelsPath = path.join(rootDir, 'src/game/content/levels-data.json');
  const lifeLessonsPath = path.join(rootDir, 'src/game/content/life-lessons-data.json');

  // 1. Audit Scripture Dataset
  const chapters = JSON.parse(fs.readFileSync(chaptersPath, 'utf-8'));
  console.log(`Auditing ${chapters.length} chapters...`);

  let totalVerses = 0;
  const verseMap = new Map<string, ShlokaData>();
  const speakerStats: Record<string, number> = {};

  for (let ch = 1; ch <= 18; ch++) {
    const chFile = path.join(versesDir, `chapter-${String(ch).padStart(2, '0')}.json`);
    if (!fs.existsSync(chFile)) {
      console.error(`Missing chapter file: ${chFile}`);
      continue;
    }
    const chVerses: ShlokaData[] = JSON.parse(fs.readFileSync(chFile, 'utf-8'));
    totalVerses += chVerses.length;

    for (const v of chVerses) {
      const id = `${v.chapter}.${v.verse}`;
      verseMap.set(id, v);

      // Check speaker in Sanskrit or English
      const text = v.sanskrit;
      let speaker = 'Narrator';
      if (text.includes('धृतराष्ट्र उवाच')) speaker = 'Dhritarashtra';
      else if (text.includes('सञ्जय उवाच') || text.includes('संजय उवाच')) speaker = 'Sanjaya';
      else if (text.includes('अर्जुन उवाच')) speaker = 'Arjuna';
      else if (text.includes('श्रीभगवानुवाच') || text.includes('भगवानुवाच')) speaker = 'Krishna';
      speakerStats[speaker] = (speakerStats[speaker] || 0) + 1;
    }
  }

  console.log(`Total Verses Loaded: ${totalVerses} across 18 chapters`);
  console.log('Speaker Distribution (Identified Openers):', speakerStats);

  // 2. Audit Life Lessons
  const lifeLessons: Record<string, LifeLesson> = JSON.parse(fs.readFileSync(lifeLessonsPath, 'utf-8'));
  const lessonIds = Object.keys(lifeLessons);
  console.log(`Total Life Lessons Loaded: ${lessonIds.length}`);

  let missingHindiSections = 0;
  let understandingCheckIssues = 0;
  let emptyFeedbackCount = 0;
  const duplicateExplanations = new Map<string, string[]>();
  const duplicateTakeaways = new Map<string, string[]>();

  for (const id of lessonIds) {
    const l = lifeLessons[id];
    if (!l.gitaExplanation.textHindi || !l.deeperUnderstanding.explanationHindi || !l.realLifeApplication.scenarioHindi || !l.keyTakeawayHindi) {
      missingHindiSections++;
    }

    // Check duplicate explanations
    const expKey = l.gitaExplanation.text.trim().toLowerCase();
    if (!duplicateExplanations.has(expKey)) duplicateExplanations.set(expKey, []);
    duplicateExplanations.get(expKey)!.push(id);

    // Check duplicate takeaways
    const tkKey = l.keyTakeaway.trim().toLowerCase();
    if (!duplicateTakeaways.has(tkKey)) duplicateTakeaways.set(tkKey, []);
    duplicateTakeaways.get(tkKey)!.push(id);

    // Check understanding check
    const uc = l.understandingCheck;
    if (!uc || !uc.options || uc.options.length < 4 || !uc.correctAnswerId) {
      understandingCheckIssues++;
    } else {
      const hasCorrect = uc.options.some(o => o.id === uc.correctAnswerId);
      if (!hasCorrect) understandingCheckIssues++;
    }
    if (!uc.feedback || !uc.feedbackHindi) {
      emptyFeedbackCount++;
    }
  }

  // 3. Audit Game Levels
  const levels: GameLevel[] = JSON.parse(fs.readFileSync(levelsPath, 'utf-8'));
  console.log(`Total Game Levels Loaded: ${levels.length}`);

  let challengeAnswerKeyIssues = 0;
  let missingChallengeHindi = 0;
  const challengeTypes: Record<string, number> = {};
  const reviewStatuses: Record<string, number> = {};

  for (const lvl of levels) {
    reviewStatuses[lvl.reviewStatus] = (reviewStatuses[lvl.reviewStatus] || 0) + 1;
    const c = lvl.challenge;
    challengeTypes[c.type] = (challengeTypes[c.type] || 0) + 1;

    if (!c.promptHindi || !c.instructionHindi || !c.explanationHindi) {
      missingChallengeHindi++;
    }

    if (c.type === 'multiple-choice' || c.type === 'decision' || c.type === 'reflection') {
      if (c.options) {
        const correctOpt = c.options.find(o => o.id === c.correctAnswer);
        if (!correctOpt) {
          challengeAnswerKeyIssues++;
        }
      }
    }
  }

  // 4. Detailed Audit of Representative Verses
  const representativeVerses = [
    '1.1', '1.2', '1.4',
    '2.47', '3.19', '6.5', '6.26',
    '11.32', '12.13', '14.5',
    '18.66', '18.78'
  ];

  console.log('\n================================================================');
  console.log('   IN-DEPTH AUDIT OF 12 REPRESENTATIVE VERSES');
  console.log('================================================================');

  for (const vId of representativeVerses) {
    const v = verseMap.get(vId);
    const l = lifeLessons[vId];
    const lvl = levels.find(x => x.id === vId);

    console.log(`\n--- SHLOKA ${vId} ---`);
    if (v) {
      console.log(`Sanskrit:   ${v.sanskrit.replace(/\n/g, ' ')}`);
      console.log(`English:    ${v.translations.english?.text?.slice(0, 100)}...`);
      console.log(`Hindi:      ${v.translations.hindi?.text?.slice(0, 100)}...`);
    }
    if (l) {
      console.log(`Gita Says:  ${l.gitaExplanation.text.slice(0, 90)}...`);
      console.log(`Real Life:  [${l.realLifeApplication.title}] ${l.realLifeApplication.scenario.slice(0, 90)}...`);
      console.log(`Takeaway:   ${l.keyTakeaway}`);
      console.log(`Check Q:    ${l.understandingCheck.question}`);
      console.log(`Correct Id: ${l.understandingCheck.correctAnswerId}`);
    }
    if (lvl) {
      console.log(`Challenge:  [${lvl.challenge.type}] ${lvl.challenge.prompt.slice(0, 90)}...`);
      console.log(`Correct Ans:${JSON.stringify(lvl.challenge.correctAnswer)}`);
      console.log(`Review Stat:${lvl.reviewStatus}`);
    }
  }

  // Report Summary
  console.log('\n================================================================');
  console.log('   AUDIT SUMMARY REPORT');
  console.log('================================================================');
  console.log(`Scripture Verses:              ${totalVerses} / 700 canonical`);
  console.log(`Life Lessons (Task 2):         ${lessonIds.length} / 700`);
  console.log(`Game Levels (Task 3):          ${levels.length} / 700`);
  console.log(`Missing Hindi Sections:        ${missingHindiSections}`);
  console.log(`Understanding Check Issues:    ${understandingCheckIssues}`);
  console.log(`Empty Feedback Count:          ${emptyFeedbackCount}`);
  console.log(`Challenge Answer Key Issues:   ${challengeAnswerKeyIssues}`);
  console.log(`Missing Challenge Hindi:       ${missingChallengeHindi}`);
  console.log(`Review Status Distribution:    `, reviewStatuses);
  console.log(`Challenge Type Distribution:   `, challengeTypes);

  const duplicateExpCount = Array.from(duplicateExplanations.values()).filter(arr => arr.length > 1).length;
  const duplicateTkCount = Array.from(duplicateTakeaways.values()).filter(arr => arr.length > 1).length;
  console.log(`Duplicate Explanation Groups:  ${duplicateExpCount}`);
  console.log(`Duplicate Takeaway Groups:     ${duplicateTkCount}`);
}

runAudit();
