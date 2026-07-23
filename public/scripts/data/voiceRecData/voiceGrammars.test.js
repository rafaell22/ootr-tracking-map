// @ts-check
'use strict'

import { test } from 'node:test';
import assert from 'node:assert/strict';

import wakeGrammar from './wakeGrammar.js';
import commandGrammar from './commandGrammar.js';
import items from './items.js';
import songs from './songs.js';
import locations from './locations.js';

const itemAndSongIds = [...items, ...songs].map((word) => word.id);
const locationIds = locations.map((location) => location.id);
const connectorIds = ['item', 'found', 'peek', 'at'];

test('wake grammar transitions can be resolved without throwing', () => {
    assert.doesNotThrow(() => wakeGrammar.transitions);
});

test('command grammar transitions can be resolved without throwing', () => {
    assert.doesNotThrow(() => commandGrammar.transitions);
});

test('wake grammar starts at index 0 and ends at the "end" vertex index', () => {
    const { start, end, numStates } = wakeGrammar.transitions;

    assert.strictEqual(start, 0);
    assert.strictEqual(numStates, 2);
    assert.strictEqual(end, 1);
});

test('wake grammar has exactly one path from start to end', () => {
    const { transitions, start, end } = wakeGrammar.transitions;

    const pathsFromStart = transitions.filter((transition) => transition.from === start);
    assert.strictEqual(pathsFromStart.length, 1);
    assert.strictEqual(pathsFromStart[0].to, end);
});

test('"item" vertex has edges to both "found" and "peek"', () => {
    const itemVertex = commandGrammar.getVertex('item');
    const destinations = itemVertex.edges.map((edge) => edge.to);

    assert.ok(destinations.includes('found'));
    assert.ok(destinations.includes('peek'));
});

test('every item/song vertex has an edge to "at"', () => {
    for(const id of itemAndSongIds) {
        const vertex = commandGrammar.getVertex(id);
        const destinations = vertex.edges.map((edge) => edge.to);

        assert.deepStrictEqual(destinations, ['at']);
    }
});

test('every location vertex has an edge to "end"', () => {
    for(const id of locationIds) {
        const vertex = commandGrammar.getVertex(id);
        const destinations = vertex.edges.map((edge) => edge.to);

        assert.deepStrictEqual(destinations, ['end']);
    }
});

test('command grammar has the expected vertex and edge counts', () => {
    const { numStates, transitions } = commandGrammar.transitions;

    const expectedVertexCount = connectorIds.length + itemAndSongIds.length + locationIds.length + 1;
    const expectedEdgeCount = 2
        + itemAndSongIds.length
        + itemAndSongIds.length
        + itemAndSongIds.length
        + locationIds.length
        + locationIds.length;

    assert.strictEqual(numStates, expectedVertexCount);
    assert.strictEqual(transitions.length, expectedEdgeCount);
});

test('no id collisions between connector words and item/song/location vocab', () => {
    const allVocabIds = [...itemAndSongIds, ...locationIds];

    for(const connectorId of connectorIds) {
        assert.ok(
            !allVocabIds.includes(connectorId),
            `Connector word "${connectorId}" collides with a vocabulary id`
        );
    }
});

test('every spoken word referenced by either grammar has a non-empty pronunciation in the merged word list', () => {
    const mergedWords = new Map([...wakeGrammar.words, ...commandGrammar.words]);

    const referencedWords = new Set([
        ...wakeGrammar.transitions.transitions.map((transition) => transition.word),
        ...commandGrammar.transitions.transitions.map((transition) => transition.word),
    ]);

    for(const word of referencedWords) {
        assert.ok(mergedWords.has(word), `Word "${word}" is not present in the merged word list`);
        assert.notStrictEqual(mergedWords.get(word), '', `Word "${word}" has an empty pronunciation`);
    }
});
