import Point from '../Point.js';

export default class ShowSelectItemsEvent {
  /**
    * @param {string} anchorId
    * @param {Point} location
    */
  constructor(anchorId, location) {
    this.anchorId = anchorId;
    this.location = location;
  }
}
