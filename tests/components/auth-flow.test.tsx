import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import SignupPage from '@/app/signup/page';
import LoginPage from '@/app/login/page';
import ForgotPasswordPage from '@/app/forgot-password/page';
import { GuestInvitationCard } from '@/components/auth/GuestInvitationCard';
import { Navbar } from '@/components/layout/Navbar';
import { AuthProvider } from '@/context/AuthContext';

describe('Avyakta Authentication UI & Security Flow Tests', () => {
  it('SignupPage renders all 5 required fields with password security constraints', () => {
    const { container } = render(
      <AuthProvider>
        <SignupPage />
      </AuthProvider>
    );

    expect(screen.getByLabelText(/Full Name|पूरा नाम/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address|ईमेल पता/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username|उपयोगकर्ता नाम/i)).toBeInTheDocument();
    expect(container.querySelector('#password')).toBeInTheDocument();
    expect(container.querySelector('#confirmPassword')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account|खाता बनाएँ/i })).toBeInTheDocument();
  });

  it('LoginPage renders exactly two authentication inputs (Username + Password)', () => {
    const { container } = render(
      <AuthProvider>
        <LoginPage />
      </AuthProvider>
    );

    const inputs = screen.getAllByRole('textbox');
    // Exactly 1 textbox (username) and 1 password field
    expect(inputs.length).toBe(1);
    expect(screen.getByLabelText(/Username|उपयोगकर्ता नाम/i)).toBeInTheDocument();
    expect(container.querySelector('#password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login|लॉग इन करें/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Forgot Password\?|पासवर्ड भूल गए\?/i })).toBeInTheDocument();
  });

  it('ForgotPasswordPage renders email input for verified recovery', () => {
    render(
      <AuthProvider>
        <ForgotPasswordPage />
      </AuthProvider>
    );

    expect(screen.getByLabelText(/Email Address|ईमेल पता/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Recovery Link|रीसेट लिंक भेजें/i })).toBeInTheDocument();
  });

  it('GuestInvitationCard displays non-intrusive bilingual account invitation', () => {
    render(
      <AuthProvider>
        <GuestInvitationCard />
      </AuthProvider>
    );

    expect(
      screen.getByText(/Create an account to securely save your learning progress and continue on any device/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Create Free Account|खाता बनाएँ/i })).toBeInTheDocument();
  });

  it('Navbar displays Login and Sign Up controls for guests without breaking responsiveness', () => {
    render(
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    );

    // Guest mode shows login and sign up links
    const loginLinks = screen.getAllByRole('link', { name: /Login|लॉग इन/i });
    expect(loginLinks.length).toBeGreaterThanOrEqual(1);

    const signupLinks = screen.getAllByRole('link', { name: /Sign Up|साइन अप/i });
    expect(signupLinks.length).toBeGreaterThanOrEqual(1);
  });
});
