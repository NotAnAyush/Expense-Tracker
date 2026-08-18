/**
 * Native App Badging API Utility
 * Updates the PWA dock / home-screen badge icon with unread alerts or pending debts.
 */

export const updateAppBadge = async (count = 0) => {
  if (typeof navigator !== 'undefined' && 'setAppBadge' in navigator) {
    try {
      if (count > 0) {
        await navigator.setAppBadge(count);
      } else {
        await navigator.clearAppBadge();
      }
    } catch (e) {
      console.warn('[App Badging Error]:', e.message);
    }
  }
};

export const clearAppBadge = async () => {
  if (typeof navigator !== 'undefined' && 'clearAppBadge' in navigator) {
    try {
      await navigator.clearAppBadge();
    } catch (e) {
      // Clear badge error fallback
    }
  }
};
