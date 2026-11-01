'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, ShieldCheck, Cloud, Download, LogOut, Zap, Trophy, BookOpen, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n';
import { api, CloudProgress } from '@/lib/api';

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout, hasPendingGuestImport, confirmGuestImport, dismissGuestImport } = useAuth();
  const { t, language } = useTranslation();

  const [progress, setProgress] = useState<CloudProgress | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      api.getProgress().then((res) => {
        if (res.data) setProgress(res.data);
      });
    }
  }, [isAuthenticated]);

  if (isLoading || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-mono">
        <div className="inline-block p-4 border-2 border-border-strong bg-surface rounded-neo-sm shadow-neo-sm animate-pulse">
          {t('common.loading')}
        </div>
      </div>
    );
  }

  const handleImport = async () => {
    setIsImporting(true);
    setImportMessage(null);
    const res = await confirmGuestImport();
    setIsImporting(false);

    if (res.success) {
      setImportMessage(res.message || 'Import completed successfully.');
      api.getProgress().then((r) => {
        if (r.data) setProgress(r.data);
      });
    } else {
      setImportMessage(res.message || 'Import failed.');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div className="bg-surface border-4 border-border-strong rounded-neo p-6 sm:p-8 shadow-neo">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-border-strong pb-6">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-accent/10 border-2 border-border-strong rounded-neo-sm text-accent">
              <User className="w-7 h-7 text-accent" />
            </span>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-text-secondary font-bold">
                {language === 'hi' ? 'साधक प्रोफ़ाइल' : 'Seeker Account'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-text-primary">
                {t('auth.accountTitle')}
              </h1>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-surface hover:bg-surface-hover border-2 border-border-strong text-text-primary rounded-neo-sm font-mono font-bold text-xs uppercase shadow-neo-sm transition-all"
          >
            <LogOut className="w-4 h-4 text-danger" />
            <span>{t('auth.logoutBtn')}</span>
          </button>
        </div>

        {/* Profile Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 font-mono text-sm">
          <div className="p-4 bg-surface-alt border-2 border-border-strong rounded-neo-sm">
            <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">
              {t('auth.fullName')}
            </span>
            <span className="font-extrabold text-text-primary text-base">
              {user.fullName}
            </span>
          </div>

          <div className="p-4 bg-surface-alt border-2 border-border-strong rounded-neo-sm">
            <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">
              {t('auth.usernameLabel')}
            </span>
            <span className="font-extrabold text-accent text-base">
              @{user.username}
            </span>
          </div>

          <div className="p-4 bg-surface-alt border-2 border-border-strong rounded-neo-sm">
            <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">
              {t('auth.emailLabel')}
            </span>
            <span className="font-bold text-text-primary text-sm truncate block">
              {user.email}
            </span>
          </div>

          <div className="p-4 bg-surface-alt border-2 border-border-strong rounded-neo-sm">
            <span className="text-xs text-text-secondary uppercase tracking-wider block mb-1">
              {t('auth.statusLabel')}
            </span>
            <span className="inline-flex items-center gap-1.5 font-bold text-accent text-xs">
              <ShieldCheck className="w-4 h-4 text-accent" />
              <span>{t('auth.verifiedStatus')}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Guest Progress Import Card */}
      {hasPendingGuestImport && (
        <div className="bg-surface border-4 border-accent rounded-neo p-6 sm:p-8 shadow-neo space-y-4">
          <div className="flex items-start gap-3">
            <span className="p-2 bg-accent/20 border-2 border-border-strong rounded-neo-sm text-accent shrink-0">
              <Download className="w-6 h-6 text-accent" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold uppercase tracking-wide text-text-primary">
                {t('auth.importGuestTitle')}
              </h2>
              <p className="text-sm text-text-secondary mt-1">
                {t('auth.importGuestText')}
              </p>
            </div>
          </div>

          {importMessage && (
            <div className="p-3 bg-accent/15 border-2 border-accent rounded-neo-sm text-xs font-mono text-text-primary">
              {importMessage}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              disabled={isImporting}
              onClick={handleImport}
              className="px-5 py-2.5 bg-accent text-accent-foreground font-extrabold text-xs uppercase tracking-wider border-2 border-border-strong rounded-neo-sm shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all disabled:opacity-50"
            >
              {isImporting ? t('common.loading') : t('auth.importGuestBtn')}
            </button>

            <button
              type="button"
              onClick={dismissGuestImport}
              className="px-4 py-2.5 bg-surface text-text-secondary hover:text-text-primary font-mono font-bold text-xs uppercase tracking-wider border-2 border-border-strong rounded-neo-sm shadow-neo-sm transition-all"
            >
              {t('auth.dismissGuestBtn')}
            </button>
          </div>
        </div>
      )}

      {/* Cloud Progression Status */}
      <div className="bg-surface border-4 border-border-strong rounded-neo p-6 sm:p-8 shadow-neo space-y-6">
        <div className="flex items-center gap-3 border-b-3 border-border-strong pb-4">
          <span className="p-2.5 bg-accent/10 border-2 border-border-strong rounded-neo-sm text-accent">
            <Cloud className="w-6 h-6 text-accent" />
          </span>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-wide text-text-primary">
              {t('auth.cloudSyncActive')}
            </h2>
            <p className="text-xs text-text-secondary">
              {t('auth.cloudSyncActiveDesc')}
            </p>
          </div>
        </div>

        {progress ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-center">
            <div className="p-4 bg-surface-alt border-2 border-border-strong rounded-neo-sm">
              <span className="text-[11px] text-text-secondary uppercase tracking-wider block mb-1">
                {t('common.room')}
              </span>
              <span className="text-xl font-extrabold text-accent">
                {progress.currentLevelId}
              </span>
            </div>

            <div className="p-4 bg-surface-alt border-2 border-border-strong rounded-neo-sm">
              <span className="text-[11px] text-text-secondary uppercase tracking-wider block mb-1">
                {t('common.completed')}
              </span>
              <span className="text-xl font-extrabold text-text-primary">
                {progress.completedLevels.length} / 700
              </span>
            </div>

            <div className="p-4 bg-surface-alt border-2 border-border-strong rounded-neo-sm">
              <span className="text-[11px] text-text-secondary uppercase tracking-wider block mb-1">
                {t('common.xp')}
              </span>
              <span className="text-xl font-extrabold text-accent">
                {progress.totalXP}
              </span>
            </div>

            <div className="p-4 bg-surface-alt border-2 border-border-strong rounded-neo-sm">
              <span className="text-[11px] text-text-secondary uppercase tracking-wider block mb-1">
                {language === 'hi' ? 'उपाधि' : 'Rank'}
              </span>
              <span className="text-sm font-extrabold text-text-primary truncate block">
                {language === 'hi' ? progress.rankTitleSanskrit : progress.rankTitle}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center font-mono text-xs text-text-secondary">
            {t('common.loading')}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <Link
            href="/journey"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground font-extrabold text-xs uppercase tracking-wider border-2 border-border-strong rounded-neo-sm shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('dashboard.exploreAll')}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
