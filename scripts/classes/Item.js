import domUtils from '../domUtils.js';
import pubSub from './PubSub.js';

export default class Item {
  constructor(itemId, itemName, locationId) {
    this.itemId = itemId;
    this.name = itemName;
    this.locationId = locationId;
    this.img = document.createElement('img');
    this.img.title = this.name;

    this.addGreyedOutImg();
  }

  addGreyedOutImg() {
    this.img.src = `assets/${this.itemId}-bw_32x32.png`;
    domUtils.addListener.once(this.img, 'click', this.addImg.bind(this));
  }

  addImg() {
    pubSub.publish('item-acquired', this.itemId, this.name, this.locationId);
    this.img.src = `assets/${this.itemId}_32x32.png`;
    domUtils.addListener(this.img, 'click', this.remove.bind(this));
  }

  remove() {
    this.img.remove();
    pubSub.publish(`${this.itemId}-item-removed`, this.locationId);
    pubSub.publish('item-removed', this.itemId, this.name, this.locationId);
  }

  el() {
    return this.img;
  }
}
