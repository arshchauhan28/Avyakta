'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KeyRound, Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { t, language } = useTranslation();

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await forgotPassword(email);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'Failed to send recovery instructions.');
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
      <div className="bg-surface border-4 border-border-strong rounded-neo p-6 sm:p-8 shadow-neo">
        {/* Header */}
        <div className="mb-8 border-b-3 border-border-strong pb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-accent/10 border-2 border-border-strong rounded-neo-sm text-accent">
              <KeyRound className="w-6 h-6 text-accent" />
            </span>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-text-secondary font-bold">
                {language === 'hi' ? 'पासवर्ड पुनर्प्राप्ति' : 'Password Recovery'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-text-primary">
                {t('auth.forgotPasswordTitle')}
              </h1>
            </div>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {t('auth.forgotPasswordSubtitle')}
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-accent/15 border-2 border-accent rounded-neo-sm flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-extrabold text-text-primary uppercase tracking-wider">
                  {language === 'hi' ? 'पुनर्प्राप्ति लिंक भेजा गया' : 'Recovery Link Dispatched'}
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  {language === 'hi'
                    ? 'यदि यह ईमेल हमारे पास पंजीकृत और सत्यापित है, तो आपको पासवर्ड रीसेट करने के निर्देश प्राप्त होंगे।'
                    : 'If this email is registered and verified, you will receive password recovery instructions shortly.'}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground font-extrabold text-sm uppercase tracking-wider border-2 border-border-strong rounded-neo-sm shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
              >
                <span>{t('auth.loginBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                role="alert"
                className="p-3.5 bg-danger/10 border-2 border-danger rounded-neo-sm flex items-start gap-3 text-sm text-danger font-medium"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-xs font-mono font-bold uppercase tracking-wider text-text-primary mb-1.5">
                {t('auth.email')}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('auth.emailPlaceholder')}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-surface border-2 border-border-strong rounded-neo-sm text-sm text-text-primary focus:outline-none focus:border-accent font-sans"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-accent text-accent-foreground font-extrabold text-sm uppercase tracking-wider border-2 border-border-strong rounded-neo-sm shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all disabled:opacity-50"
              >
                {isSubmitting ? t('common.loading') : t('auth.sendResetBtn')}
              </button>
            </div>

            <div className="pt-4 border-t-2 border-border-strong text-center text-xs text-text-secondary">
              <Link href="/login" className="font-bold text-accent hover:underline uppercase tracking-wider">
                &larr; {t('auth.loginBtn')}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
