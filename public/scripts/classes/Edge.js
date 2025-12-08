export default class Edge {
    /**
     * @param {string} from
     * @param {string} to
     * @param {object} [attributes]
     */
    constructor(from, to, attributes) {
        this.from = from;
        this.to = to;
        this.attributes = attributes;
    }
}
