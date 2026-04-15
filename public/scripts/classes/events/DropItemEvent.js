export default class DropItemEvent {
  constructor(itemId, dropTarget) {
    this.itemId = itemId;
    this.dropTarget = dropTarget;
  }
}
