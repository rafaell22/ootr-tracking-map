export default class ItemFoundEvent {
  constructor(anchorId, itemId, itemName) {
    this.anchorId = anchorId;
    this.itemId = itemId;
    this.itemName = itemName;
  }
}
