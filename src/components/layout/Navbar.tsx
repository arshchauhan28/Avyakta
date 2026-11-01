'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Compass,
  Award,
  BarChart3,
  Settings,
  Zap,
  Sparkles,
  Menu,
  X,
  BookOpen,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { ThemeSwitcher } from './ThemeSwitcher';
import { LanguageSwitcher } from './LanguageSwitcher';
import { SaveManager } from '@/game/progression/SaveManager';
import { AchievementService } from '@/game/progression/AchievementService';
import { GameProgress } from '@/game/types/progression';
import { useTranslation } from '@/i18n/useTranslation';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const { language, t } = useTranslation();
  const { user, isAuthenticated, logout } = useAuth();
  const [progress, setProgress] = useState<GameProgress | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setProgress(SaveManager.loadProgress());
    const handleStorage = () => setProgress(SaveManager.loadProgress());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [pathname]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close on escape key and on desktop resize
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth >= 1280) setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const totalXP = progress?.totalXP || 0;
  const currentLevelId = progress?.currentLevelId || '1.1';
  const rank = AchievementService.getRankForXP(totalXP);

  const navLinks = [
    { href: '/', label: t('nav.dashboard'), icon: LayoutDashboard, exact: true },
    { href: '/journey', label: t('nav.journey'), icon: Compass },
    { href: '/achievements', label: t('nav.achievements'), icon: Award },
    { href: '/progress', label: t('nav.progress'), icon: BarChart3 },
    { href: '/settings', label: t('nav.settings'), icon: Settings },
  ];

  const isLinkActive = (href: string, exact?: boolean) => {
    if (!pathname) return href === '/';
    if (exact) return pathname === '/' || pathname === '/dashboard';
    if (href === '/journey') return pathname.startsWith('/journey') || pathname.startsWith('/learn');
    return pathname.startsWith(href);
  };

  const currentRoomUrl = `/learn/${currentLevelId.replace('.', '/')}`;

  return (
    <header className="sticky top-0 z-40 w-full bg-navbar border-b-2 border-border-strong shadow-neo-sm transition-colors">
      <div className="w-full px-3 sm:px-4 lg:px-6 2xl:px-8 h-16 flex items-center justify-between gap-2 sm:gap-3">
        {/* Left Side: Brand & Status indicators */}
        <div className="flex items-center gap-2 lg:gap-3 shrink-0 min-w-0">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 group focus-visible:ring-2 focus-visible:ring-accent rounded-neo-sm shrink-0"
            aria-label="Avyakta Home"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-neo-sm bg-accent text-accent-contrast border-2 border-border-strong flex items-center justify-center shadow-neo-sm group-hover:translate-x-[-1px] group-hover:translate-y-[-1px] group-hover:shadow-neo transition-all shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-sm sm:text-base tracking-wider text-text-primary uppercase font-sans leading-none">
                AVYAKTA
              </span>
              <span className="hidden 2xl:block text-[10px] font-sanskrit text-primary font-bold tracking-wide leading-tight truncate">
                श्रीमद्भगवद्गीता
              </span>
            </div>
          </Link>

          {/* Current Room Pill */}
          <Link
            href={currentRoomUrl}
            className="hidden 2xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-neo-sm bg-surface border-2 border-border-strong text-text-primary text-xs font-mono font-bold hover:bg-surface-hover shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
            title="Resume Current Shloka Room"
          >
            <BookOpen className="w-3.5 h-3.5 text-accent" />
            <span>{language === 'hi' ? `कक्ष ${currentLevelId}` : `ROOM ${currentLevelId}`}</span>
          </Link>

          {/* XP Badge */}
          <Link
            href="/achievements"
            className="hidden lg:inline-flex items-center gap-1.5 px-2 xl:px-2.5 py-1 rounded-neo-sm bg-surface border-2 border-border-strong text-text-primary hover:bg-surface-hover text-xs font-mono font-bold shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all shrink-0"
            title={`Total Experience Points: ${totalXP} XP (${rank.title})`}
          >
            <Zap className="w-3.5 h-3.5 text-accent fill-accent shrink-0" />
            <span className="text-text-primary whitespace-nowrap">{totalXP} XP</span>
          </Link>

          {/* Theme & Language Switchers */}
          <div className="hidden xl:flex items-center gap-1.5 xl:gap-2 shrink-0">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>

        {/* Right Side: Primary Navigation Links */}
        <nav
          className="hidden xl:flex items-center gap-1 2xl:gap-1.5 shrink-0 min-w-0"
          aria-label="Main Navigation"
        >
          {navLinks.map((link) => {
            const active = isLinkActive(link.href, link.exact);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-1 xl:gap-1.5 px-1.5 xl:px-2 2xl:px-2.5 py-1 text-[11px] 2xl:text-xs uppercase font-extrabold tracking-wider rounded-neo-sm border-2 whitespace-nowrap transition-all ${
                  active
                    ? 'bg-accent text-accent-contrast border-border-strong shadow-neo-sm'
                    : 'bg-transparent text-text-secondary border-transparent hover:border-border-strong hover:bg-surface hover:text-text-primary'
                }`}
              >
                <Icon className="w-3.5 h-3.5 xl:w-4 xl:h-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden xl:flex items-center gap-1.5 shrink-0 pl-1.5 border-l-2 border-border-strong/60">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-1">
              <Link
                href="/account"
                className="inline-flex items-center gap-1.5 px-2 py-1 xl:px-2.5 rounded-neo-sm bg-surface border-2 border-border-strong text-text-primary hover:bg-surface-hover text-xs font-mono font-bold shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
                title={`Signed in as @${user.username}`}
                aria-label={`Signed in as @${user.username}`}
              >
                <UserIcon className="w-3.5 h-3.5 text-accent shrink-0" />
                <span className="max-w-[70px] xl:max-w-[90px] 2xl:max-w-[120px] truncate">@{user.username}</span>
              </Link>
              <button
                type="button"
                onClick={() => logout()}
                className="p-1 xl:px-2 xl:py-1 rounded-neo-sm bg-surface hover:bg-surface-hover border-2 border-border-strong text-danger text-xs font-mono font-bold shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all flex items-center justify-center shrink-0"
                title={t('nav.logout')}
                aria-label={t('nav.logout')}
              >
                <LogOut className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 shrink-0">
              <Link
                href="/login"
                className="px-2 py-1 text-xs font-mono font-extrabold uppercase rounded-neo-sm text-text-secondary hover:text-text-primary hover:bg-surface border-2 border-transparent hover:border-border-strong transition-all shrink-0"
              >
                {t('nav.login')}
              </Link>
              <Link
                href="/signup"
                className="px-2 py-1 text-xs font-mono font-extrabold uppercase rounded-neo-sm bg-accent text-accent-foreground border-2 border-border-strong shadow-neo-sm hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all shrink-0"
              >
                {t('nav.signup')}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile / Tablet Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 xl:hidden shrink-0">
          {/* Mobile XP badge */}
          <Link
            href="/achievements"
            className="hidden sm:inline-flex items-center gap-1 px-2 py-1 rounded-neo-sm bg-surface border-2 border-border-strong text-text-primary text-xs font-mono font-bold shadow-neo-sm"
          >
            <Zap className="w-3 h-3 text-accent fill-accent" />
            <span>{totalXP}</span>
          </Link>

          {/* Language and Theme switcher */}
          <LanguageSwitcher />
          <ThemeSwitcher />

          {/* Hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-neo-sm bg-surface border-2 border-border-strong text-text-primary hover:bg-surface-hover shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div id="mobile-drawer" className="xl:hidden border-t-2 border-border-strong bg-navbar shadow-neo p-4 animate-in slide-in-from-top-2 duration-150">
          {/* Quick status bar */}
          <div className="mb-4 pb-3 border-b-2 border-border-strong flex items-center justify-between text-xs font-mono">
            <Link
              href={currentRoomUrl}
              onClick={() => setMobileMenuOpen(false)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-surface border-2 border-border-strong rounded-neo-sm font-bold text-text-primary shadow-neo-sm"
            >
              <BookOpen className="w-3.5 h-3.5 text-accent" />
              <span>{language === 'hi' ? `कक्ष ${currentLevelId} जारी रखें` : `Resume Room ${currentLevelId}`}</span>
            </Link>

            <span className="font-bold text-text-secondary">
              {t('achievements.rank')}: <span className="text-accent">{language === 'hi' ? rank.titleSanskrit : rank.title}</span>
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2" aria-label="Mobile Navigation">
            {navLinks.map((link) => {
              const active = isLinkActive(link.href, link.exact);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-3 px-3.5 py-2.5 min-h-[44px] text-sm uppercase font-extrabold tracking-wide rounded-neo-sm border-2 transition-all ${
                    active
                      ? 'bg-accent text-accent-contrast border-border-strong shadow-neo-sm'
                      : 'bg-surface text-text-primary border-border-strong hover:bg-surface-hover'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile Auth Controls */}
          <div className="mt-3 pt-3 border-t-2 border-border-strong">
            {isAuthenticated && user ? (
              <div className="flex items-center justify-between gap-2">
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 flex items-center gap-2 px-3 py-2 bg-surface border-2 border-border-strong rounded-neo-sm text-xs font-mono font-bold text-text-primary shadow-neo-sm"
                >
                  <UserIcon className="w-4 h-4 text-accent" />
                  <span className="truncate">@{user.username}</span>
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 bg-surface hover:bg-surface-hover border-2 border-border-strong rounded-neo-sm text-xs font-mono font-bold text-danger shadow-neo-sm"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-surface border-2 border-border-strong rounded-neo-sm text-xs font-mono font-bold text-text-primary shadow-neo-sm"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-accent text-accent-foreground border-2 border-border-strong rounded-neo-sm text-xs font-mono font-extrabold uppercase shadow-neo-sm"
                >
                  {t('nav.signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
