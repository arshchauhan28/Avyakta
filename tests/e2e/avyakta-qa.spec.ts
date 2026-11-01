import { test, expect } from '@playwright/test';
import path from 'path';

// Isolated test save key
const SAVE_KEY = 'avyakta_game_save_v1';
const SCREENSHOT_DIR = path.resolve(process.cwd(), 'test-artifacts/screenshots');

test.describe('Avyakta — Comprehensive Quality Assurance & Real-Browser Tests', () => {
  // Test A — Full-Width Horizontal Navbar & Dashboard
  test('Test A — Dashboard loads correctly with 5-item horizontal navigation, XP, and level status', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((key) => {
      window.localStorage.removeItem(key);
    }, SAVE_KEY);
    await page.reload();

    // Check main dashboard heading
    await expect(page.locator('h1').first()).toBeVisible();

    // Verify full-width horizontal navigation (no sidebar mounted)
    await expect(page.locator('aside')).toHaveCount(0);

    // Verify 5 main navigation sections in the horizontal navbar
    const nav = page.locator('nav').first();
    await expect(nav.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /my journey/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /achievements/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /progress/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /settings/i })).toBeVisible();

    // Verify XP counter is displayed
    await expect(page.getByText(/0 XP/i).first()).toBeVisible();

    // Verify Continue Learning action exists
    const continueBtn = page.getByRole('link', { name: /continue|start journey|resume/i }).first();
    await expect(continueBtn).toBeVisible();
  });

  // Test B — Learning Journey
  test('Test B — Journey page displays all 18 chapters with level access control', async ({ page }) => {
    await page.goto('/journey');

    // Confirm heading
    await expect(page.locator('h1').first()).toBeVisible();

    // Verify all 18 curriculum modules (MODULE 1 to MODULE 18) are listed
    for (let i = 1; i <= 18; i++) {
      await expect(page.getByText(new RegExp(`MODULE ${i}\\b`, 'i')).first()).toBeVisible();
    }

    // Navigate into Chapter 1
    await page.goto('/journey/chapter/1');
    await expect(page.getByText(/Arjuna Visada Yoga/i).first()).toBeVisible();

    // Level 1.1 should be unlocked and clickable
    const level1Link = page.getByRole('link', { name: /1\.1\b/i }).first();
    await expect(level1Link).toBeVisible();
  });

  // Test C — Three-Task Learning Room Full Flow
  test('Test C — Full three-task flow in Level 1.1 from Task 1 to completion', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((key) => {
      window.localStorage.removeItem(key);
    }, SAVE_KEY);

    await page.goto('/learn/1/1');

    // Verify Room Title and Shloka Reference
    await expect(page.getByText(/SHLOKA ROOM 1\.1/i).first()).toBeVisible();

    // Task 1: Read the Shloka
    await expect(page.getByText(/Task 1/i).first()).toBeVisible();
    const markReadBtn = page.getByRole('button', { name: /Mark Reading Complete/i });
    await expect(markReadBtn).toBeVisible();
    await markReadBtn.scrollIntoViewIfNeeded();
    await markReadBtn.click();

    // Task 2: Check Your Understanding option A
    const correctOption = page.locator('button').filter({ hasText: /His deep-seated partiality/i }).first();
    await expect(correctOption).toBeVisible({ timeout: 5000 });
    await correctOption.click();

    // Click Verify Understanding
    const verifyBtn = page.getByRole('button', { name: /Verify Understanding/i });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    // Confirm Well Understood feedback
    await expect(page.getByText(/Well Understood/i)).toBeVisible();

    // Proceed to Task 3
    const proceedToTask3Btn = page.getByRole('button', { name: /Proceed to Knowledge Challenge/i });
    await expect(proceedToTask3Btn).toBeVisible();
    await proceedToTask3Btn.click();

    // Task 3: Knowledge Challenge
    await expect(page.getByText(/Task 3/i).first()).toBeVisible();

    // Select correct answer in Knowledge Challenge
    const challengeOption = page.locator('button').filter({ hasText: /māmakāḥ|His distinction between/i }).first();
    await expect(challengeOption).toBeVisible();
    await challengeOption.click();

    // Submit answer
    const submitChallengeBtn = page.getByRole('button', { name: /Submit Answer/i });
    await submitChallengeBtn.click();

    // Confirm mastery verified feedback
    await expect(page.getByText(/Mastery Verified/i)).toBeVisible();

    // Click Complete Level
    const completeLevelBtn = page.getByRole('button', { name: /Complete Level/i });
    await completeLevelBtn.click();

    // Level completion modal should appear
    await expect(page.getByText(/Room 1\.1 Finished/i)).toBeVisible();
    await expect(page.getByText(/Base Verse Reward/i)).toBeVisible();
    await expect(page.getByText(/\+20 XP/i).first()).toBeVisible();
    await expect(page.getByText(/First Attempt Perfect Bonus/i)).toBeVisible();
    await expect(page.getByText(/\+5 XP/i).first()).toBeVisible();
    await expect(page.getByText(/Total Earned/i)).toBeVisible();
    await expect(page.getByText(/\+25 XP/i)).toBeVisible();

    // Level 1.2 button should be present in modal
    await expect(page.getByRole('button', { name: /Continue to Next Shloka \(1\.2\)/i })).toBeVisible();
  });

  // Test D — Incorrect Answer Feedback & Retry
  test('Test D — Incorrect answers in Task 2 show feedback and do not unlock Task 3', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((key) => {
      const initialSave = {
        version: 2,
        highestCompletedIndex: 0,
        completedLevelIds: [],
        awardedRewardIds: [],
        totalXP: 0,
        currentLevelId: '1.1',
        unlockedAchievementIds: [],
        gameCompleted: false,
        lastPlayedAt: new Date().toISOString(),
        chapterCompletionDates: {},
        settings: {
          masterVolume: 80,
          musicVolume: 60,
          ambientVolume: 70,
          sfxVolume: 80,
          recitationVolume: 90,
          showSubtitles: true,
          language: 'en',
        },
        rooms: {
          '1.1': {
            levelId: '1.1',
            completed: false,
            tasks: { reading: true, understanding: false, challenge: false },
            score: 0,
          },
        },
      };
      window.localStorage.setItem(key, JSON.stringify(initialSave));
    }, SAVE_KEY);

    await page.goto('/learn/1/1');

    // Section E option B (incorrect option)
    const incorrectOption = page.locator('button').filter({ hasText: /His desire to mediate a peaceful treaty/i }).first();
    await expect(incorrectOption).toBeVisible({ timeout: 5000 });
    await incorrectOption.scrollIntoViewIfNeeded();
    await incorrectOption.click();

    const verifyBtn = page.getByRole('button', { name: /Verify Understanding/i });
    await verifyBtn.click();

    // Should display reflection needed feedback
    await expect(page.getByText(/Reflection Needed/i)).toBeVisible();

    // Task 3 accordion should remain disabled/locked
    const task3Btn = page.getByRole('button', { name: /Task 3/i });
    await expect(task3Btn).toBeDisabled();

    // Retry button should be visible
    const retryBtn = page.getByRole('button', { name: /Try Again|Try Another Choice/i });
    await expect(retryBtn).toBeVisible();
    await retryBtn.click();

    // Feedback should clear
    await expect(page.getByText(/Reflection Needed/i)).not.toBeVisible();
  });

  // Test E — Persistence across Browser Refresh
  test('Test E — Progress and XP persist across browser refresh without duplication', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((key) => {
      const completedSave = {
        version: 2,
        highestCompletedIndex: 1,
        completedLevelIds: ['1.1'],
        awardedRewardIds: ['1.1'],
        totalXP: 100,
        currentLevelId: '1.2',
        unlockedAchievementIds: ['first_shloka'],
        gameCompleted: false,
        lastPlayedAt: new Date().toISOString(),
        chapterCompletionDates: {},
        settings: {
          masterVolume: 80,
          musicVolume: 60,
          ambientVolume: 70,
          sfxVolume: 80,
          recitationVolume: 90,
          showSubtitles: true,
          language: 'en',
        },
        rooms: {
          '1.1': {
            levelId: '1.1',
            completed: true,
            tasks: { reading: true, understanding: true, challenge: true },
            score: 100,
          },
        },
      };
      window.localStorage.setItem(key, JSON.stringify(completedSave));
    }, SAVE_KEY);

    await page.reload();

    // Verify 100 XP is preserved
    await expect(page.getByText(/100 XP/i).first()).toBeVisible();

    // Replay Level 1.1
    await page.goto('/learn/1/1');
    await expect(page.getByText(/SHLOKA ROOM 1\.1/i).first()).toBeVisible();

    // Navigate to next level
    await page.goto('/learn/1/2');
    await expect(page.getByText(/SHLOKA ROOM 1\.2/i).first()).toBeVisible();

    // Confirm totalXP did not duplicate
    await page.goto('/');
    await expect(page.getByText(/100 XP/i).first()).toBeVisible();
  });

  // Test F — Save Migration & Malformed Recovery
  test('Test F — Migrates legacy v1 4-task save and handles malformed data gracefully', async ({ page }) => {
    await page.goto('/');

    // 1. Seed legacy 4-task save
    await page.evaluate((key) => {
      const legacySave = {
        highestCompletedIndex: 2,
        completedLevelIds: ['1.1', '1.2'],
        awardedRewardIds: ['1.1'],
        totalXP: 50,
        currentLevelId: '1.3',
        unlockedAchievementIds: [],
        gameCompleted: false,
        settings: {},
      };
      window.localStorage.setItem(key, JSON.stringify(legacySave));
    }, SAVE_KEY);

    await page.reload();
    await expect(page.locator('h1').first()).toBeVisible();
    await page.waitForTimeout(500);

    // Verify migration succeeded
    const migrated = await page.evaluate((key) => {
      return JSON.parse(window.localStorage.getItem(key) || '{}');
    }, SAVE_KEY);

    expect(migrated.version).toBe(2);
    expect(migrated.rooms).toBeDefined();

    // 2. Corrupt save recovery
    await page.evaluate((key) => {
      window.localStorage.setItem(key, '{ invalid json corrupted! }');
    }, SAVE_KEY);

    await page.reload();
    await expect(page.locator('h1').first()).toBeVisible();
  });

  // Test G — Chapter Boundaries & Final Completion
  test('Test G — Chapter boundaries transition sequentially and 18.78 triggers completion', async ({ page }) => {
    await page.goto('/');

    // Test transition from 1.47 -> 2.1
    await page.evaluate((key) => {
      const boundarySave = {
        version: 2,
        highestCompletedIndex: 47,
        completedLevelIds: Array.from({ length: 47 }, (_, i) => `1.${i + 1}`),
        awardedRewardIds: Array.from({ length: 47 }, (_, i) => `1.${i + 1}`),
        totalXP: 1000,
        currentLevelId: '2.1',
        unlockedAchievementIds: [],
        gameCompleted: false,
        lastPlayedAt: new Date().toISOString(),
        chapterCompletionDates: {},
        settings: {
          masterVolume: 80,
          musicVolume: 60,
          ambientVolume: 70,
          sfxVolume: 80,
          recitationVolume: 90,
          showSubtitles: true,
          language: 'en',
        },
        rooms: {},
      };
      window.localStorage.setItem(key, JSON.stringify(boundarySave));
    }, SAVE_KEY);

    await page.goto('/learn/2/1');
    await expect(page.getByText(/SHLOKA ROOM 2\.1/i).first()).toBeVisible();

    // Test 18.78 -> Final Completion
    await page.evaluate((key) => {
      const finalSave = {
        version: 2,
        highestCompletedIndex: 700,
        completedLevelIds: ['18.78'],
        awardedRewardIds: ['18.78'],
        totalXP: 25000,
        currentLevelId: '18.78',
        unlockedAchievementIds: [],
        gameCompleted: true,
        lastPlayedAt: new Date().toISOString(),
        chapterCompletionDates: {},
        settings: {
          masterVolume: 80,
          musicVolume: 60,
          ambientVolume: 70,
          sfxVolume: 80,
          recitationVolume: 90,
          showSubtitles: true,
          language: 'en',
        },
        rooms: {},
      };
      window.localStorage.setItem(key, JSON.stringify(finalSave));
    }, SAVE_KEY);

    await page.goto('/learn/18/78');
    await expect(page.getByText(/SHLOKA ROOM 18\.78/i).first()).toBeVisible();

    // Navigate to completion page
    await page.goto('/game/completion');
    await expect(page.getByText(/The Journey is Complete/i)).toBeVisible();
  });

  // Test H — Removed Features Return 404
  test('Test H — Removed routes return 404 and no dead links exist in UI', async ({ page }) => {
    // 1. Removed /search
    const searchRes = await page.goto('/search');
    expect(searchRes?.status() === 404 || (await page.getByText(/404|not found/i).count()) > 0).toBeTruthy();

    // 2. Removed /chapters
    const chaptersRes = await page.goto('/chapters');
    expect(chaptersRes?.status() === 404 || (await page.getByText(/404|not found/i).count()) > 0).toBeTruthy();

    // 3. Removed /read/1/1
    const readRes = await page.goto('/read/1/1');
    expect(readRes?.status() === 404 || (await page.getByText(/404|not found/i).count()) > 0).toBeTruthy();

    // 4. Removed /bookmarks
    const bookmarksRes = await page.goto('/bookmarks');
    expect(bookmarksRes?.status() === 404 || (await page.getByText(/404|not found/i).count()) > 0).toBeTruthy();

    // Verify navigation bar has no dead search links
    await page.goto('/');
    const searchLinks = page.locator('a[href="/search"]');
    await expect(searchLinks).toHaveCount(0);
  });

  // Test I — Mobile Responsiveness across Viewports
  const viewports = [
    { name: 'Mobile 320px', width: 320, height: 568 },
    { name: 'Mobile 375px', width: 375, height: 667 },
    { name: 'Tablet Portrait 768px', width: 768, height: 1024 },
    { name: 'Tablet Landscape 1024px', width: 1024, height: 768 },
    { name: 'Desktop 1440px', width: 1440, height: 900 },
  ];

  for (const vp of viewports) {
    test(`Test I — Viewport ${vp.name} (${vp.width}x${vp.height}) has no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      // Check Dashboard
      await page.goto('/');
      const dashOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(dashOverflow).toBeTruthy();

      // Check Learning Room
      await page.goto('/learn/1/1');
      const learnOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth <= window.innerWidth;
      });
      expect(learnOverflow).toBeTruthy();

      // Task 1 header must be visible
      await expect(page.getByText(/SHLOKA ROOM 1\.1/i).first()).toBeVisible();
    });
  }

  // Test J — Visual Quality Assurance & Screenshot Generation
  test('Test J — Visual QA and Screenshot Generation across themes and devices', async ({ page }) => {
    // 1. Dashboard — Dark Mode
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    const darkBtn1 = page.getByRole('button', { name: /Switch to Dark mode/i });
    if (await darkBtn1.isVisible()) await darkBtn1.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-dark.png`, fullPage: false });

    // 2. Dashboard — Light Mode
    const lightBtn1 = page.getByRole('button', { name: /Switch to Light mode/i });
    if (await lightBtn1.isVisible()) await lightBtn1.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/dashboard-light.png`, fullPage: false });

    // 3. My Journey — Dark Mode
    if (await darkBtn1.isVisible()) await darkBtn1.click();
    await page.goto('/journey');
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/journey-dark.png`, fullPage: false });

    // 4. Learning Room — Dark Mode
    await page.goto('/learn/1/1');
    const darkBtn2 = page.getByRole('button', { name: /Switch to Dark mode/i });
    if (await darkBtn2.isVisible()) await darkBtn2.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/learn-dark.png`, fullPage: false });

    // 5. Learning Room — Light Mode
    const lightBtn2 = page.getByRole('button', { name: /Switch to Light mode/i });
    if (await lightBtn2.isVisible()) await lightBtn2.click();
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/learn-light.png`, fullPage: false });

    // Switch back to dark for remaining screenshots
    if (await darkBtn2.isVisible()) await darkBtn2.click();

    // 6. Achievements
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    await page.goto('/achievements');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/achievements-dark.png`, fullPage: false });

    // 7. My Progress
    await page.goto('/progress');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/progress-dark.png`, fullPage: false });

    // 8. Settings
    await page.goto('/settings');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/settings-dark.png`, fullPage: false });

    // 9. Mobile Navbar
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(200);
    const menuBtn = page.getByRole('button', { name: /navigation menu/i });
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(200);
    }
    await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-navbar.png`, fullPage: false });

    // 10. Mobile Learning Room
    await page.goto('/learn/1/1');
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/mobile-learn.png`, fullPage: false });
  });

  // Test K — XP Reward Consistency, Persistence, and Replay Duplication Prevention
  test('Test K — XP persistence and duplicate reward prevention on refresh and replay', async ({ page }) => {
    // 1. Reset storage and navigate to fresh room 1.1
    await page.goto('/');
    await page.evaluate((key) => {
      window.localStorage.removeItem(key);
    }, SAVE_KEY);
    await page.goto('/learn/1/1');

    // 2. Verify header displays expected reward (+20 XP for uncompleted level)
    await expect(page.getByText(/\+20 XP/i).first()).toBeVisible();

    // 3. Complete Task 1
    const markReadBtn = page.getByRole('button', { name: /Mark Reading Complete/i });
    await markReadBtn.scrollIntoViewIfNeeded();
    await markReadBtn.click();

    // 4. Complete Task 2
    const correctOption = page.locator('button').filter({ hasText: /His deep-seated partiality/i }).first();
    await correctOption.click();
    await page.getByRole('button', { name: /Verify Understanding/i }).click();
    await page.getByRole('button', { name: /Proceed to Knowledge Challenge/i }).click();

    // 5. Complete Task 3 (with 100% score)
    const challengeOption = page.locator('button').filter({ hasText: /māmakāḥ|His distinction between/i }).first();
    await challengeOption.click();
    await page.getByRole('button', { name: /Submit Answer/i }).click();

    // 6. Complete level and observe completion reward breakdown
    await page.getByRole('button', { name: /Complete Level/i }).click();
    await expect(page.getByText(/Room 1\.1 Finished/i)).toBeVisible();
    await expect(page.getByText(/Base Verse Reward/i)).toBeVisible();
    await expect(page.getByText(/\+20 XP/i).first()).toBeVisible();
    await expect(page.getByText(/First Attempt Perfect Bonus/i)).toBeVisible();
    await expect(page.getByText(/\+5 XP/i).first()).toBeVisible();
    await expect(page.getByText(/Total Earned/i)).toBeVisible();
    await expect(page.getByText(/\+25 XP/i)).toBeVisible();

    // Verify lifetime XP is 25 XP in both navbar and modal
    await expect(page.getByText(/Total Lifetime XP/i)).toBeVisible();
    await expect(page.getByText('25 XP', { exact: true }).first()).toBeVisible();

    // Close modal
    await page.getByRole('button', { name: /Review Room Tasks/i }).click();

    // 7. Refresh browser and verify XP remains unchanged (25 XP)
    await page.reload();
    await expect(page.getByText(/SHLOKA ROOM 1\.1/i).first()).toBeVisible();

    // Room header should now display "+0 XP (Completed)"
    await expect(page.getByText(/\+0 XP \(Completed\)/i)).toBeVisible();

    // 8. Replay the level: pass Task 3 again
    const reviewTask3Btn = page.locator('button').filter({ hasText: /Challenge/i }).first();
    if (await reviewTask3Btn.isVisible()) {
      await reviewTask3Btn.click();
    }
    const retryBtn = page.getByRole('button', { name: /Retry Challenge/i });
    if (await retryBtn.isVisible()) {
      await retryBtn.click();
    }
    const replayOption = page.locator('button').filter({ hasText: /māmakāḥ|His distinction between/i }).first();
    await replayOption.click();
    await page.getByRole('button', { name: /Submit Answer/i }).click();
    await page.getByRole('button', { name: /Complete Level/i }).click();

    // 9. Verify completion modal explains replay and awards +0 XP
    await expect(page.getByText(/Room 1\.1 Finished/i)).toBeVisible();
    await expect(page.getByText(/\+0 XP \(Replayed\)/i)).toBeVisible();
    await expect(page.getByText(/Total Earned/i)).toBeVisible();
    await expect(page.getByText(/\+0 XP/i).first()).toBeVisible();
    await expect(page.getByText(/This room was previously mastered/i)).toBeVisible();

    // Total XP must remain 25 XP (no duplicate award) in navbar and modal
    await expect(page.getByText(/Total Lifetime XP/i)).toBeVisible();
    await expect(page.getByText('25 XP', { exact: true }).first()).toBeVisible();
  });

  // =========================================================================
  // Master Prompt Section 24: Bilingual Hindi-English & Settings QA
  // =========================================================================

  test('Test L1 — Bilingual Navigation: Navbar, Dashboard, Journey, Progress, Settings switch seamlessly', async ({ page }) => {
    await page.goto('/');
    await page.evaluate((key) => {
      window.localStorage.removeItem(key);
      window.localStorage.removeItem('gita_reader_preferences_v1');
    }, SAVE_KEY);
    await page.reload();

    // 1. Verify initial English Navigation
    const nav = page.locator('nav').first();
    await expect(nav.getByRole('link', { name: /dashboard/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /my journey/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /achievements/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /progress/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /settings/i })).toBeVisible();

    // 2. Switch to Hindi via Navbar LanguageSwitcher
    const hiBtn = page.getByRole('button', { name: 'हिन्दी' }).first();
    await expect(hiBtn).toBeVisible();
    await hiBtn.click();
    await page.waitForTimeout(300);

    // 3. Verify Navbar switches to Hindi
    await expect(nav.getByRole('link', { name: /डैशबोर्ड/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /मेरी यात्रा/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /उपलब्धियाँ/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /मेरी प्रगति/i })).toBeVisible();
    await expect(nav.getByRole('link', { name: /सेटिंग्स/i })).toBeVisible();

    // 4. Verify Dashboard displays Hindi
    await expect(page.getByText(/अपनी यात्रा जारी रखें/i).first()).toBeVisible();
    await expect(page.getByText(/सक्रिय साधना मार्ग|पूर्ण किए गए स्तर/i).first()).toBeVisible();

    // 5. Navigate to Journey page in Hindi
    await page.goto('/journey');
    await expect(page.getByText(/पवित्र पाठ्यक्रम के १८ मॉड्यूल/i).first()).toBeVisible();
    await expect(page.getByText(/संशय का कुरुक्षेत्र/i).first()).toBeVisible();

    // 6. Navigate to Achievements in Hindi
    await page.goto('/achievements');
    await expect(page.getByText(/यात्रा मील के पत्थर एवं उपलब्धियाँ|उपलब्धियाँ/i).first()).toBeVisible();

    // 7. Navigate to Progress in Hindi
    await page.goto('/progress');
    await expect(page.getByText(/मेरी अध्ययन प्रगति/i).first()).toBeVisible();
    await expect(page.getByText(/३-कार्य स्तर सिद्ध/i).first()).toBeVisible();

    // 8. Navigate to Settings in Hindi
    await page.goto('/settings');
    await expect(page.getByText(/मंच सेटिंग्स/i).first()).toBeVisible();
    await expect(page.getByText('वेबसाइट की भाषा', { exact: true })).toBeVisible();

    // 9. Switch back to English
    const enBtn = page.getByRole('button', { name: 'EN' }).first();
    await expect(enBtn).toBeVisible();
    await enBtn.click();
    await page.waitForTimeout(300);

    // 10. Verify English returns across page and navbar
    await expect(page.getByText(/Platform Settings/i).first()).toBeVisible();
    await expect(nav.getByRole('link', { name: /Dashboard/i })).toBeVisible();
  });

  test('Test L2 — Task 1 Scripture Presentation: Sanskrit stays Devanagari while translations toggle', async ({ page }) => {
    await page.goto('/learn/1/1');

    // 1. Initial English view
    await expect(page.getByText(/SHLOKA ROOM 1\.1/i).first()).toBeVisible();
    const sanskritEl = page.locator('.sanskrit-verse');
    await expect(sanskritEl).toBeVisible();
    await expect(sanskritEl).toContainText('धर्मक्षेत्रे कुरुक्षेत्रे');

    // Verify English translation header
    await expect(page.getByText(/English Translation/i).first()).toBeVisible();

    // 2. Switch to Hindi
    const hiBtn = page.getByRole('button', { name: 'हिन्दी' }).first();
    await hiBtn.click();
    await page.waitForTimeout(300);

    // 3. Sanskrit text MUST remain in authentic Devanagari Sanskrit
    await expect(sanskritEl).toContainText('धर्मक्षेत्रे कुरुक्षेत्रे');
    // Task 1 title in Hindi
    await expect(page.getByText(/प्रामाणिक श्लोक का अध्ययन करें|प्रामाणिक श्लोक पढ़ें/i).first()).toBeVisible();
    // Hindi translation header
    await expect(page.getByText(/हिंदी भावार्थ/i).first()).toBeVisible();

    // 4. Switch back to English
    const enBtn = page.getByRole('button', { name: 'EN' }).first();
    await enBtn.click();
    await page.waitForTimeout(300);
    await expect(page.getByText(/Read the Authentic Shloka/i).first()).toBeVisible();
  });

  test('Test L3 — Task 2 Gita & Life 5 Sections bilingual support on Level 2.47', async ({ page }) => {
    // Seed save with level 2.47 unlocked
    await page.goto('/');
    await page.evaluate((key) => {
      const seeded = {
        version: 2,
        highestCompletedIndex: 94,
        completedLevelIds: ['2.46'],
        awardedRewardIds: ['2.46'],
        totalXP: 1000,
        currentLevelId: '2.47',
        unlockedAchievementIds: [],
        gameCompleted: false,
        lastPlayedAt: new Date().toISOString(),
        chapterCompletionDates: {},
        settings: {
          recitationVolume: 90,
          language: 'en'
        },
        rooms: {
          '2.47': {
            levelId: '2.47',
            completed: false,
            tasks: { reading: true, understanding: false, challenge: false },
            score: 0
          }
        }
      };
      window.localStorage.setItem(key, JSON.stringify(seeded));
    }, SAVE_KEY);

    await page.goto('/learn/2/47');

    // 1. In English: Verify Section A through E
    await expect(page.getByText(/Section A · The Gita Says/i).first()).toBeVisible();
    await expect(page.getByText(/Section B · Deeper Philosophical Understanding/i).first()).toBeVisible();
    await expect(page.getByText(/Section C · Gita in Real Life/i).first()).toBeVisible();
    await expect(page.getByText(/Section D · Key Takeaway/i).first()).toBeVisible();
    await expect(page.getByText(/Section E · Check Your Understanding/i).first()).toBeVisible();

    // 2. Switch to Hindi
    const hiBtn = page.getByRole('button', { name: 'हिन्दी' }).first();
    await hiBtn.click();
    await page.waitForTimeout(300);

    // 3. In Hindi: Verify Section A through E headers and Hindi text
    await expect(page.getByText(/भाग क · गीता का संदेश/i).first()).toBeVisible();
    await expect(page.getByText(/भाग ख · गहन दार्शनिक समझ/i).first()).toBeVisible();
    await expect(page.getByText(/भाग ग · व्यावहारिक जीवन में गीता/i).first()).toBeVisible();
    await expect(page.getByText(/भाग घ · मुख्य बोध/i).first()).toBeVisible();
    await expect(page.getByText(/भाग ङ · अपनी समझ परखें/i).first()).toBeVisible();
    // Sanskrit verse remains intact - expand Task 1 to view scripture
    await page.getByRole('button', { name: /कार्य १|Task 1/i }).click();
    await expect(page.locator('.sanskrit-verse')).toContainText('कर्मण्येवाधिकारस्ते');
  });

  test('Test L4 — Settings Refinement: Font-size slider removed, SFX removed, Website Language present', async ({ page }) => {
    await page.goto('/settings');

    // 1. Verify Sanskrit font size slider is REMOVED
    await expect(page.getByText(/Sanskrit Verse Text Size/i)).toHaveCount(0);
    await expect(page.locator('input[type="range"][min="16"]')).toHaveCount(0);

    // 2. Verify non-functional SFX slider is REMOVED
    await expect(page.getByText(/Sound Effects \(SFX\)/i)).toHaveCount(0);

    // 3. Verify Recitation Volume slider is PRESERVED
    await expect(page.getByText(/Verse Speech Synthesis Volume|श्लोक वाचन ध्वनि/i).first()).toBeVisible();

    // 4. Verify Website Language setting is renamed and present
    await expect(page.getByText(/Website Language|वेबसाइट की भाषा/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'हिन्दी (Hindi)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'English' })).toBeVisible();

    // 5. Switch language from inside Settings
    await page.getByRole('button', { name: 'हिन्दी (Hindi)' }).click();
    await page.waitForTimeout(300);

    // Label updates to Hindi: 'वेबसाइट की भाषा'
    await expect(page.getByText('वेबसाइट की भाषा', { exact: true })).toBeVisible();
    await expect(page.getByText(/श्लोक वाचन ध्वनि/i).first()).toBeVisible();
  });

  test('Test L5 — Theme and Language Independence: switching language preserves theme; switching theme preserves language', async ({ page }) => {
    await page.goto('/');

    // 1. Switch theme to Parchment
    const parchmentBtn = page.getByRole('button', { name: /Switch to Parchment mode/i }).first();
    if (await parchmentBtn.isVisible()) {
      await parchmentBtn.click();
      await page.waitForTimeout(200);
    }
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'parchment');

    // 2. Switch language to Hindi
    const hiBtn = page.getByRole('button', { name: 'हिन्दी' }).first();
    await hiBtn.click();
    await page.waitForTimeout(300);

    // 3. Theme must remain 'parchment'
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'parchment');
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi');

    // 4. Switch theme to Dark
    const darkBtn = page.getByRole('button', { name: /Switch to Dark mode/i }).first();
    if (await darkBtn.isVisible()) {
      await darkBtn.click();
      await page.waitForTimeout(200);
    }
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // 5. Language must remain Hindi
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi');
    await expect(page.getByRole('link', { name: /डैशबोर्ड/i }).first()).toBeVisible();

    // 6. Switch language back to English
    const enBtn = page.getByRole('button', { name: 'EN' }).first();
    await enBtn.click();
    await page.waitForTimeout(300);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('Test L6 — Progress and XP are completely preserved when switching languages', async ({ page }) => {
    // Seed save with 500 XP and 20 completed levels
    await page.goto('/');
    await page.evaluate((key) => {
      const seeded = {
        version: 2,
        highestCompletedIndex: 20,
        completedLevelIds: Array.from({ length: 20 }, (_, i) => `1.${i + 1}`),
        awardedRewardIds: Array.from({ length: 20 }, (_, i) => `1.${i + 1}`),
        totalXP: 500,
        currentLevelId: '1.21',
        unlockedAchievementIds: ['first_shloka', 'chapter_1_novice'],
        gameCompleted: false,
        lastPlayedAt: new Date().toISOString(),
        chapterCompletionDates: {},
        settings: {
          masterVolume: 80,
          musicVolume: 60,
          ambientVolume: 70,
          sfxVolume: 80,
          recitationVolume: 90,
          showSubtitles: true,
          language: 'en'
        },
        rooms: {}
      };
      window.localStorage.setItem(key, JSON.stringify(seeded));
    }, SAVE_KEY);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Initial check: 500 XP visible
    await expect(page.getByText(/500 XP/i).first()).toBeVisible();

    // 2. Switch to Hindi
    const hiBtn = page.getByRole('button', { name: 'हिन्दी' }).first();
    await hiBtn.click();
    await page.waitForTimeout(300);

    // 3. XP and progress remain unchanged
    await expect(page.getByText(/500 XP/i).first()).toBeVisible();

    // 4. Refresh page: Hindi and 500 XP persist
    await page.reload();
    await expect(page.getByText(/500 XP/i).first()).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'hi');

    // 5. Switch back to English
    const enBtn = page.getByRole('button', { name: 'EN' }).first();
    await enBtn.click();
    await page.waitForTimeout(300);
    await expect(page.getByText(/500 XP/i).first()).toBeVisible();
  });

  // =========================================================================
  // SECTION: NAVBAR FIX, RESPONSIVENESS, FOOTER & UNRESOLVED KEY DETECTION
  // =========================================================================

  test('Test N1 — Navbar overflow check at 1920px, 1536px, 1535px, 1440px, 1366px, and 1280px in English', async ({ page }) => {
    const desktopWidths = [1920, 1536, 1535, 1440, 1366, 1280];

    for (const width of desktopWidths) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      // Ensure English mode
      const enBtn = page.getByRole('button', { name: 'EN' }).first();
      if (await enBtn.isVisible()) {
        await enBtn.click();
        await page.waitForTimeout(100);
      }

      // Check all 5 links are visible on desktop nav
      const nav = page.locator('nav[aria-label="Main Navigation"]').first();
      const settingsLink = nav.getByRole('link', { name: /settings/i });
      await expect(settingsLink).toBeVisible();

      // Verify Settings is not clipped by viewport edge
      const settingsBox = await settingsLink.boundingBox();
      expect(settingsBox).not.toBeNull();
      if (settingsBox) {
        expect(settingsBox.x + settingsBox.width).toBeLessThanOrEqual(width);
      }

      // Verify no horizontal document overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);

      // Verify XP badge, language switcher, and theme switcher are accessible
      await expect(page.getByText(/XP/i).first()).toBeVisible();
      await expect(page.getByRole('button', { name: 'EN' }).first()).toBeVisible();
      await expect(page.getByRole('button', { name: /switch to dark mode/i }).first()).toBeVisible();
    }
  });

  test('Test N2 — Navbar check at 1536px, 1535px, 1366px, and 1280px in Hindi', async ({ page }) => {
    for (const width of [1536, 1535, 1366, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      // Switch to Hindi
      const hiBtn = page.getByRole('button', { name: 'हिन्दी' }).first();
      await hiBtn.click();
      await page.waitForTimeout(200);

      // Verify all 5 Hindi navigation options are accessible
      const nav = page.locator('nav[aria-label="Main Navigation"]').first();
      await expect(nav.getByRole('link', { name: /डैशबोर्ड/i })).toBeVisible();
      await expect(nav.getByRole('link', { name: /मेरी यात्रा/i })).toBeVisible();
      await expect(nav.getByRole('link', { name: /उपलब्धियाँ|उपलब्धियां/i })).toBeVisible();
      await expect(nav.getByRole('link', { name: /मेरी प्रगति/i })).toBeVisible();
      const settingsLink = nav.getByRole('link', { name: /सेटिंग्स/i });
      await expect(settingsLink).toBeVisible();

      // Verify Settings is not clipped
      const settingsBox = await settingsLink.boundingBox();
      expect(settingsBox).not.toBeNull();
      if (settingsBox) {
        expect(settingsBox.x + settingsBox.width).toBeLessThanOrEqual(width);
      }

      // Verify no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    }
  });

  test('Test N3 — Mobile & Tablet responsive navbar drawer at 1024px, 768px, 375px, and 320px', async ({ page }) => {
    const mobileWidths = [1024, 768, 425, 390, 375, 360, 320];

    for (const width of mobileWidths) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/');
      await page.waitForLoadState('domcontentloaded');

      // Mobile hamburger button must be visible
      const menuBtn = page.getByRole('button', { name: /open navigation menu/i });
      await expect(menuBtn).toBeVisible();

      // Open drawer (retry click if needed for hydration)
      await menuBtn.click();
      const mobileNav = page.locator('nav[aria-label="Mobile Navigation"]');
      if (!(await mobileNav.isVisible())) {
        await page.waitForTimeout(100);
        await menuBtn.click();
      }

      // Mobile nav drawer should contain all 5 navigation options
      await expect(mobileNav).toBeVisible();
      await expect(mobileNav.getByRole('link', { name: /dashboard|डैशबोर्ड/i })).toBeVisible();
      await expect(mobileNav.getByRole('link', { name: /journey|मेरी यात्रा/i })).toBeVisible();
      await expect(mobileNav.getByRole('link', { name: /achievements|उपलब्धियां/i })).toBeVisible();
      await expect(mobileNav.getByRole('link', { name: /progress|मेरी प्रगति/i })).toBeVisible();
      await expect(mobileNav.getByRole('link', { name: /settings|सेटिंग्स/i })).toBeVisible();

      // Close menu with escape key
      await page.keyboard.press('Escape');
      await page.waitForTimeout(150);
      await expect(mobileNav).not.toBeVisible();

      // Verify no horizontal overflow
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalScroll).toBe(false);
    }
  });

  test('Test N4 — Footer Branding Cleanup & Exact Localization verification', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/');

    // 1. Verify English Footer
    const enBtn = page.getByRole('button', { name: 'EN' }).first();
    if (await enBtn.isVisible()) {
      await enBtn.click();
      await page.waitForTimeout(200);
    }

    const expectedEnDesc = 'Explore the timeless wisdom of the Bhagavad Gita through 700 structured lessons across 18 chapters. Understand its teachings, connect them with everyday life, and grow through interactive learning.';
    await expect(page.getByText(expectedEnDesc)).toBeVisible();

    // Verify 0 TryHackMe occurrences in the rendered page
    const thmMatchesEn = await page.evaluate(() => {
      const bodyText = document.body.innerText || '';
      return (bodyText.match(/TryHackMe/gi) || []).length;
    });
    expect(thmMatchesEn).toBe(0);

    // 2. Switch to Hindi and verify Hindi Footer
    const hiBtn = page.getByRole('button', { name: 'हिन्दी' }).first();
    await hiBtn.click();
    await page.waitForTimeout(200);

    const expectedHiDesc = 'भगवद्गीता के 18 अध्यायों और 700 व्यवस्थित पाठों के माध्यम से उसके ज्ञान को समझें। गीता की शिक्षाओं को दैनिक जीवन से जोड़ें और रोचक अध्ययन गतिविधियों के साथ अपनी सीखने की यात्रा आगे बढ़ाएँ।';
    await expect(page.getByText(expectedHiDesc)).toBeVisible();

    // Verify 0 TryHackMe occurrences in Hindi mode
    const thmMatchesHi = await page.evaluate(() => {
      const bodyText = document.body.innerText || '';
      return (bodyText.match(/TryHackMe/gi) || []).length;
    });
    expect(thmMatchesHi).toBe(0);
  });

  test('Test N5 — Automated Unresolved Localization Key Check across all active pages', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });

    const pagesToTest = [
      '/',
      '/journey',
      '/journey/chapter/1',
      '/learn/1/1',
      '/achievements',
      '/progress',
      '/settings'
    ];

    const rawKeyPattern = /\b(dashboard|journey|learningRoom|achievements|progressPage|settings|footer)\.[a-zA-Z0-9]+\b/i;

    for (const route of pagesToTest) {
      // Test in English
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const enRawKeys = await page.evaluate((patternStr) => {
        const regex = new RegExp(patternStr, 'gi');
        const text = document.body.innerText || '';
        const matches = text.match(regex) || [];
        return Array.from(new Set(matches));
      }, rawKeyPattern.source);

      expect(enRawKeys, `Found raw unresolved translation keys on ${route} in English: ${enRawKeys.join(', ')}`).toEqual([]);

      // Test in Hindi
      const hiBtn = page.getByRole('button', { name: 'हिन्दी' }).first();
      if (await hiBtn.isVisible()) {
        await hiBtn.click();
        await page.waitForTimeout(200);

        const hiRawKeys = await page.evaluate((patternStr) => {
          const regex = new RegExp(patternStr, 'gi');
          const text = document.body.innerText || '';
          const matches = text.match(regex) || [];
          return Array.from(new Set(matches));
        }, rawKeyPattern.source);

        expect(hiRawKeys, `Found raw unresolved translation keys on ${route} in Hindi: ${hiRawKeys.join(', ')}`).toEqual([]);

        // Switch back to English
        const enSwitchBtn = page.getByRole('button', { name: 'EN' }).first();
        if (await enSwitchBtn.isVisible()) {
          await enSwitchBtn.click();
          await page.waitForTimeout(100);
        }
      }
    }
  });

  test('Test N6 — Visual Quality Assurance Screenshots Capture', async ({ page }) => {
    const fs = await import('fs');
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }

    // 1. Dashboard English — 1536px
    await page.setViewportSize({ width: 1536, height: 900 });
    await page.goto('/');
    const enBtn = page.getByRole('button', { name: 'EN' }).first();
    if (await enBtn.isVisible()) await enBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard-en-1536px.png'), fullPage: false });

    // 2. Dashboard Hindi — 1536px
    const hiBtn = page.getByRole('button', { name: 'हिन्दी' }).first();
    await hiBtn.click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard-hi-1536px.png'), fullPage: false });

    // 3. Dashboard English — 1366px
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.getByRole('button', { name: 'EN' }).first().click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard-en-1366px.png'), fullPage: false });

    // 4. Dashboard Hindi — 1366px
    await page.getByRole('button', { name: 'हिन्दी' }).first().click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'dashboard-hi-1366px.png'), fullPage: false });

    // 5. Mobile Dashboard — 375px
    await page.setViewportSize({ width: 375, height: 812 });
    await page.getByRole('button', { name: 'EN' }).first().click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-dashboard-375px.png'), fullPage: false });

    // 6. Mobile Dashboard — 320px
    await page.setViewportSize({ width: 320, height: 568 });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-dashboard-320px.png'), fullPage: false });

    // 7. Mobile Learning Room — 375px
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/learn/1/1');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-learning-room-375px.png'), fullPage: false });

    // 8. Mobile My Journey — 375px
    await page.goto('/journey');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-my-journey-375px.png'), fullPage: false });

    // 9. Mobile Settings — 375px
    await page.goto('/settings');
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-settings-375px.png'), fullPage: false });

    // 10. Mobile Navbar opened — 375px
    await page.goto('/');
    await page.getByRole('button', { name: /open navigation menu/i }).click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'mobile-navbar-opened.png'), fullPage: false });

    // 11. Footer English
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(300);
    const footer = page.locator('footer');
    await footer.screenshot({ path: path.join(SCREENSHOT_DIR, 'footer-en.png') });

    // 12. Footer Hindi
    await page.getByRole('button', { name: 'हिन्दी' }).first().click();
    await page.waitForTimeout(300);
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await footer.screenshot({ path: path.join(SCREENSHOT_DIR, 'footer-hi.png') });
  });
});

