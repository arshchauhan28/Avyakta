'use client';

import React from 'react';
import Link from 'next/link';
import { Cloud, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n';

export function GuestInvitationCard() {
  const { isAuthenticated } = useAuth();
  const { t, language } = useTranslation();

  if (isAuthenticated) {
    return null;
  }

  return (
    <div
      role="region"
      aria-label="Account Creation Notice"
      className="p-4 sm:p-5 bg-surface border-3 border-border-strong rounded-neo shadow-neo flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <span className="p-2.5 bg-accent/15 border-2 border-border-strong rounded-neo-sm text-accent shrink-0">
          <Cloud className="w-5 h-5 text-accent" />
        </span>
        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-wide text-text-primary">
            {t('auth.guestInviteTitle')}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {t('auth.guestInviteText')}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
        <Link
          href="/signup"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-accent-foreground font-extrabold text-xs uppercase tracking-wider border-2 border-border-strong rounded-neo-sm shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
        >
          <span>{t('auth.guestInviteBtn')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
