'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { MailCheck, Mail, CheckCircle2, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token');

  const { verifyEmail, resendVerification } = useAuth();
  const { t, language } = useTranslation();

  const [tokenInput, setTokenInput] = useState(tokenFromUrl || '');
  const [resendEmail, setResendEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resendSuccessMessage, setResendSuccessMessage] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const executeVerification = React.useCallback(async (tok: string) => {
    setStatus('verifying');
    setErrorMessage(null);

    const res = await verifyEmail(tok);
    if (res.success) {
      setStatus('success');
    } else {
      setStatus('error');
      setErrorMessage(res.error || t('auth.errors.invalidToken'));
    }
  }, [verifyEmail, t]);

  // Auto-verify if token is provided in URL
  useEffect(() => {
    if (tokenFromUrl && status === 'idle') {
      executeVerification(tokenFromUrl);
    }
  }, [tokenFromUrl, status, executeVerification]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    executeVerification(tokenInput.trim());
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setIsResending(true);
    setResendSuccessMessage(null);
    const res = await resendVerification(resendEmail.trim());
    setIsResending(false);

    if (res.success) {
      setResendSuccessMessage(res.message || 'Verification email resent successfully.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
      <div className="bg-surface border-4 border-border-strong rounded-neo p-6 sm:p-8 shadow-neo">
        {/* Header */}
        <div className="mb-8 border-b-3 border-border-strong pb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-accent/10 border-2 border-border-strong rounded-neo-sm text-accent">
              <MailCheck className="w-6 h-6 text-accent" />
            </span>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-text-secondary font-bold">
                {language === 'hi' ? 'ईमेल सत्यापन' : 'Email Verification'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-text-primary">
                {t('auth.verifyEmailTitle')}
              </h1>
            </div>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {t('auth.verifyEmailSubtitle')}
          </p>
        </div>

        {/* State: Verifying */}
        {status === 'verifying' && (
          <div className="py-8 text-center space-y-4">
            <RefreshCw className="w-8 h-8 text-accent animate-spin mx-auto" />
            <p className="text-sm font-mono font-bold text-text-primary">
              {t('common.loading')}
            </p>
          </div>
        )}

        {/* State: Success */}
        {status === 'success' && (
          <div className="space-y-6">
            <div className="p-4 bg-accent/15 border-2 border-accent rounded-neo-sm flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-extrabold text-text-primary uppercase tracking-wider">
                  {t('auth.verifiedStatus')}
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  {t('auth.verifyEmailSuccess')}
                </p>
              </div>
            </div>

            <Link
              href="/login"
              className="w-full py-3 bg-accent text-accent-foreground font-extrabold text-sm uppercase tracking-wider border-2 border-border-strong rounded-neo-sm shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center gap-2"
            >
              <span>{t('auth.loginBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* State: Error or Idle */}
        {status !== 'verifying' && status !== 'success' && (
          <div className="space-y-6">
            {errorMessage && (
              <div
                role="alert"
                className="p-3.5 bg-danger/10 border-2 border-danger rounded-neo-sm flex items-start gap-3 text-sm text-danger font-medium"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Manual Token Form */}
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label htmlFor="token" className="block text-xs font-mono font-bold uppercase tracking-wider text-text-primary mb-1.5">
                  {language === 'hi' ? 'सत्यापन टोकन दर्ज करें' : 'Verification Token'}
                </label>
                <input
                  id="token"
                  type="text"
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste verification token here..."
                  className="w-full px-3.5 py-2.5 bg-surface border-2 border-border-strong rounded-neo-sm text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-accent text-accent-foreground font-extrabold text-xs uppercase tracking-wider border-2 border-border-strong rounded-neo-sm shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
              >
                {t('auth.verifyEmailBtn')}
              </button>
            </form>

            {/* Resend Section */}
            <div className="pt-6 border-t-2 border-border-strong">
              <h3 className="text-xs font-mono font-extrabold uppercase tracking-wider text-text-primary mb-2">
                {t('auth.resendVerificationBtn')}
              </h3>

              {resendSuccessMessage && (
                <div className="p-3 mb-3 bg-accent/15 border-2 border-accent rounded-neo-sm text-xs text-text-primary font-mono">
                  {resendSuccessMessage}
                </div>
              )}

              <form onSubmit={handleResend} className="space-y-3">
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    className="w-full pl-10 pr-3.5 py-2 bg-surface border-2 border-border-strong rounded-neo-sm text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isResending}
                  className="w-full py-2 bg-surface border-2 border-border-strong rounded-neo-sm text-xs font-mono font-bold text-text-primary hover:bg-surface-hover shadow-neo-sm transition-all disabled:opacity-50"
                >
                  {isResending ? t('common.loading') : t('auth.resendVerificationBtn')}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto p-8 text-center font-mono">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}
