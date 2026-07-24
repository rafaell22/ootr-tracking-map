// @ts-check
'use strict'

import Grammar from '../../classes/Grammar.js';

/**
 * Wake-word vocabulary only. The wake phrase is spotted via PocketSphinx's
 * keyword-spotting (KWS) search (see `recognizerWorker.js`'s
 * `addKeywordToRecognizer`), not an FSG, so this grammar only needs to
 * contribute dictionary words — it deliberately has no edges/`end` vertex.
 */
const wakeGrammar = new Grammar();

wakeGrammar.addVertex('hey', { pronunciation: 'HH EY' });
wakeGrammar.addVertex('navi', { pronunciation: 'N AA V IY' });

export default wakeGrammar;
