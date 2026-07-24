// @ts-check
'use strict'

import Grammar from '../../classes/Grammar.js';
import items from './items.js';
import songs from './songs.js';
import locations from './locations.js';

const commandGrammar = new Grammar();

commandGrammar.addVertex('item', { pronunciation: 'AY T AH M' });
commandGrammar.addVertex('found', { pronunciation: 'F AW N D' });
commandGrammar.addVertex('peek', { pronunciation: 'P IY K' });
commandGrammar.addVertex('at', { pronunciation: 'AE T' });
commandGrammar.addVertex('remove', { pronunciation: 'R IH M UW V' });
commandGrammar.addVertex('last', { pronunciation: 'L AE S T' });
commandGrammar.addVertex('end', { pronunciation: '' });

const itemsAndSongs = [...items, ...songs];

itemsAndSongs.forEach((word) => {
    commandGrammar.addVertex(word.id, { pronunciation: word.pronunciation });
});

locations.forEach((location) => {
    commandGrammar.addVertex(location.id, { pronunciation: location.pronunciation });
});

commandGrammar.addEdge('item', 'found');
commandGrammar.addEdge('item', 'peek');
commandGrammar.addEdge('item', 'remove');
commandGrammar.addEdge('remove', 'last');
commandGrammar.addEdge('last', 'end');

itemsAndSongs.forEach((word) => {
    commandGrammar.addEdge('found', word.id);
    commandGrammar.addEdge('peek', word.id);
    commandGrammar.addEdge(word.id, 'at');
});

locations.forEach((location) => {
    commandGrammar.addEdge('at', location.id);
    commandGrammar.addEdge(location.id, 'end');
});

export default commandGrammar;
