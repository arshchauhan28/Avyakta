"use client";

import React from "react";
import { useReaderPreferences } from "@/hooks/useReaderPreferences";
import { Sun, Moon, Scroll } from "lucide-react";
import { AppTheme } from "@/types/preferences";

export function ThemeSwitcher() {
  const { theme, setTheme } = useReaderPreferences();

  const themes: Array<{ id: AppTheme; label: string; icon: React.ReactNode }> = [
    { id: "dark", label: "Dark", icon: <Moon className="w-3.5 h-3.5" /> },
    { id: "light", label: "Light", icon: <Sun className="w-3.5 h-3.5" /> },
    { id: "parchment", label: "Parchment", icon: <Scroll className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      role="group"
      aria-label="Theme selection"
      className="inline-flex items-center p-0.5 bg-surface border-2 border-border-strong rounded-neo-sm shadow-neo-sm shrink-0"
    >
      {themes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            aria-pressed={isActive}
            aria-label={`Switch to ${t.label} mode`}
            className={`flex items-center gap-1 px-1.5 sm:px-2 py-1 text-xs font-bold rounded-neo-sm transition-all ${
              t.id === "parchment" ? "hidden sm:flex" : "flex"
            } ${
              isActive
                ? "bg-accent text-accent-contrast shadow-neo-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
            }`}
            title={`Switch to ${t.label} mode`}
          >
            {t.icon}
          </button>
        );
      })}
    </div>
  );
}
