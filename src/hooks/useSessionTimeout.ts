import { useState, useEffect, useCallback } from 'react';

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes
const WARNING_DURATION = 30 * 1000; // 30 seconds before timeout

export function useSessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const [warningTimeoutId, setWarningTimeoutId] = useState<number | null>(null);

  const clearTimeouts = useCallback(() => {
    if (timeoutId) clearTimeout(timeoutId);
    if (warningTimeoutId) clearTimeout(warningTimeoutId);
  }, [timeoutId, warningTimeoutId]);

  const logout = useCallback(() => {
    clearTimeouts();
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  }, [clearTimeouts]);

  const resetTimer = useCallback(() => {
    clearTimeouts();
    setShowWarning(false);

    const warningTimeout = setTimeout(() => {
      setShowWarning(true);
    }, TIMEOUT_DURATION - WARNING_DURATION);

    const logoutTimeout = setTimeout(() => {
      logout();
    }, TIMEOUT_DURATION);

    setWarningTimeoutId(warningTimeout);
    setTimeoutId(logoutTimeout);
  }, [clearTimeouts, logout]);

  const extendSession = useCallback(() => {
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeouts();
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [resetTimer, clearTimeouts]);

  return { showWarning, extendSession, logout };
}
