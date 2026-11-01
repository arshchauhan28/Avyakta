'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, User, Mail, AtSign, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from '@/i18n';

export default function SignupPage() {
  const router = useRouter();
  const { signup, isAuthenticated, isLoading } = useAuth();
  const { t, language } = useTranslation();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in, redirect to dashboard in effect
  useEffect(() => {
    if (!isLoading && isAuthenticated && !success) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, success, router]);

  if (!isLoading && isAuthenticated && !success) {
    return null;
  }

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

    setIsSubmitting(true);
    const res = await signup({
      fullName,
      email,
      username,
      password,
      confirmPassword,
    });
    setIsSubmitting(false);

    if (!res.success) {
      if (res.code === 'USERNAME_TAKEN') {
        setError(t('auth.errors.usernameTaken'));
      } else if (res.code === 'EMAIL_TAKEN') {
        setError(t('auth.errors.emailTaken'));
      } else {
        setError(res.error || t('auth.errors.invalidCredentials'));
      }
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-surface border-4 border-border-strong rounded-neo p-6 sm:p-8 shadow-neo">
        {/* Header */}
        <div className="mb-8 border-b-3 border-border-strong pb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 bg-accent/10 border-2 border-border-strong rounded-neo-sm text-accent">
              <ShieldCheck className="w-6 h-6 text-accent" />
            </span>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-widest text-text-secondary font-bold">
                {language === 'hi' ? 'अव्यक्त सुरक्षित खाता' : 'Avyakta Secure Account'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold uppercase tracking-wide text-text-primary">
                {t('auth.signupTitle')}
              </h1>
            </div>
          </div>
          <p className="text-sm text-text-secondary mt-1">
            {t('auth.signupSubtitle')}
          </p>
        </div>

        {/* Success State */}
        {success ? (
          <div className="space-y-6">
            <div className="p-4 bg-accent/15 border-2 border-accent rounded-neo-sm flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-accent shrink-0 mt-0.5" />
              <div>
                <h2 className="text-base font-extrabold text-text-primary uppercase tracking-wider">
                  {t('auth.verifyEmailTitle')}
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  {t('auth.verifyEmailSubtitle')}
                </p>
              </div>
            </div>

            <div className="p-4 bg-surface-alt border-2 border-border-strong rounded-neo-sm text-xs font-mono text-text-secondary">
              <span className="font-bold text-text-primary block mb-1">
                {language === 'hi' ? 'अगला कदम:' : 'Next Step:'}
              </span>
              {language === 'hi'
                ? 'कृपया अपना इनबॉक्स देखें और ईमेल में दिए गए लिंक पर क्लिक करें। सत्यापन के बाद आप तुरंत लॉग इन कर सकते हैं।'
                : 'Please check your inbox and click the single-use activation link. Once verified, your account is ready for sign-in.'}
            </div>

            <div className="flex justify-between items-center pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-foreground font-extrabold text-sm uppercase tracking-wider border-2 border-border-strong rounded-neo-sm shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
              >
                <span>{t('auth.loginBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href="/verify-email"
                className="text-xs font-mono font-bold text-text-secondary hover:text-accent underline"
              >
                {t('auth.resendVerificationBtn')}
              </Link>
            </div>
          </div>
        ) : (
          /* Signup Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div
                role="alert"
                className="p-3.5 bg-danger/10 border-2 border-danger rounded-neo-sm flex items-start gap-3 text-sm text-danger font-medium animate-in fade-in-50"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-xs font-mono font-bold uppercase tracking-wider text-text-primary mb-1.5">
                {t('auth.fullName')}
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('auth.fullNamePlaceholder')}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-surface border-2 border-border-strong rounded-neo-sm text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner font-sans"
                />
              </div>
            </div>

            {/* Email Address */}
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
                  className="w-full pl-10 pr-3.5 py-2.5 bg-surface border-2 border-border-strong rounded-neo-sm text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner font-sans"
                />
              </div>
            </div>

            {/* Username */}
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
                  pattern="^[a-zA-Z0-9_]{3,30}$"
                  title="3-30 characters, letters, numbers, and underscores only"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('auth.usernamePlaceholder')}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-surface border-2 border-border-strong rounded-neo-sm text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner font-mono"
                />
              </div>
              <p className="text-[11px] text-text-secondary mt-1 font-mono">
                {language === 'hi'
                  ? '3-30 अक्षर, केवल अंग्रेज़ी वर्ण, संख्याएँ और अंडरस्कोर।'
                  : '3–30 characters, letters, numbers, and underscores.'}
              </p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-mono font-bold uppercase tracking-wider text-text-primary mb-1.5">
                {t('auth.password')}
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
              <p className="text-[11px] text-text-secondary mt-1 font-mono">
                {language === 'hi'
                  ? 'सुरक्षा हेतु न्यूनतम 12 अक्षर आवश्यक हैं।'
                  : 'Minimum 12 characters required for secure encryption.'}
              </p>
            </div>

            {/* Confirm Password */}
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
                  className="w-full pl-10 pr-10 py-2.5 bg-surface border-2 border-border-strong rounded-neo-sm text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
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

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-accent text-accent-foreground font-extrabold text-sm uppercase tracking-wider border-2 border-border-strong rounded-neo-sm shadow-neo hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] transition-all disabled:opacity-50"
              >
                {isSubmitting ? t('common.loading') : t('auth.signupBtn')}
              </button>
            </div>

            {/* Footer link to Login */}
            <div className="pt-4 border-t-2 border-border-strong text-center text-xs text-text-secondary">
              <span>{t('auth.haveAccount')}{' '}</span>
              <Link href="/login" className="font-bold text-accent hover:underline uppercase tracking-wider ml-1">
                {t('auth.loginBtn')}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
