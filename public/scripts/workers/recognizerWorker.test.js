// @ts-check
'use strict'

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

import wakeGrammar from '../data/voiceRecData/wakeGrammar.js';

const workerSourcePath = fileURLToPath(new URL('./recognizerWorker.js', import.meta.url));
const workerSource = fs.readFileSync(workerSourcePath, 'utf8');

/**
 * `recognizerWorker.js` is a classic (non-module) Worker script: it can't
 * `export` its internal helpers. To test its pure logic against the REAL
 * source (per project testing conventions — no reimplementing logic in
 * tests) without needing a browser Worker, run the real source in an
 * isolated vm context that stands in for the Worker global scope. Top-level
 * `function` declarations become properties of that context's global object,
 * so they're directly callable afterwards; top-level `let`/`const` bindings
 * are not (matching how a real Worker never exposes its internal state
 * either) — this suite only exercises the exposed pure functions plus the
 * inbound message dispatch shape.
 *
 * @returns {{
 *   sandbox: Record<string, any>,
 *   postedMessages: Array<{ eventType: string, eventData?: any }>,
 *   dispatchMessage: (message: { eventType: string, data?: any }) => void,
 * }}
 */
function loadWorkerSandbox() {
    const postedMessages = [];
    let capturedMessageHandler;

    const sandbox = { console };
    sandbox.self = sandbox;
    sandbox.self.postMessage = (message) => postedMessages.push(message);
    sandbox.self.addEventListener = (type, handler) => {
        if(type === 'message') {
            capturedMessageHandler = handler;
        }
    };

    vm.createContext(sandbox);
    vm.runInContext(workerSource, sandbox, { filename: workerSourcePath });

    return {
        sandbox,
        postedMessages,
        dispatchMessage: (message) => capturedMessageHandler({ data: message }),
    };
}

/**
 * `mergedVocabulary` runs inside the vm sandbox realm, so the array it
 * returns is a sandbox-realm `Array` even though its individual word tuples
 * are the same (outer-realm) references passed in. `Array.from` rebuilds a
 * plain outer-realm array so `assert.deepStrictEqual` (which also checks
 * prototype identity) can compare it against an outer-realm literal.
 * @param {any} sandboxArray
 */
function toOuterRealmArray(sandboxArray) {
    return Array.from(sandboxArray);
}

test('mergedVocabulary concatenates words from every grammar when there are no id collisions', () => {
    const { sandbox } = loadWorkerSandbox();
    const grammarA = { words: [['hello', 'HH AH L OW'], ['world', 'W ER L D']] };
    const grammarB = { words: [['goodbye', 'G UH D B AY']] };

    const merged = toOuterRealmArray(sandbox.mergedVocabulary(grammarA, grammarB));

    assert.deepStrictEqual(merged, [
        ['hello', 'HH AH L OW'],
        ['world', 'W ER L D'],
        ['goodbye', 'G UH D B AY'],
    ]);
});

test('mergedVocabulary dedupes by id, keeping the first occurrence', () => {
    const { sandbox } = loadWorkerSandbox();
    const grammarA = { words: [['at', 'AE T']] };
    const grammarB = { words: [['at', 'DIFFERENT PRONUNCIATION'], ['end', '']] };

    const merged = toOuterRealmArray(sandbox.mergedVocabulary(grammarA, grammarB));

    assert.deepStrictEqual(merged, [
        ['at', 'AE T'],
        ['end', ''],
    ]);
});

test('mergedVocabulary returns an empty list for no grammars', () => {
    const { sandbox } = loadWorkerSandbox();

    assert.deepStrictEqual(toOuterRealmArray(sandbox.mergedVocabulary()), []);
});

test('isWakePhrase matches the real wake grammar phrase exactly', () => {
    const { sandbox } = loadWorkerSandbox();
    const wakePhrase = wakeGrammar.words.map(([id]) => id).join(' ');

    assert.strictEqual(sandbox.isWakePhrase(wakePhrase), true);
});

test('isWakePhrase trims surrounding whitespace before comparing', () => {
    const { sandbox } = loadWorkerSandbox();
    const wakePhrase = wakeGrammar.words.map(([id]) => id).join(' ');

    assert.strictEqual(sandbox.isWakePhrase(`  ${wakePhrase}  `), true);
});

test('isWakePhrase rejects anything other than the wake phrase', () => {
    const { sandbox } = loadWorkerSandbox();

    assert.strictEqual(sandbox.isWakePhrase(''), false);
    assert.strictEqual(sandbox.isWakePhrase('navi'), false);
    assert.strictEqual(sandbox.isWakePhrase('item found bow at deku tree'), false);
});

test('isBlankHyp is true for empty or whitespace-only hyps', () => {
    const { sandbox } = loadWorkerSandbox();

    assert.strictEqual(sandbox.isBlankHyp(''), true);
    assert.strictEqual(sandbox.isBlankHyp('   '), true);
});

test('isBlankHyp is false once a hyp has non-whitespace content', () => {
    const { sandbox } = loadWorkerSandbox();

    assert.strictEqual(sandbox.isBlankHyp('item found bow at deku tree'), false);
});

test('START_RECORDING/STOP_RECORDING messages are inert (no message posted for them)', () => {
    const { postedMessages, dispatchMessage } = loadWorkerSandbox();

    dispatchMessage({ eventType: 'START_RECORDING' });
    dispatchMessage({ eventType: 'STOP_RECORDING' });

    assert.deepStrictEqual(postedMessages, []);
});

test('an unrecognized inbound event type still reports an ERROR', () => {
    const { postedMessages, dispatchMessage } = loadWorkerSandbox();

    dispatchMessage({ eventType: 'SOME_UNKNOWN_EVENT' });

    assert.strictEqual(postedMessages.length, 1);
    assert.strictEqual(postedMessages[0].eventType, 'ERROR');
});

test('PROCESS messages received before BEGIN_SESSION are ignored rather than throwing', () => {
    const { postedMessages, dispatchMessage } = loadWorkerSandbox();

    assert.doesNotThrow(() => dispatchMessage({ eventType: 'PROCESS', data: new Int16Array(4000) }));
    assert.deepStrictEqual(postedMessages, []);
});
