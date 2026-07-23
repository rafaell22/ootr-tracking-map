// @ts-check
import domUtils from '../domUtils.js';

const TOAST_DISMISS_MS = 3500;
const WAKE_CUE_DISMISS_MS = 600;

const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
};

/**
 * Generic, standalone toast/notification component. Has no knowledge of any
 * particular feature — callers just call `Toast.show(...)` or
 * `Toast.flashWakeCue()` from anywhere.
 *
 * Only one result toast and one wake cue are ever on screen at a time: a new
 * call replaces whatever of its own kind is currently showing (and restarts
 * its dismiss timer) instead of stacking, since a player only needs to see
 * the latest status.
 */
export default class Toast {
  /** @type {HTMLElement | null} */
  static toastEl = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  static toastDismissTimeoutId = null;

  /** @type {HTMLElement | null} */
  static wakeCueEl = null;
  /** @type {ReturnType<typeof setTimeout> | null} */
  static wakeCueDismissTimeoutId = null;

  /**
   * Show a short-lived, non-blocking success/error message that
   * auto-dismisses on its own.
   * @param {string} message
   * @param {{ type?: 'success' | 'error' }} [options]
   */
  static show(message, { type = TOAST_TYPES.SUCCESS } = {}) {
    if(Toast.toastDismissTimeoutId) {
      clearTimeout(Toast.toastDismissTimeoutId);
    }
    if(Toast.toastEl) {
      Toast.toastEl.remove();
    }

    Toast.toastEl = domUtils.createElement('div', {
      class: ['toast', `toast--${type}`],
      textContent: message,
    });
    document.body.appendChild(Toast.toastEl);

    Toast.toastDismissTimeoutId = setTimeout(() => {
      Toast.toastEl?.remove();
      Toast.toastEl = null;
      Toast.toastDismissTimeoutId = null;
    }, TOAST_DISMISS_MS);
  }

  /**
   * Briefly flash a cue acknowledging that the wake word was heard. Visually
   * distinct from `show()` (position, color, shape and animation all differ)
   * so it reads as "listening now" rather than a command result.
   */
  static flashWakeCue() {
    if(Toast.wakeCueDismissTimeoutId) {
      clearTimeout(Toast.wakeCueDismissTimeoutId);
    }
    if(Toast.wakeCueEl) {
      Toast.wakeCueEl.remove();
    }

    Toast.wakeCueEl = domUtils.createElement('div', { class: ['wake-cue'] });
    document.body.appendChild(Toast.wakeCueEl);

    Toast.wakeCueDismissTimeoutId = setTimeout(() => {
      Toast.wakeCueEl?.remove();
      Toast.wakeCueEl = null;
      Toast.wakeCueDismissTimeoutId = null;
    }, WAKE_CUE_DISMISS_MS);
  }
}

export { TOAST_TYPES };
