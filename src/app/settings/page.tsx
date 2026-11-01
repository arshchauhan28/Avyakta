'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { SaveManager } from '@/game/progression/SaveManager';
import { GameProgress, GameSettings } from '@/game/types/progression';
import { useReaderPreferences } from '@/hooks/useReaderPreferences';
import { useTranslation } from '@/i18n/useTranslation';
import { AppTheme } from '@/types/preferences';
import {
  Settings,
  ArrowLeft,
  Volume2,
  Download,
  Check,
  Palette,
  Sun,
  Moon,
  Scroll,
  RotateCcw,
  Languages
} from 'lucide-react';

export default function SettingsPage() {
  const { t, language, setLanguage } = useTranslation();
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [savedAlert, setSavedAlert] = useState(false);
  const [importString, setImportString] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const {
    theme,
    setTheme
  } = useReaderPreferences();

  useEffect(() => {
    setProgress(SaveManager.loadProgress());
  }, []);

  if (!progress) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8 text-center text-accent">
        <span className="font-mono text-sm font-bold">{t.settings.loadingSettings}</span>
      </div>
    );
  }

  const updateGameSetting = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated: GameProgress = {
      ...progress,
      settings: {
        ...progress.settings,
        [key]: value
      }
    };
    setProgress(updated);
    SaveManager.saveProgress(updated);
    setSavedAlert(true);
    setTimeout(() => setSavedAlert(false), 2000);
  };

  const handleExport = () => {
    const data = SaveManager.exportSave();
    navigator.clipboard.writeText(data);
    alert(t.settings.copyCodeAlert);
  };

  const handleImport = () => {
    if (!importString.trim()) return;
    const res = SaveManager.importSave(importString);
    if (res.success && res.progress) {
      setProgress(res.progress);
      setImportStatus(t.settings.importSuccess);
      setImportString('');
    } else {
      setImportStatus(`${t.settings.importFailed}: ${res.error || 'Invalid save code'}`);
    }
  };

  const handleReset = () => {
    const fresh = SaveManager.resetProgress();
    setProgress(fresh);
    setShowResetConfirm(false);
    alert(t.settings.resetSuccessAlert);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Back Link */}
      <div>
        <Link
          href="/"
          className="neo-badge bg-surface text-text-primary px-3 py-1.5 inline-flex items-center gap-2 hover:bg-surface-hover hover:translate-x-[-1px] transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t.settings.backToDashboard}</span>
        </Link>
      </div>

      {/* 2. Header */}
      <section className="space-y-2">
        <div className="inline-flex items-center gap-2 neo-badge bg-surface-secondary text-text-primary px-3 py-1">
          <Settings className="w-3.5 h-3.5 text-accent" />
          <span>{t.settings.preferencesHeading}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-text-primary uppercase tracking-tight font-sans">
          {t.settings.title}
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary font-sans">
          {t.settings.subtitle}
        </p>
      </section>

      {/* Save Notification */}
      {savedAlert && (
        <div className="p-3.5 rounded-neo-sm bg-success/20 border-2 border-success text-text-primary text-xs font-mono font-bold flex items-center gap-2 animate-in fade-in duration-150">
          <Check className="w-4 h-4 text-success" />
          <span>{t.settings.savedAlert}</span>
        </div>
      )}

      {/* 3. Theme & Website Language Preferences */}
      <section className="neo-card p-6 sm:p-8 space-y-6" aria-labelledby="theme-preferences-heading">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-border-strong">
          <Palette className="w-4 h-4 text-accent" />
          <h2 id="theme-preferences-heading" className="text-sm font-black text-text-primary uppercase font-mono">
            {t.settings.themeHeading}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase text-text-muted">
              {t.settings.themeLabel}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark' as AppTheme, label: t.settings.darkTheme, icon: Moon },
                { id: 'light' as AppTheme, label: t.settings.lightTheme, icon: Sun },
                { id: 'parchment' as AppTheme, label: t.settings.parchmentTheme, icon: Scroll }
              ].map((tTheme) => {
                const isSelected = theme === tTheme.id;
                const Icon = tTheme.icon;
                return (
                  <button
                    key={tTheme.id}
                    type="button"
                    onClick={() => setTheme(tTheme.id)}
                    className={`py-3 px-2 rounded-neo-sm border-2 text-xs font-black uppercase transition-all flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'bg-accent text-accent-contrast border-border-strong shadow-neo-sm'
                        : 'bg-background border-border-strong text-text-secondary hover:text-text-primary hover:bg-surface'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tTheme.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Website Language */}
          <div className="space-y-2">
            <label className="text-xs font-mono font-bold uppercase text-text-muted flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-accent" />
              <span>{t.settings.websiteLanguageLabel}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`py-3 px-3 rounded-neo-sm border-2 text-xs font-black uppercase transition-all ${
                  language === 'en'
                    ? 'bg-accent text-accent-contrast border-border-strong shadow-neo-sm'
                    : 'bg-background border-border-strong text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage('hi')}
                className={`py-3 px-3 rounded-neo-sm border-2 text-xs font-black uppercase transition-all ${
                  language === 'hi'
                    ? 'bg-accent text-accent-contrast border-border-strong shadow-neo-sm'
                    : 'bg-background border-border-strong text-text-secondary hover:text-text-primary hover:bg-surface'
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Audio & Recitation Settings (SFX removed as nonfunctional; Recitation speech synthesis preserved) */}
      <section className="neo-card p-6 sm:p-8 space-y-6" aria-labelledby="audio-preferences-heading">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-border-strong">
          <Volume2 className="w-4 h-4 text-accent" />
          <h2 id="audio-preferences-heading" className="text-sm font-black text-text-primary uppercase font-mono">
            {t.settings.audioHeading}
          </h2>
        </div>

        <div className="max-w-md space-y-2">
          <div className="flex justify-between text-xs font-mono font-bold text-text-secondary">
            <span className="uppercase">{t.settings.recitationVolumeLabel}</span>
            <span className="text-accent">{progress.settings.recitationVolume}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={progress.settings.recitationVolume}
            onChange={(e) => updateGameSetting('recitationVolume', Number(e.target.value))}
            className="w-full accent-[var(--accent)] cursor-pointer h-2 bg-background border-2 border-border-strong rounded-neo-sm"
          />
        </div>
      </section>

      {/* 5. Save Management & Backup */}
      <section className="neo-card p-6 sm:p-8 space-y-6" aria-labelledby="save-backup-heading">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-border-strong">
          <Download className="w-4 h-4 text-accent" />
          <h2 id="save-backup-heading" className="text-sm font-black text-text-primary uppercase font-mono">
            {t.settings.backupHeading}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Export */}
          <div className="neo-card p-5 bg-surface-secondary space-y-3 shadow-neo-sm">
            <span className="text-xs font-mono font-bold uppercase text-text-primary block">
              {t.settings.exportTitle}
            </span>
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              {t.settings.exportDesc}
            </p>
            <button
              type="button"
              onClick={handleExport}
              className="neo-btn-primary px-5 py-2.5 text-xs w-full sm:w-auto"
            >
              {t.settings.exportBtn}
            </button>
          </div>

          {/* Import */}
          <div className="neo-card p-5 bg-surface-secondary space-y-3 shadow-neo-sm">
            <span className="text-xs font-mono font-bold uppercase text-text-primary block">
              {t.settings.importTitle}
            </span>
            <input
              type="text"
              placeholder={t.settings.importPlaceholder}
              value={importString}
              onChange={(e) => setImportString(e.target.value)}
              className="w-full px-3 py-2 rounded-neo-sm bg-background border-2 border-border-strong text-xs font-mono text-text-primary"
            />
            {importStatus && (
              <span className="text-[11px] font-mono text-accent font-bold block">{importStatus}</span>
            )}
            <button
              type="button"
              onClick={handleImport}
              className="neo-btn-secondary px-5 py-2.5 text-xs w-full sm:w-auto font-bold"
            >
              {t.settings.importBtn}
            </button>
          </div>
        </div>

        {/* Danger Zone: Reset Progress */}
        <div className="pt-4 border-t-2 border-border-strong flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-xs font-mono font-bold text-danger uppercase block">
              {t.settings.resetTitle}
            </span>
            <p className="text-xs text-text-muted font-sans">
              {t.settings.resetDesc}
            </p>
          </div>

          {showResetConfirm ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="neo-btn bg-danger text-white border-border-strong px-4 py-2 text-xs font-black"
              >
                {t.settings.confirmResetBtn}
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="neo-btn-secondary px-4 py-2 text-xs font-bold"
              >
                {t.settings.cancelBtn}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="neo-btn bg-surface border-danger text-danger hover:bg-danger/10 px-4 py-2 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.settings.resetBtn}</span>
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
