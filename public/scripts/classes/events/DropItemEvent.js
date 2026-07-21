export default class DropItemEvent {
  constructor(itemId, dropTarget, name) {
    this.itemId = itemId;
    this.dropTarget = dropTarget;
    this.name = name;
  }
}
