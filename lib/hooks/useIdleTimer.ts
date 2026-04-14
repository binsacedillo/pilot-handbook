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
  const statusRef = useRef<IdleStatus>(status);
  const [timeLeft, setTimeLeft] = useState<number>(SESSION_CONFIG.IDLE_TIMEOUT_MS);
  
  // Use refs to avoid closure staleness issues with intervals
  const channelRef = useRef<BroadcastChannel | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveTriggered = useRef<boolean>(false);

  const logout = useCallback(() => {
    setStatus('expired');
    statusRef.current = 'expired';
    onIdle?.();
  }, [onIdle]);

  const hardLogout = useCallback(() => {
    setStatus('hard-limit-expired');
    statusRef.current = 'hard-limit-expired';
    onHardLimit?.();
  }, [onHardLimit]);

  const resetTimer = useCallback((sync = true) => {
    const now = Date.now();
    localStorage.setItem(SESSION_CONFIG.STORAGE_KEY_LAST_ACTIVITY, now.toString());
    setStatus('active');
    statusRef.current = 'active';
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
    // Initialize session start time if not present or too old (Security Best Practice)
    const nowOnMount = Date.now();
    const storedStart = localStorage.getItem(SESSION_CONFIG.STORAGE_KEY_SESSION_START);
    const storedActivity = localStorage.getItem(SESSION_CONFIG.STORAGE_KEY_LAST_ACTIVITY);

    if (!storedStart || (nowOnMount - parseInt(storedStart)) > SESSION_CONFIG.MAX_SESSION_MS) {
      localStorage.setItem(SESSION_CONFIG.STORAGE_KEY_SESSION_START, nowOnMount.toString());
      localStorage.setItem(SESSION_CONFIG.STORAGE_KEY_LAST_ACTIVITY, nowOnMount.toString());
    } else if (storedActivity && (nowOnMount - parseInt(storedActivity)) > SESSION_CONFIG.IDLE_TIMEOUT_MS) {
      // If idle for too long, we also reset start to prevent immediate hard-limit but keep logic consistent
      localStorage.setItem(SESSION_CONFIG.STORAGE_KEY_LAST_ACTIVITY, nowOnMount.toString());
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
      // 0. Protection: If already expired, stop the interval logic immediately
      if (statusRef.current === 'expired' || statusRef.current === 'hard-limit-expired') {
        if (timerRef.current) clearInterval(timerRef.current);
        return;
      }

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
  }, [resetTimer, logout, hardLogout, onWarning, status]);

  return { status, timeLeft, resetTimer };
}
