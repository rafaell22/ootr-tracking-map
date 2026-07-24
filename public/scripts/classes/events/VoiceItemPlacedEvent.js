export default class VoiceItemPlacedEvent {
  constructor(item, itemName, locationId, locationName) {
    this.item = item;
    this.itemName = itemName;
    this.locationId = locationId;
    this.locationName = locationName;
  }
}
