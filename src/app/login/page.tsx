'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogIn, AtSign, Lock, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { t, language } = useTranslation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

  if (!isLoading && isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorCode(null);

    setIsSubmitting(true);
    const res = await login(username, password);
    setIsSubmitting(false);

    if (!res.success) {
      setErrorCode(res.code || null);
      if (res.code === 'EMAIL_UNVERIFIED') {
        setError(t('auth.errors.unverifiedEmail'));
      } else {
        setError(res.error || t('auth.errors.invalidCredentials'));
      }
      return;
    }

    router.push('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
      <div className="bg-surface border-4 border-border-strong rounded-neo p-6 sm:p-8 shadow-neo">
        {/* Header */}
        <div className="mb-8 border-b-3 border-border-strong pb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-accent/10 border-2 border-border-strong rounded-neo-sm text-accent">
              <LogIn className="w-6 h-6 text-accent" />
            </span>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-text-secondary font-bold">
                {language === 'hi' ? 'अव्यक्त सुरक्षित लॉगिन' : 'Avyakta Sign In'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-text-primary">
                {t('auth.loginTitle')}
              </h1>
            </div>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              role="alert"
              className="p-3.5 bg-danger/10 border-2 border-danger rounded-neo-sm flex items-start gap-3 text-sm text-danger font-medium animate-in fade-in-50"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p>{error}</p>
                {errorCode === 'EMAIL_UNVERIFIED' && (
                  <Link
                    href="/verify-email"
                    className="inline-block text-xs font-mono font-bold underline text-danger hover:opacity-80"
                  >
                    {t('auth.resendVerificationBtn')} &rarr;
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Exactly 2 Authentication Inputs */}
          {/* Input 1: Username */}
          <div>
            <label htmlFor="username" className="block text-xs font-mono font-bold uppercase tracking-wider text-text-primary mb-1.5">
              {t('auth.username')}
            </label>
            <div className="relative">
              <AtSign className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="username"
                type="text"
                required
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('auth.usernamePlaceholder')}
                className="w-full pl-10 pr-3.5 py-2.5 bg-surface border-2 border-border-strong rounded-neo-sm text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner font-mono"
              />
            </div>
          </div>

          {/* Input 2: Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password" className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
                {t('auth.password')}
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-mono text-accent hover:underline font-bold"
              >
                {t('auth.forgotPassword')}
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className="w-full pl-10 pr-10 py-2.5 bg-surface border-2 border-border-strong rounded-neo-sm text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
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
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-accent text-accent-foreground font-extrabold text-sm uppercase tracking-wider border-2 border-border-strong rounded-neo-sm shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? t('common.loading') : t('auth.loginBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Footer link to Signup */}
          <div className="pt-4 border-t-2 border-border-strong text-center text-xs text-text-secondary">
            <span>{t('auth.noAccount')}{' '}</span>
            <Link href="/signup" className="font-bold text-accent hover:underline uppercase tracking-wider ml-1">
              {t('auth.signupBtn')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
