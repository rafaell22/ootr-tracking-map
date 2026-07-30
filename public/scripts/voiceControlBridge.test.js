import test from 'node:test';
import assert from 'node:assert/strict';

const { onVoiceControlToggle, reportVoiceControlFailure } = await import('./voiceControlBridge.js');

test('onVoiceControlToggle forwards to window.electronAPI.onVoiceControlToggle when the bridge is present', () => {
  const registeredCallbacks = [];
  globalThis.window = {
    electronAPI: {
      onVoiceControlToggle: (callback) => registeredCallbacks.push(callback),
    },
  };
  const callback = () => {};

  onVoiceControlToggle(callback);

  assert.deepEqual(registeredCallbacks, [callback]);
});

test('onVoiceControlToggle does not throw when window.electronAPI is unavailable', () => {
  globalThis.window = {};

  assert.doesNotThrow(() => onVoiceControlToggle(() => {}));
});

test('reportVoiceControlFailure forwards to window.electronAPI.reportVoiceControlFailure when the bridge is present', () => {
  let callCount = 0;
  globalThis.window = {
    electronAPI: {
      reportVoiceControlFailure: () => { callCount += 1; },
    },
  };

  reportVoiceControlFailure();

  assert.equal(callCount, 1);
});

test('reportVoiceControlFailure does not throw when window.electronAPI is unavailable', () => {
  globalThis.window = {};

  assert.doesNotThrow(() => reportVoiceControlFailure());
});
