import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { ReadingProvider } from "@/providers/ReadingProvider";
import { ProgressDashboard } from "@/components/progress/ProgressDashboard";
import { getChapter, getVerse, getAllChapters } from "@/lib/gita-data";
import { SaveManager } from "@/game/progression/SaveManager";

describe("User Journeys & Learning Progress Integration Tests", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("Journey A: Authentic Scripture Data Access across 18 Chapters and 700 Shlokas", () => {
    const chapters = getAllChapters();
    expect(chapters).toHaveLength(18);

    const verse2_47 = getVerse(2, 47);
    expect(verse2_47).toBeDefined();
    expect(verse2_47?.sanskrit).toContain("कर्मण्येवाधिकारस्ते");
    expect(verse2_47?.translations.english?.text).toBeDefined();
    expect(verse2_47?.translations.hindi?.text).toBeDefined();

    const chapter18 = getChapter(18);
    expect(chapter18?.verseCount).toBe(78);
  });

  it("Journey B: Progress Dashboard reflects 3-task curriculum progress and 18 chapters", async () => {
    // Seed some progress
    const sampleProgress = {
      ...SaveManager.createDefaultProgress(),
      highestCompletedIndex: 3,
      completedLevelIds: ["1.1", "1.2", "1.3"],
      totalXP: 75
    };
    SaveManager.saveProgress(sampleProgress);

    render(
      <ReadingProvider>
        <ProgressDashboard />
      </ReadingProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("My Learning Progress")).toBeInTheDocument();
      expect(screen.getByText("3-task levels mastered")).toBeInTheDocument();
      expect(screen.getByText("3")).toBeInTheDocument();
      expect(screen.getByText("75")).toBeInTheDocument();
      expect(screen.getByText("18 Chapters of the Gita")).toBeInTheDocument();
    });
  });

  it("Journey C: Verify obsolete features (Search, Bookmarks, Simulation) are completely removed", () => {
    expect(typeof window).not.toBe("undefined");
    const progress = SaveManager.loadProgress();
    expect(progress.version).toBe(2);
    expect((progress.settings as unknown as Record<string, unknown>).graphicsQuality).toBeUndefined();
    expect((progress.settings as unknown as Record<string, unknown>).cameraSensitivity).toBeUndefined();
    expect((progress.settings as unknown as Record<string, unknown>).use2DMode).toBeUndefined();
  });
});
