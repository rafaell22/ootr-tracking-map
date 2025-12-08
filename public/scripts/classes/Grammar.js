// @ts-check
'use strict'

import DirectedGraph from './DirectedGraph.js';

export default class Grammar extends DirectedGraph {
    get words() {
        const words = [];
        for(const vertexKey in this.adjacencyList) {
            if(vertexKey !== 'end') {
                const vertex = this.getVertex(vertexKey);
                words.push([ vertexKey, vertex.attributes.pronunciation ]);
            }
        }

        return words;
    }

    get transitions() {
        const vertexes = Object.keys(this.adjacencyList);
        return { 
            numStates: vertexes.length, 
            start: 0, 
            end: 0, 
            transitions: vertexes.reduce((acc, vertexKey) => {
                const vertex = this.adjacencyList[vertexKey];
                vertex.edges.forEach((edge) => {
                    const fromIndex = vertexes.findIndex((value) => value === edge.from);
                    const toIndex = vertexes.findIndex((value) => value === edge.to);

                    if(fromIndex === -1) {
                        throw new Error(`Missing vertex ${edge.from}`);
                    }

                    if(toIndex === -1) {
                        throw new Error(`Missing vertex ${edge.to}`);
                    }

                    acc.push({
                        from: fromIndex,
                        to: toIndex,
                        word: vertexKey === 'end' ? '' : vertexKey,
                    });
                });

                return acc;
            }, [])
        };
    }
}
