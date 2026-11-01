'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { KeyRound, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const { resetPassword } = useAuth();
  const { t, language } = useTranslation();

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 12) {
      setError(t('auth.errors.passwordTooShort'));
      return;
    }

    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordsDontMatch'));
      return;
    }

    if (!token.trim()) {
      setError('A valid reset token is required.');
      return;
    }

    setIsSubmitting(true);
    const res = await resetPassword(token.trim(), password, confirmPassword);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || t('auth.errors.invalidToken'));
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
                {language === 'hi' ? 'पासवर्ड अद्यतन' : 'Password Update'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-text-primary">
                {t('auth.resetPasswordTitle')}
              </h1>
            </div>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {t('auth.resetPasswordSubtitle')}
          </p>
        </div>

        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-accent/15 border-2 border-accent rounded-neo-sm flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-extrabold text-text-primary uppercase tracking-wider">
                  {language === 'hi' ? 'पासवर्ड सफलतापूर्वक बदला गया' : 'Password Reset Complete'}
                </h2>
                <p className="text-xs text-text-secondary mt-1">
                  {t('auth.passwordResetSuccess')}
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

            {!tokenFromUrl && (
              <div>
                <label htmlFor="token" className="block text-xs font-mono font-bold uppercase tracking-wider text-text-primary mb-1.5">
                  {language === 'hi' ? 'रीसेट टोकन' : 'Reset Token'}
                </label>
                <input
                  id="token"
                  type="text"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste reset token here..."
                  className="w-full px-3.5 py-2.5 bg-surface border-2 border-border-strong rounded-neo-sm text-sm text-text-primary focus:outline-none focus:border-accent font-mono"
                />
              </div>
            )}

            <div>
              <label htmlFor="password" className="block text-xs font-mono font-bold uppercase tracking-wider text-text-primary mb-1.5">
                {language === 'hi' ? 'नया पासवर्ड' : 'New Password'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={12}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
                  className="w-full pl-10 pr-10 py-2.5 bg-surface border-2 border-border-strong rounded-neo-sm text-sm text-text-primary focus:outline-none focus:border-accent shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-text-secondary mt-1 font-mono">
                {language === 'hi'
                  ? 'सुरक्षा हेतु न्यूनतम 12 अक्षर आवश्यक हैं।'
                  : 'Minimum 12 characters required.'}
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-mono font-bold uppercase tracking-wider text-text-primary mb-1.5">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={12}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  className="w-full pl-10 pr-10 py-2.5 bg-surface border-2 border-border-strong rounded-neo-sm text-sm text-text-primary focus:outline-none focus:border-accent shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-accent text-accent-foreground font-extrabold text-sm uppercase tracking-wider border-2 border-border-strong rounded-neo-sm shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all disabled:opacity-50"
              >
                {isSubmitting ? t('common.loading') : t('auth.resetPasswordBtn')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto p-8 text-center font-mono">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
