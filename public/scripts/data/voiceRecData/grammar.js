import items from './items.js';
import songs from './songs.js';
import always from './always.js';
import Grammar from '/scripts/classes/Grammar.js';

const grammar = [{
  id: 'always',
  pronunciation: 'AO L W EY Z',
  from: null,
  to: always.map((w) => w.id),
}];

const dead = {
  id: 'dead',
  pronunciation: 'D EH D',
  to: ['end'],
};
grammar.push(dead);

const end = {
  id: 'end',
  pronunciation: '',
  to: [],
};
grammar.push(end);

[
  { id: 'one',
    pronunciation: 'W AH N',
    to: ['items', 'dead'],
  },
  {
    id: 'two_items',
    pronunciation: 'T UW',
    to: ['items', 'dead'],
  },
  {
    id: 'two_songs',
    pronunciation: 'T UW',
    to: ['songs', 'dead']
  },
].forEach(word => {
  word.to = word.to.reduce((to, w) => {
    return to.concat(getTo(w));
  }, [])
  grammar.push(word);
});

items.forEach((item) => grammar.push(item));
songs.forEach((song) => grammar.push(song));

always.forEach(a => {
  const g = {
    id: a.id,
    pronunciation: a.pronunciation,
  };

  if(typeof a.to === 'string') {
    g.to = getTo(a.to);
  } else {
    g.to = [];
    for(const to of a.to) {
      g.to = g.to.concat(getTo(to));

      g.to.push('dead')
    }
  }

  grammar.push(g);
})

function getTo(to) {
  if(to === 'items') {
    return items.map(i => i.id);
  }

  if(to === 'songs') {
    return songs.map(s => s.id);
  }

  return [to];
}

const graph = new Grammar();
addVertexes();
addEdges();

function addVertexes() {
  grammar.forEach((word) => {
    graph.addVertex(word.id, {
      pronunciation: word.pronunciation,
    });
  });
}

function addEdges() {
  grammar.forEach((word) => {
    if(word.to) {
      if(typeof word.to === 'string') {
        graph.addEdge(word.id, word.to);
        return;
      }

      word.to.forEach((to) => {
        graph.addEdge(word.id, to, {
          pronunciation: word.pronunciation,
        });
      });
    }
  });
}

export default graph;
