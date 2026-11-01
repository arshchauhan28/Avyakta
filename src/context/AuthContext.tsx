'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api, UserSession } from '@/lib/api';
import { SaveManager } from '@/game/progression/SaveManager';

interface AuthContextType {
  user: UserSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string; code?: string }>;
  signup: (data: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }) => Promise<{ success: boolean; error?: string; code?: string }>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  resetPassword: (token: string, password: string, confirmPassword: string) => Promise<{ success: boolean; error?: string }>;
  refreshUser: () => Promise<void>;
  hasPendingGuestImport: boolean;
  confirmGuestImport: () => Promise<{ success: boolean; message?: string }>;
  dismissGuestImport: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPendingGuestImport, setHasPendingGuestImport] = useState(false);

  const checkPendingGuestProgress = useCallback(() => {
    try {
      const localProg = SaveManager.loadProgress();
      // If guest has completed any levels locally
      if (localProg && localProg.completedLevelIds && localProg.completedLevelIds.length > 0) {
        setHasPendingGuestImport(true);
      }
    } catch {
      // Ignore
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.getSession();
      if (res.data?.authenticated && res.data.user) {
        const u = res.data.user;
        setUser({
          id: u.id,
          fullName: u.full_name,
          email: u.email,
          username: u.username,
          isVerified: u.is_verified,
          createdAt: u.created_at,
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    const res = await api.login({ username, password });
    setIsLoading(false);

    if (res.error) {
      return { success: false, error: res.error.message, code: res.error.code };
    }

    if (res.data?.user) {
      const u = res.data.user;
      setUser({
        id: u.id,
        fullName: u.full_name,
        email: u.email,
        username: u.username,
        isVerified: u.is_verified,
        createdAt: u.created_at,
      });

      // Check if local guest data can be imported
      checkPendingGuestProgress();
      return { success: true };
    }

    return { success: false, error: 'Login failed. Please check your credentials.' };
  };

  const signup = async (data: {
    fullName: string;
    email: string;
    username: string;
    password: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);
    const res = await api.signup(data);
    setIsLoading(false);

    if (res.error) {
      return { success: false, error: res.error.message, code: res.error.code };
    }

    return { success: true };
  };

  const logout = async () => {
    setIsLoading(true);
    await api.logout();
    setUser(null);
    setHasPendingGuestImport(false);
    setIsLoading(false);
  };

  const verifyEmail = async (token: string) => {
    const res = await api.verifyEmail(token);
    if (res.error) {
      return { success: false, error: res.error.message };
    }
    await refreshUser();
    return { success: true };
  };

  const resendVerification = async (email: string) => {
    const res = await api.resendVerification(email);
    if (res.error) {
      return { success: false, error: res.error.message };
    }
    return { success: true, message: res.data?.message };
  };

  const forgotPassword = async (email: string) => {
    const res = await api.forgotPassword(email);
    if (res.error) {
      return { success: false, error: res.error.message };
    }
    return { success: true, message: res.data?.message };
  };

  const resetPassword = async (token: string, password: string, confirmPassword: string) => {
    const res = await api.resetPassword({ token, password, confirmPassword });
    if (res.error) {
      return { success: false, error: res.error.message };
    }
    return { success: true };
  };

  const confirmGuestImport = async () => {
    try {
      const localProg = SaveManager.loadProgress();
      if (!localProg) {
        setHasPendingGuestImport(false);
        return { success: false, message: 'No local progress found to import.' };
      }

      const rooms = localProg.rooms || localProg.roomProgress || {};
      const levelProgress: Record<string, string[]> = {};
      for (const [lvlId, room] of Object.entries(rooms)) {
        const completedTasks: string[] = [];
        if (room.tasks?.reading) completedTasks.push('task1');
        if (room.tasks?.understanding) completedTasks.push('task2');
        if (room.tasks?.challenge) completedTasks.push('task3');
        levelProgress[lvlId] = completedTasks;
      }

      const res = await api.importGuestProgress({
        version: localProg.version || 2,
        currentLevelId: localProg.currentLevelId || '1.1',
        completedLevels: localProg.completedLevelIds || [],
        levelProgress,
        achievements: localProg.unlockedAchievementIds || [],
        totalXP: localProg.totalXP || 0,
      });

      setHasPendingGuestImport(false);

      if (res.error) {
        return { success: false, message: res.error.message };
      }

      return {
        success: true,
        message: res.data?.message || 'Successfully imported guest progress.',
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Import failed.' };
    }
  };

  const dismissGuestImport = () => {
    setHasPendingGuestImport(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
        verifyEmail,
        resendVerification,
        forgotPassword,
        resetPassword,
        refreshUser,
        hasPendingGuestImport,
        confirmGuestImport,
        dismissGuestImport,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const defaultGuestAuth: AuthContextType = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: async () => ({ success: false, error: 'Auth context unavailable' }),
  signup: async () => ({ success: false, error: 'Auth context unavailable' }),
  logout: async () => {},
  verifyEmail: async () => ({ success: false, error: 'Auth context unavailable' }),
  resendVerification: async () => ({ success: false, error: 'Auth context unavailable' }),
  forgotPassword: async () => ({ success: false, error: 'Auth context unavailable' }),
  resetPassword: async () => ({ success: false, error: 'Auth context unavailable' }),
  refreshUser: async () => {},
  hasPendingGuestImport: false,
  confirmGuestImport: async () => ({ success: false, message: 'Auth context unavailable' }),
  dismissGuestImport: () => {},
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  return context || defaultGuestAuth;
}
