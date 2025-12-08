export default class Vertex {
    constructor(id, attributes) {
        this.id = id;
        this.attributes = attributes;
        this.edges = [];
    }

    addEdge(edge) {
        this.edges.push(edge);
    }
}
