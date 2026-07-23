// @ts-check
'use strict'

import Grammar from '../../classes/Grammar.js';

const wakeGrammar = new Grammar();

wakeGrammar.addVertex('hey navi', { pronunciation: 'HH EY N AA V IY' });
wakeGrammar.addVertex('end', { pronunciation: '' });

wakeGrammar.addEdge('hey navi', 'end');

export default wakeGrammar;
