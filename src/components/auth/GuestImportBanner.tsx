'use client';

import React, { useState } from 'react';
import { Download, Cloud, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n';

export function GuestImportBanner() {
  const { isAuthenticated, hasPendingGuestImport, confirmGuestImport, dismissGuestImport } = useAuth();
  const { t } = useTranslation();
  const [isImporting, setIsImporting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isAuthenticated || !hasPendingGuestImport) {
    return null;
  }

  const handleImport = async () => {
    setIsImporting(true);
    setMessage(null);
    const res = await confirmGuestImport();
    setIsImporting(false);
    if (!res.success) {
      setMessage(res.message || 'Import failed.');
    }
  };

  return (
    <div
      role="region"
      aria-label="Guest Progress Migration Notice"
      className="mb-6 p-4 sm:p-5 bg-surface border-3 border-accent rounded-neo shadow-neo flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in fade-in-50"
    >
      <div className="flex items-start gap-3">
        <span className="p-2 bg-accent/20 border-2 border-border-strong rounded-neo-sm text-accent shrink-0 mt-0.5">
          <Download className="w-5 h-5 text-accent" />
        </span>
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-text-primary">
            {t('auth.importGuestTitle')}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5 max-w-2xl">
            {t('auth.importGuestText')}
          </p>
          {message && (
            <p className="text-xs text-danger font-mono mt-1">{message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
        <button
          type="button"
          disabled={isImporting}
          onClick={handleImport}
          className="px-4 py-2 bg-accent text-accent-foreground font-extrabold text-xs uppercase tracking-wider border-2 border-border-strong rounded-neo-sm shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all disabled:opacity-50"
        >
          {isImporting ? t('common.loading') : t('auth.importGuestBtn')}
        </button>

        <button
          type="button"
          onClick={dismissGuestImport}
          className="p-2 bg-surface hover:bg-surface-hover text-text-secondary border-2 border-border-strong rounded-neo-sm shadow-neo-sm transition-all"
          title={t('auth.dismissGuestBtn')}
          aria-label={t('auth.dismissGuestBtn')}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
