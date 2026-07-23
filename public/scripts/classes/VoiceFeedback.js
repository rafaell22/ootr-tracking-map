// @ts-check
import Toast, { TOAST_TYPES } from './Toast.js';
import pubSub from './PubSub.js';

/**
 * UI-layer listener that turns voice-recognition pubSub events into on-screen
 * feedback. Kept separate from `recognizer.js` so the recognition/dispatch
 * plumbing has no direct dependency on `Toast`/the DOM.
 */
export default class VoiceFeedback {
  constructor() {
    pubSub.subscribe('voice-wake-detected', this.onWakeDetected.bind(this));
    pubSub.subscribe('voice-command-result', this.onCommandResult.bind(this));
  }

  onWakeDetected() {
    Toast.flashWakeCue();
  }

  /**
   * @param {{ success: boolean, message: string }} result
   */
  onCommandResult({ success, message }) {
    Toast.show(message, { type: success ? TOAST_TYPES.SUCCESS : TOAST_TYPES.ERROR });
  }
}
