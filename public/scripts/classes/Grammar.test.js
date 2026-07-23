// @ts-check
'use strict'

import { test } from 'node:test';
import assert from 'node:assert/strict';

import Grammar from './Grammar.js';

test('transitions.end resolves to the index of the vertex literally named "end", even when it is not inserted first', () => {
    const grammar = new Grammar();
    grammar.addVertex('hello', {});
    grammar.addVertex('world', {});
    grammar.addVertex('end', {});
    grammar.addEdge('hello', 'world');
    grammar.addEdge('world', 'end');

    const { end } = grammar.transitions;

    assert.strictEqual(end, 2);
});

test('transitions throws when the graph has no vertex named "end"', () => {
    const grammar = new Grammar();
    grammar.addVertex('hello', {});
    grammar.addVertex('world', {});
    grammar.addEdge('hello', 'world');

    assert.throws(() => grammar.transitions, /end/);
});
