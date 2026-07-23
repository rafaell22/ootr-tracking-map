// @ts-check
'use strict'

import items from './data/voiceRecData/items.js';
import songs from './data/voiceRecData/songs.js';
import locations from './data/voiceRecData/locations.js';

const itemIds = new Set([...items, ...songs].map((word) => word.id));
const locationIds = new Set(locations.map((location) => location.id));

const INTENTS = {
    FOUND: 'found',
    PEEK: 'peek',
};

/**
 * Parses a raw recognized command phrase (the `hyp` string produced by the
 * command grammar's FSG recognizer) into a structured command.
 *
 * The grammar only ever produces a closed-vocabulary, space-separated token
 * sequence of the shape `item <found|peek> <itemId> at <locationId>`, but the
 * ~5-second command window can be forced to stop mid-utterance, so `hyp` may
 * also be a truncated/partial sequence. Anything that isn't exactly that
 * 5-token shape, with both ids present in the known vocab, is treated as an
 * invalid recognition.
 * @param {string} hyp
 * @returns {{ intent: 'found' | 'peek', itemId: string, locationId: string } | null}
 */
function parseCommandHyp(hyp) {
    const tokens = hyp.trim().split(/\s+/).filter(Boolean);

    if(tokens.length !== 5) {
        return null;
    }

    const [itemToken, intentToken, itemId, atToken, locationId] = tokens;

    if(itemToken !== 'item') {
        return null;
    }
    if(intentToken !== INTENTS.FOUND && intentToken !== INTENTS.PEEK) {
        return null;
    }
    if(atToken !== 'at') {
        return null;
    }
    if(!itemIds.has(itemId)) {
        return null;
    }
    if(!locationIds.has(locationId)) {
        return null;
    }

    return { intent: intentToken, itemId, locationId };
}

export { parseCommandHyp };
