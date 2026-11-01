import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { ReadingProvider } from "@/providers/ReadingProvider";
import { Navbar } from "@/components/layout/Navbar";
import { AppShell } from "@/components/layout/AppShell";

describe("Neo-Brutalist Layout & Navigation Tests", () => {
  it("renders Navbar with branding and 5 required navigation links", () => {
    render(
      <ReadingProvider>
        <Navbar />
      </ReadingProvider>
    );

    expect(screen.getByText("AVYAKTA")).toBeInTheDocument();
    expect(screen.getByText("श्रीमद्भगवद्गीता")).toBeInTheDocument();
    expect(screen.getAllByText("Dashboard")[0]).toBeInTheDocument();
    expect(screen.getAllByText("My Journey")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Achievements")[0]).toBeInTheDocument();
    expect(screen.getAllByText("My Progress")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Settings")[0]).toBeInTheDocument();

    // Verify obsolete features are completely removed from navigation
    expect(screen.queryByText("Chapters")).not.toBeInTheDocument();
    expect(screen.queryByText("Bookmarks")).not.toBeInTheDocument();
    expect(screen.queryByText("Scripture Library")).not.toBeInTheDocument();
    expect(screen.queryByText(/Search Scripture/i)).not.toBeInTheDocument();
  });

  it("renders AppShell without any permanent sidebar or aside element", () => {
    const { container } = render(
      <ReadingProvider>
        <AppShell>
          <div data-testid="page-content">Test Page Content</div>
        </AppShell>
      </ReadingProvider>
    );

    // Sidebar must NOT be mounted anywhere in AppShell
    expect(container.querySelector("aside")).toBeNull();
    // Navbar must be mounted
    expect(container.querySelector("header")).not.toBeNull();
    // Page content rendered
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
  });
});
