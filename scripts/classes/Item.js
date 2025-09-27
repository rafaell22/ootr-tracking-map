import domUtils from '../domUtils.js';
import pubSub from './PubSub.js';

export default class Item {
  constructor(src, itemName) {
    this.src = src;
    this.name = itemName;
    this.img = document.createElement('img');
    this.img.title = this.name;

    this.addGreyedOutImg();
  }

  addGreyedOutImg() {
    this.img.src = this.src.replace('_32x32.png', '-bw_32x32.png');
    domUtils.addListener.once(this.img, 'click', this.addImg.bind(this));
  }

  addImg() {
    pubSub.publish('item-acquired', this.src.replace(/^.*\//,''), this.name);
    this.img.src = this.src;
    domUtils.addListener(this.img, 'click', this.remove.bind(this));
  }

  remove() {
    this.img.remove();
    pubSub.publish(`${this.src.replace('_32x32.png', '')}-item-removed`);
    pubSub.publish('item-removed', this.src.replace(/^.*\//,''), this.name);
  }

  el() {
    return this.img;
  }
}
