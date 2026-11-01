# Avyakta — The Journey Through the Gita (श्रीमद्भगवद्गीता)

> **Ancient Wisdom for Everyday Life — Interactive Bhagavad Gita Learning Platform**  
> A focused, professional educational learning platform featuring all **18 Chapters and 700 Sequential Shloka-Based Learning Levels** of the Bhagavad Gita.

---

## 1. Project Overview

**Avyakta** (श्रीमद्भगवद्गीता) is an educational, interactive learning platform designed to guide learners step-by-step through the profound teachings of the Bhagavad Gita and their application to real life.

Every level is structured as a dedicated, focused **3-Task Learning Room**:

```text
START LEVEL
    │
    ▼
TASK 1: READ THE SHLOKA
(Authentic Sanskrit Devanagari, IAST transliteration, Hindi & English translations, word-by-word meanings, audio recitation)
    │
    ▼ [Mark Reading Complete]
TASK 2: UNDERSTAND THE TEACHING (GITA & LIFE)
(1. The Gita Says, 2. Deeper Understanding, 3. Gita in Real Life, 4. Key Takeaway, 5. Check Your Understanding)
    │
    ▼ [Correct Answer Unlocks Task 3]
TASK 3: KNOWLEDGE CHALLENGE
(Interactive verse-specific assessment testing actual understanding)
    │
    ▼ [Pass Challenge]
LEVEL COMPLETED ──▶ XP AWARDED ──▶ NEXT SHLOKA UNLOCKED (e.g., 1.1 ➔ 1.2, 1.47 ➔ 2.1)
```

---

## 2. Core Architecture & Features

### 2.1 The 3-Task Learning Room
1. **Task 1 — Read the Shloka**:
   - Original Sanskrit verse in sacred Devanagari typography.
   - Chapter and verse reference with speaker attribution.
   - Roman IAST transliteration.
   - Authentic Hindi & English translations (Swami Ramsukhdas, Swami Tejomayananda, Swami Sivananda, Swami Adidevananda).
   - Word-by-word Sanskrit meaning breakdown (*padachheda*).
   - High-fidelity Sanskrit audio recitation.
   - "Mark Reading Complete" button to unlock Task 2.

2. **Task 2 — Understand the Teaching (Gita & Life)**:
   - **Section A · The Gita Says**: Direct, authentic scriptural exposition.
   - **Section B · Deeper Understanding**: Classical philosophical insights with authentic source references.
   - **Section C · Gita in Real Life**: Modern real-world scenarios and scriptural connections.
   - **Section D · Key Takeaway**: Actionable wisdom for daily living.
   - **Section E · Check Your Understanding**: Interactive comprehension assessment. Submitting the correct answer unlocks Task 3.

3. **Task 3 — Knowledge Challenge**:
   - Verse-specific educational assessment (multiple-choice, Sanskrit meaning matching, shloka puzzle ordering, contextual comprehension).
   - Successful completion marks the room finished, awards wisdom XP once, and sequentially unlocks the next level.

### 2.2 Navigation & Sidebar
The platform navigation has been streamlined into strictly 5 core sections:
1. **Dashboard** (`/`): Learning overview, current shloka resume action, completed levels count, XP, rank, and recent progress.
2. **My Journey** (`/journey`): The 18 canonical chapter modules and 700 sequential learning rooms (`/journey/chapter/[chapter]` and `/learn/[chapter]/[verse]`).
3. **Achievements** (`/achievements`): Milestone badges and spiritual ranks from *Sadhaka* to *Yogeshwara*.
4. **My Progress** (`/progress`): Curriculum analytics, levels completed (out of 700), levels remaining, total XP, chapter mastery bars, and safe progress management.
5. **Settings** (`/settings`): Theme selection, language preferences, scripture font sizing, recitation audio controls, and save backup/restore.

---

## 3. Technology Stack

| Domain | Technology | Description |
|---|---|---|
| **Framework** | Next.js 15 (App Router) | High-performance React framework with server and client components |
| **Language** | TypeScript 5.7 | Strictly typed codebase with zero `any` leaks |
| **Styling** | Tailwind CSS 3.4 & Vanilla CSS | Neo-Brutalist clean educational interface with dark/light/parchment themes |
| **Icons** | Lucide React | Accessible, lightweight modern icons |
| **Celebrations** | canvas-confetti | Lightweight celebratory effects on room completion |
| **Testing** | Vitest & React Testing Library | Complete unit and end-to-end learning room flow test suites (100% pass) |
| **Validation** | tsx scripts | Automated verification of 700 levels, 18 chapters, and Gita & Life lessons |

---

## 4. Verification & Testing

All quality validation scripts pass cleanly:

```bash
# 1. Validate authentic scripture dataset
npm run validate:data

# 2. Validate all 700 levels, unique challenge prompts, and Gita & Life lessons
npm run validate:game

# 3. Type check with TypeScript compiler
npx tsc --noEmit

# 4. Check ESLint rules
npm run lint

# 5. Run test suites (65 tests across 12 test files)
npm run test

# 6. Production build
npm run build
```

---

## 5. Safe Progress Migration

Avyakta automatically migrates legacy save formats (v1 four-task saves containing simulations) into the clean v2 three-task format:
- All completed levels remain completed with all 3 tasks checked.
- All earned XP and unlocked achievements are strictly preserved.
- Obsolete simulation states and 3D graphics settings are safely discarded.
- In-progress tasks (reading, understanding, challenge) are preserved without resetting user progress.
- Zero duplicate XP is awarded during migration.
