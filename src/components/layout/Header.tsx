"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { BarChart3, Menu, X, Sparkles, Compass, Award, Settings } from "lucide-react";

interface NavLinkItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  highlight?: boolean;
  badge?: number | string;
}

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: NavLinkItem[] = [
    { href: "/", label: "Dashboard", exact: true },
    { href: "/journey", label: "My Journey", icon: Compass },
    { href: "/achievements", label: "Achievements", icon: Award },
    { href: "/progress", label: "My Progress", icon: BarChart3 },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const isLinkActive = (href: string, exact?: boolean) => {
    if (!pathname) return href === "/";
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-surface/90 border-b border-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo / Title */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group focus-visible:ring-2 focus-visible:ring-accent rounded-lg p-1"
          aria-label="श्रीमद्भगवद्गीता - Home"
        >
          <div className="w-9 h-9 rounded-full bg-accent-soft text-primary flex items-center justify-center border border-accent/30 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-accent" />
          </div>
          <div className="flex flex-col">
            <span className="font-sanskrit text-lg font-bold text-text-primary tracking-wide group-hover:text-primary transition-colors">
              श्रीमद्भगवद्गीता
            </span>
            <span className="text-[10px] tracking-wider uppercase text-text-muted font-medium">
              Bhagavad Gita
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  active
                    ? "text-primary bg-accent-soft/60 font-semibold"
                    : link.highlight
                    ? "text-accent border border-accent/40 bg-accent-soft/30 font-semibold hover:bg-accent-soft/60"
                    : "text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {link.icon && <link.icon className="w-4 h-4 opacity-75" />}
                <span>{link.label}</span>
                {link.badge !== undefined && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-accent text-white leading-none">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Actions: Theme Switcher + Mobile Toggle */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-accent"
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface border-b border-border px-4 pt-2 pb-6 space-y-1 shadow-lg animate-in slide-in-from-top duration-200">
          {navLinks.map((link) => {
            const active = isLinkActive(link.href, link.exact);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-base font-medium transition-colors ${
                  active
                    ? "text-primary bg-accent-soft/70 font-semibold"
                    : "text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5"
                }`}
                aria-current={active ? "page" : undefined}
              >
                <div className="flex items-center gap-2.5">
                  {link.icon && <link.icon className="w-5 h-5 opacity-75" />}
                  <span>{link.label}</span>
                </div>
                {link.badge !== undefined && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-accent text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
