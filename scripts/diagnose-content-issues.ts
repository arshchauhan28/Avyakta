import fs from 'fs';
import path from 'path';

const lifeLessonsPath = path.join(process.cwd(), 'src/game/content/life-lessons-data.json');
const levelsPath = path.join(process.cwd(), 'src/game/content/levels-data.json');

const lifeLessons = JSON.parse(fs.readFileSync(lifeLessonsPath, 'utf-8'));
const levels = JSON.parse(fs.readFileSync(levelsPath, 'utf-8'));

console.log('=== CHECKING CHAPTER MISALIGNMENTS IN LIFE LESSONS ===\n');

interface Mismatch {
  verseId: string;
  issue: string;
  detail: string;
}

const mismatches: Mismatch[] = [];

for (const [id, lesson] of Object.entries<any>(lifeLessons)) {
  const [chStr, vStr] = id.split('.');
  const ch = parseInt(chStr, 10);
  const v = parseInt(vStr, 10);

  // Check if question mentions another chapter
  const q = lesson.understandingCheck.question;
  const chMatch = q.match(/Chapter (\d+)|Gita (\d+)\./i);
  if (chMatch) {
    const mentionedCh = parseInt(chMatch[1] || chMatch[2], 10);
    if (mentionedCh !== ch) {
      mismatches.push({
        verseId: id,
        issue: 'Chapter mismatch in Understanding Check question',
        detail: `Lesson is for Chapter ${ch}, but question mentions Chapter ${mentionedCh}: "${q}"`
      });
    }
  }

  // Check if explanation mentions Kshetra in Chapter 14
  if (ch === 14 && lesson.gitaExplanation.text.includes('Kshetra')) {
    mismatches.push({
      verseId: id,
      issue: 'Chapter 13 Kshetra content found in Chapter 14',
      detail: `Verse ${id} mentions Kshetra: "${lesson.gitaExplanation.text.slice(0, 100)}..."`
    });
  }

  // Check if 11.32 mentions Time
  if (id === '11.32' && !lesson.gitaExplanation.text.toLowerCase().includes('time') && !lesson.gitaExplanation.text.toLowerCase().includes('kala')) {
    mismatches.push({
      verseId: id,
      issue: '11.32 missing Time/Kala concept',
      detail: `11.32 has: "${lesson.gitaExplanation.text.slice(0, 100)}..."`
    });
  }
}

console.log(`Found ${mismatches.length} potential chapter content mismatches:\n`);
for (const m of mismatches) {
  console.log(`[${m.verseId}] ${m.issue}`);
  console.log(`       ${m.detail}\n`);
}

// Check duplicates in life lessons
const expMap = new Map<string, string[]>();
for (const [id, lesson] of Object.entries<any>(lifeLessons)) {
  const text = lesson.gitaExplanation.text.trim();
  if (!expMap.has(text)) expMap.set(text, []);
  expMap.get(text)!.push(id);
}

const dupExps = Array.from(expMap.entries()).filter(([k, ids]) => ids.length > 1);
console.log(`\nDuplicate Gita Explanations (${dupExps.length} groups):`);
for (const [text, ids] of dupExps) {
  console.log(`- Verses [${ids.join(', ')}]: "${text.slice(0, 80)}..."`);
}
