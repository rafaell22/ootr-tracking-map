// @ts-check
'use strict'

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { parseCommandHyp } from './voiceCommandParser.js';
import items from './data/voiceRecData/items.js';
import songs from './data/voiceRecData/songs.js';
import locations from './data/voiceRecData/locations.js';

const [firstItem] = items;
const [firstSong] = songs;
const [firstLocation] = locations;
const hyphenatedItem = items.find((item) => item.id.includes('-'));

test('parses a valid "found" phrase', () => {
    const hyp = `item found ${firstItem.id} at ${firstLocation.id}`;

    assert.deepStrictEqual(parseCommandHyp(hyp), {
        intent: 'found',
        itemId: firstItem.id,
        locationId: firstLocation.id,
    });
});

test('parses a valid "peek" phrase', () => {
    const hyp = `item peek ${firstSong.id} at ${firstLocation.id}`;

    assert.deepStrictEqual(parseCommandHyp(hyp), {
        intent: 'peek',
        itemId: firstSong.id,
        locationId: firstLocation.id,
    });
});

test('rejects a truncated phrase missing trailing tokens', () => {
    assert.strictEqual(parseCommandHyp(`item found ${firstItem.id} at`), null);
    assert.strictEqual(parseCommandHyp(`item found ${firstItem.id}`), null);
});

test('rejects an empty or blank hyp', () => {
    assert.strictEqual(parseCommandHyp(''), null);
    assert.strictEqual(parseCommandHyp('   '), null);
});

test('rejects a phrase with an unrecognized token in an id position', () => {
    assert.strictEqual(parseCommandHyp(`item found not-a-real-item at ${firstLocation.id}`), null);
    assert.strictEqual(parseCommandHyp(`item found ${firstItem.id} at not-a-real-location`), null);
});

test('a hyphenated item id round-trips correctly as a single token', () => {
    assert.ok(hyphenatedItem, 'expected at least one hyphenated item id in the vocab');

    const hyp = `item found ${hyphenatedItem.id} at ${firstLocation.id}`;

    assert.deepStrictEqual(parseCommandHyp(hyp), {
        intent: 'found',
        itemId: hyphenatedItem.id,
        locationId: firstLocation.id,
    });
});
