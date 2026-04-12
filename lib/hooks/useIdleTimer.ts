'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { SESSION_CONFIG } from '../security/session-config';

export type IdleStatus = 'active' | 'warning' | 'expired' | 'hard-limit-warning' | 'hard-limit-expired';

interface UseIdleTimerProps {
  onIdle?: () => void;
  onHardLimit?: () => void;
  onWarning?: (timeLeft: number) => void;
}

export function useIdleTimer({ onIdle, onHardLimit, onWarning }: UseIdleTimerProps = {}) {
  const [status, setStatus] = useState<IdleStatus>('active');
  const [timeLeft, setTimeLeft] = useState<number>(SESSION_CONFIG.IDLE_TIMEOUT_MS);
  
  // Use refs to avoid closure staleness issues with intervals
  const channelRef = useRef<BroadcastChannel | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTriggered = useRef<boolean>(false);

  const logout = useCallback(() => {
    setStatus('expired');
    onIdle?.();
  }, [onIdle]);

  const hardLogout = useCallback(() => {
    setStatus('hard-limit-expired');
    onHardLimit?.();
  }, [onHardLimit]);

  const resetTimer = useCallback((sync = true) => {
    const now = Date.now();
    localStorage.setItem(SESSION_CONFIG.STORAGE_KEY_LAST_ACTIVITY, now.toString());
    setStatus('active');
    autoSaveTriggered.current = false;
    
    if (sync && channelRef.current) {
      try {
        channelRef.current.postMessage({ type: 'RESET_EXT', timestamp: now });
      } catch (e) {
        // Ignore errors from closed channels during unmount
      }
    }
  }, []);

  useEffect(() => {
    // Initialize session start time if not present
    if (!localStorage.getItem(SESSION_CONFIG.STORAGE_KEY_SESSION_START)) {
      localStorage.setItem(SESSION_CONFIG.STORAGE_KEY_SESSION_START, Date.now().toString());
    }

    // Initialize broadcast channel for multi-tab sync
    if (typeof window !== 'undefined' && !channelRef.current) {
      channelRef.current = new BroadcastChannel(SESSION_CONFIG.SYNC_CHANNEL_NAME);
      channelRef.current.onmessage = (event) => {
        if (event.data.type === 'RESET_EXT') {
          resetTimer(false);
        }
      };
    }

    // Activity event listeners
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
    const handleActivity = () => resetTimer(true);

    events.forEach(event => window.addEventListener(event, handleActivity));

    // Main Tick Interval
    timerRef.current = setInterval(() => {
      const now = Date.now();
      const lastActivity = parseInt(localStorage.getItem(SESSION_CONFIG.STORAGE_KEY_LAST_ACTIVITY) || now.toString());
      const sessionStart = parseInt(localStorage.getItem(SESSION_CONFIG.STORAGE_KEY_SESSION_START) || now.toString());
      
      const idleElapsed = now - lastActivity;
      const totalElapsed = now - sessionStart;

      // 1. Check Hard Limit (12 hours)
      if (totalElapsed >= SESSION_CONFIG.MAX_SESSION_MS) {
        hardLogout();
        return;
      }

      if (totalElapsed >= (SESSION_CONFIG.MAX_SESSION_MS - SESSION_CONFIG.MAX_SESSION_WARNING_MS)) {
        setStatus('hard-limit-warning');
        const remainingHard = SESSION_CONFIG.MAX_SESSION_MS - totalElapsed;
        setTimeLeft(remainingHard);
        onWarning?.(remainingHard);
        return;
      }

      // 2. Check Idle Timeout (20 mins)
      if (idleElapsed >= SESSION_CONFIG.IDLE_TIMEOUT_MS) {
        logout();
        return;
      }

      // Warning Phase
      if (idleElapsed >= (SESSION_CONFIG.IDLE_TIMEOUT_MS - SESSION_CONFIG.WARNING_THRESHOLD_MS)) {
        setStatus('warning');
        const remainingIdle = SESSION_CONFIG.IDLE_TIMEOUT_MS - idleElapsed;
        setTimeLeft(remainingIdle);
        onWarning?.(remainingIdle);

        // Trigger silent auto-save signal once when entering warning phase
        if (!autoSaveTriggered.current) {
          window.dispatchEvent(new CustomEvent(SESSION_CONFIG.AUTO_SAVE_EVENT));
          autoSaveTriggered.current = true;
          console.log('🛡️ Security: Inactivity warning detected. Auto-save signal dispatched.');
        }
      } else {
        setStatus('active');
        autoSaveTriggered.current = false;
      }
    }, 1000);

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (timerRef.current) clearInterval(timerRef.current);
      if (channelRef.current) {
        channelRef.current.close();
        channelRef.current = null;
      }
    };
  }, [resetTimer, logout, hardLogout, onWarning]);

  return { status, timeLeft, resetTimer };
}
