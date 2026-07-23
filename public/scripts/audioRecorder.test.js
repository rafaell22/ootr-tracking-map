import test from 'node:test';
import assert from 'node:assert/strict';

globalThis.window = globalThis;

class FakeWorker {
  constructor(scriptUrl) {
    this.scriptUrl = scriptUrl;
    this.postedMessages = [];
    this.onmessage = null;
  }

  postMessage(message) {
    this.postedMessages.push(message);
  }
}

globalThis.Worker = FakeWorker;

await import('./audioRecorder.js');
const { AudioRecorder } = globalThis;

function createFakeAudioSource() {
  const node = {
    onaudioprocess: null,
    connect() {},
  };
  const context = {
    sampleRate: 44100,
    destination: {},
    createScriptProcessor() {
      return node;
    },
  };
  return {
    context,
    connect() {},
  };
}

function createFakeConsumer() {
  return {
    postedMessages: [],
    postMessage(message) {
      this.postedMessages.push(message);
    },
  };
}

function createFakeAudioProcessEvent() {
  return {
    inputBuffer: {
      getChannelData(channel) {
        return new Float32Array([channel]);
      },
    },
  };
}

function eventTypesSentTo(worker) {
  return worker.postedMessages.map((message) => message.eventType);
}

test('constructor initializes capturing and recording as both off', () => {
  const recorder = new AudioRecorder(createFakeAudioSource());

  assert.equal(recorder.capturing, false);
  assert.equal(recorder.recording, false);
});

test('onAudioProcess does not forward audio to the worker while capturing is off', () => {
  const recorder = new AudioRecorder(createFakeAudioSource());
  recorder.recording = true;

  recorder.onAudioProcess(createFakeAudioProcessEvent());

  assert.deepEqual(eventTypesSentTo(recorder.worker), ['INIT']);
});

test('onAudioProcess forwards audio to the worker once capturing is started, independent of recording', () => {
  const recorder = new AudioRecorder(createFakeAudioSource());

  recorder.startCapturing();
  recorder.onAudioProcess(createFakeAudioProcessEvent());

  assert.deepEqual(eventTypesSentTo(recorder.worker), ['INIT', 'RECORD']);
});

test('startCapturing does not clear the worker buffer', () => {
  const recorder = new AudioRecorder(createFakeAudioSource());

  recorder.startCapturing();

  assert.ok(!eventTypesSentTo(recorder.worker).includes('CLEAR'));
});

test('stopCapturing turns capturing off and clears the worker buffer', () => {
  const recorder = new AudioRecorder(createFakeAudioSource());
  recorder.startCapturing();

  recorder.stopCapturing();

  assert.equal(recorder.capturing, false);
  assert.deepEqual(eventTypesSentTo(recorder.worker), ['INIT', 'CLEAR']);
});

test('start notifies consumers of START_RECORDING and returns true when consumers exist', () => {
  const recorder = new AudioRecorder(createFakeAudioSource());
  const consumer = createFakeConsumer();
  recorder.consumers.push(consumer);

  const result = recorder.start('command-window');

  assert.equal(result, true);
  assert.equal(recorder.recording, true);
  assert.deepEqual(consumer.postedMessages, [
    { eventType: 'START_RECORDING', data: 'command-window' },
  ]);
});

test('start returns false when there are no consumers', () => {
  const recorder = new AudioRecorder(createFakeAudioSource());

  const result = recorder.start();

  assert.equal(result, false);
});

test('stop notifies consumers of STOP_RECORDING and turns recording off', () => {
  const recorder = new AudioRecorder(createFakeAudioSource());
  const consumer = createFakeConsumer();
  recorder.consumers.push(consumer);
  recorder.start();

  recorder.stop();

  assert.equal(recorder.recording, false);
  assert.deepEqual(consumer.postedMessages, [
    { eventType: 'START_RECORDING', data: undefined },
    { eventType: 'STOP_RECORDING' },
  ]);
});

test('stop does not notify consumers when not recording', () => {
  const recorder = new AudioRecorder(createFakeAudioSource());
  const consumer = createFakeConsumer();
  recorder.consumers.push(consumer);

  recorder.stop();

  assert.deepEqual(consumer.postedMessages, []);
});

test('stop never clears the resampler worker buffer, even across repeated utterance-boundary cycles', () => {
  const recorder = new AudioRecorder(createFakeAudioSource());
  recorder.consumers.push(createFakeConsumer());
  recorder.startCapturing();

  recorder.start();
  recorder.stop();
  recorder.start();
  recorder.stop();

  assert.ok(!eventTypesSentTo(recorder.worker).includes('CLEAR'));
});
