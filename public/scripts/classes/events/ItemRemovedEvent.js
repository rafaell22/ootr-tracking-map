export default class ItemRemovedEvent {
  constructor(buttonId, itemId, itemName, locationId) {
    this.buttonId = buttonId;
    this.itemId = itemId;
    this.itemName = itemName;
    this.locationId = locationId;
  }
}
