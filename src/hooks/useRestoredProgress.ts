'use client';

import { useState, useEffect } from 'react';
import { GameProgress } from '@/game/types/progression';
import { SaveManager, INITIAL_GAME_PROGRESS } from '@/game/progression/SaveManager';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

/**
 * SSR-safe hook that restores either guest progress from LocalStorage
 * or authoritative cloud progress from Neon PostgreSQL for authenticated users.
 * 
 * Prevents server/client hydration mismatch by guaranteeing deterministic
 * initial state on both server and client render before executing restoration.
 */
export function useRestoredProgress() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [progress, setProgress] = useState<GameProgress>(INITIAL_GAME_PROGRESS);
  const [isRestored, setIsRestored] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function restore() {
      if (authLoading) return;

      if (isAuthenticated) {
        try {
          const res = await api.getProgress();
          if (res.data && isMounted) {
            const cloudProg = SaveManager.cloudToGameProgress(res.data);
            setProgress(cloudProg);
            setIsRestored(true);
            return;
          }
        } catch (err) {
          console.warn('Failed to load cloud progress, falling back to local progress:', err);
        }
      }

      if (isMounted) {
        const localProg = SaveManager.loadProgress();
        setProgress(localProg);
        setIsRestored(true);
      }
    }

    restore();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, authLoading]);

  return { progress, isRestored };
}
