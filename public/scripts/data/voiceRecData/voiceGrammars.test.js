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
const connectorIds = ['item', 'found', 'peek', 'at', 'remove', 'last'];

test('command grammar transitions can be resolved without throwing', () => {
    assert.doesNotThrow(() => commandGrammar.transitions);
});

test('wake grammar contributes "hey" and "navi" as separate words, each with a non-empty pronunciation', () => {
    const wakeWords = new Map(wakeGrammar.words);

    assert.strictEqual(wakeWords.size, 2);
    assert.notStrictEqual(wakeWords.get('hey'), '');
    assert.notStrictEqual(wakeWords.get('navi'), '');
});

test('"item" vertex has edges to "found", "peek", and "remove"', () => {
    const itemVertex = commandGrammar.getVertex('item');
    const destinations = itemVertex.edges.map((edge) => edge.to);

    assert.ok(destinations.includes('found'));
    assert.ok(destinations.includes('peek'));
    assert.ok(destinations.includes('remove'));
});

test('"remove" vertex has an edge to "last"', () => {
    const removeVertex = commandGrammar.getVertex('remove');
    const destinations = removeVertex.edges.map((edge) => edge.to);

    assert.deepStrictEqual(destinations, ['last']);
});

test('"last" vertex has an edge to "end"', () => {
    const lastVertex = commandGrammar.getVertex('last');
    const destinations = lastVertex.edges.map((edge) => edge.to);

    assert.deepStrictEqual(destinations, ['end']);
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
    const expectedEdgeCount = 5
        + itemAndSongIds.length
        + itemAndSongIds.length
        + itemAndSongIds.length
        + locationIds.length
        + locationIds.length;

    assert.strictEqual(numStates, expectedVertexCount);
    assert.strictEqual(transitions.length, expectedEdgeCount);
});

test('no id collisions between wake words, connector words, and item/song/location vocab', () => {
    const wakeIds = wakeGrammar.words.map(([id]) => id);
    const allVocabIds = [...itemAndSongIds, ...locationIds];

    for(const connectorId of connectorIds) {
        assert.ok(
            !allVocabIds.includes(connectorId),
            `Connector word "${connectorId}" collides with a vocabulary id`
        );
    }

    for(const wakeId of wakeIds) {
        assert.ok(
            !allVocabIds.includes(wakeId) && !connectorIds.includes(wakeId),
            `Wake word "${wakeId}" collides with a vocabulary or connector word id`
        );
    }
});

test('every spoken word referenced by the command grammar has a non-empty pronunciation in the merged word list', () => {
    const mergedWords = new Map([...wakeGrammar.words, ...commandGrammar.words]);

    const referencedWords = new Set(
        commandGrammar.transitions.transitions.map((transition) => transition.word),
    );

    for(const word of referencedWords) {
        assert.ok(mergedWords.has(word), `Word "${word}" is not present in the merged word list`);
        assert.notStrictEqual(mergedWords.get(word), '', `Word "${word}" has an empty pronunciation`);
    }
});
