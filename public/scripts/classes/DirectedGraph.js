// @ts-check
'use strict'

import Edge from './Edge.js';
import Vertex from './Vertex.js';

export default class DirectedGraph {
    /**
     * @type {string[]|null}
     */
    #topologicalSorted = null;
    constructor() {
        this.adjacencyList = {};
    }

    /**
     * @param {string} vertex - id or unique name for the vertex
        * @param {object} attributes
     */
    addVertex(vertex, attributes) {
        this.adjacencyList[vertex] = new Vertex(vertex, attributes);
        this.#topologicalSorted = null;
    }

    /**
     * @param {string} vertex1
     * @param {string} vertex2
     * @param {object} [edgeAttributes]
     */
    addEdge(vertex1, vertex2, edgeAttributes) {
        if(!this.adjacencyList[vertex1]) {
            throw new Error(`Origin ${vertex1} is undefined! Can't create an edge to ${vertex2} there!`);
        }

        if(!this.adjacencyList[vertex2]) {
            throw new Error(`Destination ${vertex2} is undefined! Can't create an edge from ${vertex1}!`);
        }

        this.adjacencyList[vertex1].addEdge(new Edge(vertex1, vertex2, edgeAttributes));
        this.#topologicalSorted = null;
    }

    printGraph() {
        for(const vertex in this.adjacencyList) {
            console.log(`${vertex} -> ${this.adjacencyList[vertex].edges.map(
                /** @param {Edge} edge */
                edge => edge.to
            ).join(' ')}`);
        }
    }

    /**
     * @param {string} vertex
     */
    getVertex(vertex) {
        return this.adjacencyList[vertex];
    }

    /**
     * @param {string} vertex
     */
    has(vertex) {
        return (this.adjacencyList[vertex] ? true : false);
    }

    /**
     * @param {string} vertex
     * @param {object} visited - array of visited vertexes
     * @param {object} recStack - stack of vertexesbeing visited
     */
    #isCyclicUtil(vertex, visited, recStack) {
        if(recStack[vertex]) {
            return true;
        }

        if(visited[vertex]) {
            return false;
        }

        visited[vertex] = true;

        recStack[vertex] = true;

        const children = this.adjacencyList[vertex].edges;
        for(const child of children) {
            if(this.#isCyclicUtil(child.to, visited, recStack)) {
                return true;
            }
        }

        recStack[vertex] = false;
        return false;
    }

    isCyclic() {
        const visited = {};
        const recStack = {};

        for(const vertex in this.adjacencyList) {
            visited[vertex] = false;
            recStack[vertex] = false;
        }

        for(const vertex in this.adjacencyList) {
            if(this.#isCyclicUtil(vertex, visited, recStack)) {
                return true;
            }
        }

        return false;
    }

    /**
     * @param {string} vertex
     * @param {object} visited
     * @param {string[]} stack
     */
    #topologicalSortUtil(vertex, visited, stack) {
        // Mark the current node as visited.
        visited[vertex] = true;

        for(const edge of this.adjacencyList[vertex].edges) {
            if(!visited[edge.to]){
                this.#topologicalSortUtil(edge.to, visited, stack)
            }
        }

        // Push current vertex to stack
        // which stores result
        stack.push(vertex);
    }

    topologicalSort() {
        if(this.#topologicalSorted) {
            return this.#topologicalSorted;
        }
        let stack = [];

        // Mark all the vertices as not visited
        let visited = {};
        for(const vertex in this.adjacencyList) {
            visited[vertex] = false;
        }

        for(const vertex in this.adjacencyList) {
            if (visited[vertex] === false){
                this.#topologicalSortUtil(vertex, visited, stack);
            }
        }
        
        this.#topologicalSorted = stack;
        return stack;
    }
}
