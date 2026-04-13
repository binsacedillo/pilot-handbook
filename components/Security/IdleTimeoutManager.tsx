'use client';

import { useEffect, useState, useRef } from 'react';
import { useClerk, useAuth } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useIdleTimer } from '@/lib/hooks/useIdleTimer';
import { SESSION_CONFIG } from '@/lib/security/session-config';
import { trpc } from '@/trpc/client';
import { TRPCClientError } from '@trpc/client';
import { useToast } from '@/components/ui/toast';
import { ShieldAlert, Clock, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';

/**
 * Global component that handles inactivity and session timeouts.
 * Designed with ISO 9241 UX standards and ISO 27001 security controls.
 */
export function IdleTimeoutManager() {
  const { signOut } = useClerk();
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const { showToast } = useToast();
  const logSecurityEvent = trpc.user.logSecurityEvent.useMutation({
    // SILENT MUTATION: Prevents tRPC from logging 401 failures to the terminal/console
    // during session death events. This is "Normal Procedures" for session cleanup.
    onError: () => {} 
  });
  
  const [open, setOpen] = useState(false);
  const [isHardLimit, setIsHardLimit] = useState(false);
  const toastTriggered = useRef(false);

  const handleLogout = async (type: 'INACTIVITY_LOGOUT' | 'HARD_SESSION_LOGOUT') => {
    try {
      // 1. Audit log the event on the server (Only if we still have a frontend session)
      if (isSignedIn) {
        await logSecurityEvent.mutateAsync({ 
          type, 
          details: `Auto-logout from ${pathname}` 
        });
      }
    } catch (e) {
      if (e instanceof TRPCClientError && e.data?.code === 'UNAUTHORIZED') {
        // CATEGORY: NORMAL PROCEDURES
        // The server expired the session before the log could land.
        console.warn('🛡️ Security: Audit log attempted post-expiry. Session already terminated by server.');
      } else if (e instanceof Error && e.name === 'AbortError') {
        // CATEGORY: NORMAL PROCEDURES
        // Request was aborted (likely due to the 5-10s tRPC timeout or page navigation).
        console.warn('🛡️ Security: Audit log aborted. Proceeding with immediate sign-out for safety.');
      } else {
        // CATEGORY: SYSTEM FAILURE
        // Actual error (Network issue, Database failure, etc.)
        console.error('🚨 Security: Critical failure during logout audit:', e);
      }
    } finally {
      // 2. Perform the actual sign out with context recovery URL
      signOut({ redirectUrl: pathname });
    }
  };

  const { status, timeLeft, resetTimer } = useIdleTimer({
    onIdle: () => handleLogout('INACTIVITY_LOGOUT'),
    onHardLimit: () => handleLogout('HARD_SESSION_LOGOUT'),
  });

  // Sync dialog visibility with warning status and trigger "Master Caution" Toast
  useEffect(() => {
    if (status === 'warning') {
      setOpen(true);
      setIsHardLimit(false);
    } else if (status === 'hard-limit-warning') {
      setOpen(true);
      setIsHardLimit(true);
    } else if (status === 'active') {
      setOpen(false);
      toastTriggered.current = false; // Reset toast trigger
    }

    // MASTER CAUTION: 60-second secondary warning toast
    if (timeLeft > 59000 && timeLeft < 61000 && !toastTriggered.current && (status === 'warning' || status === 'hard-limit-warning')) {
      showToast(
        `Master Caution: Session will expire in 60s.`, 
        "info", 
        { duration: 8000 }
      );
      toastTriggered.current = true;
    }
  }, [status, timeLeft, showToast]);

  // If user is not signed in, this manager is inactive
  if (!isSignedIn) return null;

  // Format time remaining for the UI
  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && resetTimer()}>
      <DialogContent className="sm:max-w-[425px] border-2 border-amber-500 shadow-2xl dark:bg-slate-900">
        <DialogHeader className="flex flex-col items-center gap-4 text-center">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            {isHardLimit ? (
              <ShieldAlert className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-pulse" />
            ) : (
              <Clock className="w-8 h-8 text-amber-600 dark:text-amber-400 animate-pulse" />
            )}
          </div>
          <DialogTitle className="text-2xl font-bold">
            {isHardLimit ? 'Session Expiring' : 'Security Check'}
          </DialogTitle>
          <DialogDescription className="text-base text-slate-600 dark:text-slate-400">
            {isHardLimit ? (
              <>
                For your protection, sessions are limited to 12 hours. 
                Your session will end in <span className="font-bold text-amber-600 dark:text-amber-400">{formatTime(timeLeft)}</span>.
              </>
            ) : (
              <>
                You have been inactive for a while. For safety, you will be logged out in 
                <span className="font-bold text-amber-600 dark:text-amber-400"> {formatTime(timeLeft)}</span>.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-4">
          {!isHardLimit && (
            <Button 
              onClick={() => resetTimer()} 
              className="w-full sm:flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold h-12 gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              Keep Session Alive
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={() => handleLogout(isHardLimit ? 'HARD_SESSION_LOGOUT' : 'INACTIVITY_LOGOUT')}
            className="w-full sm:w-auto h-12 gap-2 border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            <Lock className="w-4 h-4" />
            Sign Out Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
