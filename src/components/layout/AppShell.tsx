'use client';

import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary transition-colors">
      {/* Full-Width Horizontal Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full min-w-0">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};
