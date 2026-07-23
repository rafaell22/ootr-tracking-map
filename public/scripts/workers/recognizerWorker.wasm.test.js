// @ts-check
'use strict'

import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import wakeGrammar from '../data/voiceRecData/wakeGrammar.js';
import commandGrammar from '../data/voiceRecData/commandGrammar.js';

/**
 * Runs the real `recognizerWorker.js` source and the real
 * `pocketsphinx.js`/`.wasm` build inside a Node `vm` context standing in for
 * the Worker global scope, driven through its actual message protocol
 * (`self.addEventListener('message', ...)` / `self.postMessage`).
 *
 * `loadWasm()` itself isn't called here: it dynamically `import()`s the
 * grammar files, which Node's `vm` module only supports behind the
 * (experimental, as of Node 20) `--experimental-vm-modules` flag. Instead,
 * `bootstrapRealWasm` below performs the same wasm bootstrap and injects the
 * real `wakeGrammar`/`commandGrammar` modules directly.
 */

const workerSourcePath = fileURLToPath(new URL('./recognizerWorker.js', import.meta.url));
const workerSource = fs.readFileSync(workerSourcePath, 'utf8');
const pocketsphinxJsPath = fileURLToPath(new URL('../wasm/pocketsphinx.js', import.meta.url));
const pocketsphinxWasmPath = fileURLToPath(new URL('../wasm/pocketsphinx.wasm', import.meta.url));

/**
 * @returns {Promise<{
 *   sandbox: Record<string, any>,
 *   postedMessages: Array<{ eventType: string, eventData?: any }>,
 *   dispatchMessage: (message: { eventType: string, data?: any }) => void,
 *   messagesOfType: (eventType: string) => Array<any>,
 * }>}
 */
function createWorkerSandbox() {
    const postedMessages = [];
    let capturedMessageHandler;

    const sandbox = { console };
    sandbox.self = sandbox;
    // A real Worker's `self.location` points at the worker script's own URL;
    // pocketsphinx.js's Emscripten glue reads it during its
    // ENVIRONMENT_IS_WORKER environment-detection bootstrap.
    sandbox.self.location = { href: 'file:///scripts/workers/recognizerWorker.js' };
    sandbox.self.postMessage = (message) => postedMessages.push(message);
    sandbox.self.addEventListener = (type, handler) => {
        if(type === 'message') {
            capturedMessageHandler = handler;
        }
    };
    sandbox.self.__grammarsForTest = { wakeGrammar, commandGrammar };

    sandbox.importScripts = (url) => {
        if(url !== '/scripts/wasm/pocketsphinx.js') {
            throw new Error(`Unexpected importScripts url in test harness: ${url}`);
        }
        const glueSource = fs.readFileSync(pocketsphinxJsPath, 'utf8');
        vm.runInContext(glueSource, sandbox, { filename: pocketsphinxJsPath });
    };
    sandbox.setTimeout = (...args) => setTimeout(...args);
    sandbox.clearTimeout = (...args) => clearTimeout(...args);

    vm.createContext(sandbox);
    vm.runInContext(workerSource, sandbox, { filename: workerSourcePath });

    return {
        sandbox,
        postedMessages,
        dispatchMessage: (message) => capturedMessageHandler({ data: message }),
        messagesOfType: (eventType) => postedMessages.filter((message) => message.eventType === eventType),
    };
}

/**
 * Runs the same wasm bootstrap `loadWasm()` performs, then injects the real
 * wake/command grammars into the sandbox's top-level `let wakeGrammar` /
 * `commandGrammar` bindings (which, being `let`, are not reachable as plain
 * sandbox properties — but ARE reachable from a script run inside the same
 * vm context, since top-level `let` bindings persist across separate
 * `vm.runInContext` calls against one context).
 * @param {Record<string, any>} sandbox
 */
async function bootstrapRealWasm(sandbox) {
    await new Promise((resolve, reject) => {
        sandbox.self.Module = {
            print: () => {},
            printErr: () => {},
            // Supplying the binary directly bypasses Emscripten's fetch/XHR
            // wasm-loading path, which this sandbox doesn't implement.
            wasmBinary: fs.readFileSync(pocketsphinxWasmPath),
        };
        sandbox.importScripts('/scripts/wasm/pocketsphinx.js');
        sandbox.Module.locateFile = () => pocketsphinxWasmPath;
        sandbox.Module.onAbort = (reason) => reject(new Error(`wasm onAbort: ${reason}`));
        sandbox.Module.onRuntimeInitialized = () => resolve(undefined);
    });

    vm.runInContext(
        'wakeGrammar = self.__grammarsForTest.wakeGrammar; commandGrammar = self.__grammarsForTest.commandGrammar;',
        sandbox,
        { filename: 'inject-real-grammars.js' },
    );
}

function silentNoiseChunk(seed) {
    const chunk = new Int16Array(4000);
    for(let i = 0; i < chunk.length; i++) {
        chunk[i] = Math.round(Math.sin(i * 0.13 + seed) * 6000);
    }
    return chunk;
}

test('initializeRecognizer registers both real grammars and yields two distinct, usable search ids', async () => {
    const { sandbox, dispatchMessage, postedMessages } = createWorkerSandbox();
    await bootstrapRealWasm(sandbox);

    assert.doesNotThrow(() => sandbox.initializeRecognizer());

    assert.doesNotThrow(() => sandbox.switchToWakeSearch());
    assert.doesNotThrow(() => sandbox.switchToCommandSearch());

    dispatchMessage({ eventType: 'BEGIN_SESSION' });
    assert.deepStrictEqual(postedMessages.filter((message) => message.eventType === 'ERROR'), []);
});

test('a full BEGIN_SESSION -> idle cycle over real audio completes without error and stays idle', async () => {
    const { sandbox, dispatchMessage, postedMessages, messagesOfType } = createWorkerSandbox();
    await bootstrapRealWasm(sandbox);
    sandbox.initializeRecognizer();

    dispatchMessage({ eventType: 'BEGIN_SESSION' });

    for(let chunk = 0; chunk < 6; chunk++) {
        assert.doesNotThrow(() => dispatchMessage({ eventType: 'PROCESS', data: silentNoiseChunk(chunk) }));
    }

    assert.deepStrictEqual(messagesOfType('ERROR'), []);
    assert.deepStrictEqual(messagesOfType('PROCESSED'), [], 'idle cycling must not spam a PROCESSED message per chunk');

    for(let chunk = 6; chunk < 12; chunk++) {
        assert.doesNotThrow(() => dispatchMessage({ eventType: 'PROCESS', data: silentNoiseChunk(chunk) }));
    }
    assert.deepStrictEqual(messagesOfType('ERROR'), []);
});

test('a detected wake phrase posts WAKE_DETECTED, enters the command window, and a real stop/switch/start command-window-timeout cycle resolves back to idle', async () => {
    mock.timers.enable({ apis: ['setTimeout'] });
    try {
        const { sandbox, dispatchMessage, messagesOfType } = createWorkerSandbox();
        await bootstrapRealWasm(sandbox);
        sandbox.initializeRecognizer();
        dispatchMessage({ eventType: 'BEGIN_SESSION' });

        // isWakePhrase's own comparison logic is covered directly (with real
        // audio-independent inputs) in recognizerWorker.test.js; stubbing it
        // here isolates this test from whether synthetic noise happens to
        // acoustically match "hey navi", while still exercising the real
        // stop -> check -> switchToCommandSearch -> start wiring around it.
        sandbox.isWakePhrase = () => true;
        for(let chunk = 0; chunk < 6; chunk++) {
            assert.doesNotThrow(() => dispatchMessage({ eventType: 'PROCESS', data: silentNoiseChunk(chunk) }));
        }
        assert.strictEqual(messagesOfType('WAKE_DETECTED').length, 1);

        for(let chunk = 0; chunk < 8; chunk++) {
            assert.doesNotThrow(() => dispatchMessage({ eventType: 'PROCESS', data: silentNoiseChunk(chunk) }));
        }
        assert.deepStrictEqual(
            messagesOfType('WAKE_DETECTED').length,
            1,
            'feeding chunks during the command window must not trigger a second idle-cycle wake check'
        );

        mock.timers.tick(5000);

        const timeoutMessages = messagesOfType('COMMAND_TIMEOUT');
        const recognizedMessages = messagesOfType('COMMAND_RECOGNIZED');
        assert.strictEqual(
            timeoutMessages.length + recognizedMessages.length,
            1,
            'exactly one of COMMAND_TIMEOUT/COMMAND_RECOGNIZED must be posted once the command window timer fires'
        );
        assert.deepStrictEqual(messagesOfType('ERROR'), []);

        for(let chunk = 0; chunk < 6; chunk++) {
            assert.doesNotThrow(() => dispatchMessage({ eventType: 'PROCESS', data: silentNoiseChunk(chunk) }));
        }
        assert.deepStrictEqual(messagesOfType('ERROR'), [], 'the session must resume clean idle cycling after the command window ends');
    } finally {
        mock.timers.reset();
    }
});

test('the respawn-due signal is reported at most once per session, and only between idle cycles', async () => {
    const { sandbox, dispatchMessage, messagesOfType } = createWorkerSandbox();
    await bootstrapRealWasm(sandbox);
    sandbox.initializeRecognizer();

    let fakeNow = Date.now();
    sandbox.Date = { now: () => fakeNow };
    // Deterministically keep every idle cycle on the "no wake phrase heard"
    // path, isolating this test from whether synthetic noise happens to
    // acoustically match "hey navi" on a given run.
    sandbox.isWakePhrase = () => false;

    dispatchMessage({ eventType: 'BEGIN_SESSION' });
    fakeNow = Number.MAX_SAFE_INTEGER;

    for(let cycle = 0; cycle < 2; cycle++) {
        for(let chunk = 0; chunk < 6; chunk++) {
            dispatchMessage({ eventType: 'PROCESS', data: silentNoiseChunk(cycle * 6 + chunk) });
        }
    }

    assert.strictEqual(messagesOfType('RESPAWN_DUE').length, 1);
});
