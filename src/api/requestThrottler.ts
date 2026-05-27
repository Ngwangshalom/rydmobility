import { ENABLE_ENDPOINT_THROTTLE } from "./config";

interface RequestState {
  lastCall: number;
}

let requestHistory: Record<string, RequestState> = {};
// let isEnabled = false; // Moved to central config.tsx

// 1 second cooldown for the EXACT same endpoint to prevent auto-clickers
const COOLDOWN_MS = 100;

/**
 * Throttles repetitive requests to the same URL.
 * Returns true if the request should be blocked.
 */
export const isThrottled = (url: string = 'global'): boolean => {
  if (!ENABLE_ENDPOINT_THROTTLE) return false;
  const now = Date.now();
  const lastState = requestHistory[url];

  // Specific URL throttling (e.g. 1s)
  // This blocks the EXACT same endpoint from being hit too fast (typically by a spam click)
  if (lastState && now - lastState.lastCall < COOLDOWN_MS) {
    // Only log it, don't show toast to avoid spamming the UI
    console.warn(`[THROTTLED] Request blocked to prevent spam/infinite loop: ${url}`);
    return true;
  }

  requestHistory[url] = { lastCall: now };
  return false;
};

export const resetThrottler = () => {
  requestHistory = {};
};

/**
 * Note: Dynamic control is now handled via ENABLE_ENDPOINT_THROTTLE from config.tsx
 */
export const setThrottlingEnabled = (enabled: boolean) => {
  console.warn(`[Throttler] Dynamic toggle is deprecated. Please update config.tsx ENABLE_ENDPOINT_THROTTLE.`);
};
