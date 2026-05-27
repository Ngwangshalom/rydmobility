import { notificationHelper } from '@src/commonComponent';
import { useRef, useCallback, useState } from 'react';

/**
 * useButtonGuard - Global spam protection for any button press.
 * 
 * Usage:
 *   const { guardedPress, loading } = useButtonGuard();
 *   <Button onPress={() => guardedPress(myAsyncAction)} loading={loading} />
 * 
 * @param cooldown - Minimum ms between presses (default 2000ms)
 */
const useButtonGuard = (cooldown: number = 2000) => {
  const lastPressRef = useRef<number>(0);
  const [loading, setLoading] = useState(false);

  const guardedPress = useCallback(async (callback: () => Promise<any> | void) => {
    const now = Date.now();

    if (loading) return; // already in progress

    if (now - lastPressRef.current < cooldown) {
      notificationHelper('', 'Too many attempts. Please wait.', 'error');
      return;
    }

    lastPressRef.current = now;
    setLoading(true);

    try {
      await callback();
    } catch (e) {
      // error handled by caller
    } finally {
      setLoading(false);
    }
  }, [cooldown, loading]);

  return { guardedPress, loading };
};

export default useButtonGuard;
