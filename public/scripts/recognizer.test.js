import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis;
globalThis.document = { querySelector: () => null, addEventListener: () => {} };

class FakeWorker {
  constructor(scriptUrl) {
    this.scriptUrl = scriptUrl;
    this.postedMessages = [];
    this.listeners = { message: [], error: [] };
    this.terminated = false;
    FakeWorker.created.push(this);
  }

  postMessage(message) {
    this.postedMessages.push(message);
  }

  addEventListener(type, handler) {
    this.listeners[type].push(handler);
  }

  terminate() {
    this.terminated = true;
  }

  dispatchMessage(message) {
    this.listeners.message.forEach((handler) => handler({ data: message }));
  }

  dispatchError(errorEvent) {
    this.listeners.error.forEach((handler) => handler(errorEvent));
  }
}
FakeWorker.created = [];
globalThis.Worker = FakeWorker;

class FakeAudioRecorder {
  constructor(input) {
    this.input = input;
    this.consumers = [];
    this.startCapturingCallCount = 0;
    this.startCallCount = 0;
    this.stopCallCount = 0;
    this.stopCapturingCallCount = 0;
  }

  startCapturing() {
    this.startCapturingCallCount += 1;
  }

  start() {
    this.startCallCount += 1;
  }

  stop() {
    this.stopCallCount += 1;
  }

  stopCapturing() {
    this.stopCapturingCallCount += 1;
  }
}
globalThis.AudioRecorder = FakeAudioRecorder;

class FakeAudioContext {
  constructor() {
    this.closeCallCount = 0;
    FakeAudioContext.created.push(this);
  }

  createMediaStreamSource(stream) {
    return { stream };
  }

  close() {
    this.closeCallCount += 1;
  }
}
FakeAudioContext.created = [];
globalThis.AudioContext = FakeAudioContext;

function fakeMediaStream() {
  const tracks = [{ stopCallCount: 0, stop() { this.stopCallCount += 1; } }];
  return { tracks, getTracks: () => tracks };
}

let getUserMediaResult;
globalThis.navigator = {
  mediaDevices: {
    getUserMedia: () => getUserMediaResult,
  },
};

const pubSub = (await import('./classes/PubSub.js')).default;
const voiceControlBridge = await import('./voiceControlBridge.js');
const { startVoiceControl, stopVoiceControl } = await import('./recognizer.js');

function resetFakes() {
  FakeWorker.created = [];
  FakeAudioContext.created = [];
  getUserMediaResult = Promise.resolve(fakeMediaStream());
  pubSub.unsubscribeAll('voice-command-result');
}

function latestWorker() {
  return FakeWorker.created[FakeWorker.created.length - 1];
}

function completeBootstrap(worker) {
  worker.dispatchMessage({ eventType: 'LOADED_WASM' });
  worker.dispatchMessage({ eventType: 'INITIALIZED_RECOGNIZER' });
}

test('startVoiceControl creates a worker and requests the WASM module to load', () => {
  resetFakes();

  startVoiceControl();

  const worker = latestWorker();
  assert.deepEqual(worker.postedMessages, [{ eventType: 'LOAD_WASM' }]);
});

test('startVoiceControl begins mic capture once the worker reports it is initialized', async () => {
  resetFakes();

  startVoiceControl();
  const worker = latestWorker();
  completeBootstrap(worker);
  await getUserMediaResult;
  await Promise.resolve();

  assert.deepEqual(
    worker.postedMessages.map((message) => message.eventType),
    ['LOAD_WASM', 'INITIALIZE_RECOGNIZER', 'BEGIN_SESSION'],
  );
});

test('stopVoiceControl terminates the active worker, stops the recorder, mic tracks and AudioContext', async () => {
  resetFakes();

  startVoiceControl();
  const worker = latestWorker();
  completeBootstrap(worker);
  const stream = await getUserMediaResult;
  await Promise.resolve();

  stopVoiceControl();

  assert.equal(worker.terminated, true);
  assert.equal(stream.tracks[0].stopCallCount, 1);
  assert.equal(FakeAudioContext.created[0].closeCallCount, 1);
});

test('stopVoiceControl is a no-op that does not throw when voice control was never started', () => {
  resetFakes();

  assert.doesNotThrow(() => stopVoiceControl());
});

test('a getUserMedia rejection during bootstrap reports failure to the main process and shows an error toast', async () => {
  resetFakes();
  getUserMediaResult = Promise.reject(new Error('Permission denied'));
  let reportedFailureCount = 0;
  globalThis.window.electronAPI = {
    reportVoiceControlFailure: () => { reportedFailureCount += 1; },
  };
  const toastResults = [];
  pubSub.subscribe('voice-command-result', (result) => toastResults.push(result));

  startVoiceControl();
  const worker = latestWorker();
  completeBootstrap(worker);
  await getUserMediaResult.catch(() => {});
  await Promise.resolve();
  await Promise.resolve();

  assert.equal(reportedFailureCount, 1);
  assert.equal(toastResults.length, 1);
  assert.equal(toastResults[0].success, false);
  assert.equal(worker.terminated, true);

  delete globalThis.window.electronAPI;
});

test('a worker ERROR message during lazy init reports failure to the main process and shows an error toast', () => {
  resetFakes();
  let reportedFailureCount = 0;
  globalThis.window.electronAPI = {
    reportVoiceControlFailure: () => { reportedFailureCount += 1; },
  };
  const toastResults = [];
  pubSub.subscribe('voice-command-result', (result) => toastResults.push(result));

  startVoiceControl();
  const worker = latestWorker();
  worker.dispatchMessage({ eventType: 'ERROR', eventData: 'wasm exploded' });

  assert.equal(reportedFailureCount, 1);
  assert.equal(toastResults.length, 1);
  assert.equal(toastResults[0].success, false);
  assert.equal(worker.terminated, true);

  delete globalThis.window.electronAPI;
});

test('a native worker error event during lazy init reports failure to the main process and shows an error toast', () => {
  resetFakes();
  let reportedFailureCount = 0;
  globalThis.window.electronAPI = {
    reportVoiceControlFailure: () => { reportedFailureCount += 1; },
  };
  const toastResults = [];
  pubSub.subscribe('voice-command-result', (result) => toastResults.push(result));

  startVoiceControl();
  const worker = latestWorker();
  worker.dispatchError({ message: 'boom', filename: 'recognizerWorker.js', lineno: 1, colno: 1 });

  assert.equal(reportedFailureCount, 1);
  assert.equal(toastResults.length, 1);
  assert.equal(toastResults[0].success, false);
  assert.equal(worker.terminated, true);

  delete globalThis.window.electronAPI;
});

test('a worker promoted to primary via swapToReplacementWorker still triggers failure handling on error', async () => {
  resetFakes();
  let reportedFailureCount = 0;
  globalThis.window.electronAPI = {
    reportVoiceControlFailure: () => { reportedFailureCount += 1; },
  };
  const toastResults = [];
  pubSub.subscribe('voice-command-result', (result) => toastResults.push(result));

  startVoiceControl();
  const initialWorker = latestWorker();
  completeBootstrap(initialWorker);
  await getUserMediaResult;
  await Promise.resolve();

  initialWorker.dispatchMessage({ eventType: 'RESPAWN_DUE' });
  const replacementWorker = latestWorker();
  completeBootstrap(replacementWorker);

  assert.equal(initialWorker.terminated, true);

  replacementWorker.dispatchError({ message: 'boom', filename: 'recognizerWorker.js', lineno: 1, colno: 1 });

  assert.equal(reportedFailureCount, 1);
  assert.equal(toastResults.length, 1);
  assert.equal(toastResults[0].success, false);
  assert.equal(replacementWorker.terminated, true);

  delete globalThis.window.electronAPI;
});

test('a getUserMedia resolution that arrives after the user unchecked the box quietly releases the mic without a toast', async () => {
  resetFakes();
  const stream = fakeMediaStream();
  getUserMediaResult = Promise.resolve(stream);
  const toastResults = [];
  pubSub.subscribe('voice-command-result', (result) => toastResults.push(result));

  startVoiceControl();
  const worker = latestWorker();
  completeBootstrap(worker);
  stopVoiceControl();
  await Promise.resolve();
  await Promise.resolve();

  assert.equal(toastResults.length, 0);
  assert.equal(stream.tracks[0].stopCallCount, 1);
  assert.equal(worker.terminated, true);
});

test('handleLazyInitFailure only reports and tears down once even if both an ERROR message and a native error event fire for the same worker', () => {
  resetFakes();
  let reportedFailureCount = 0;
  globalThis.window.electronAPI = {
    reportVoiceControlFailure: () => { reportedFailureCount += 1; },
  };
  const toastResults = [];
  pubSub.subscribe('voice-command-result', (result) => toastResults.push(result));

  startVoiceControl();
  const worker = latestWorker();
  worker.dispatchMessage({ eventType: 'ERROR', eventData: 'wasm exploded' });
  worker.dispatchError({ message: 'boom', filename: 'recognizerWorker.js', lineno: 1, colno: 1 });

  assert.equal(reportedFailureCount, 1);
  assert.equal(toastResults.length, 1);

  delete globalThis.window.electronAPI;
});
