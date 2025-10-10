// @ts-check

import domUtils from '../domUtils.js';
import Point from './Point.js';
import pubSub from './PubSub.js';

export default class SelectItems {
  /**
    * @param {HTMLSelectElement} elSelect
    */
  constructor(elSelect) {
    this.elSelect = elSelect;
    this.idOfCaller = null;

    pubSub.subscribe('hide-select-items', this.hide.bind(this));
    pubSub.subscribe('show-select-items', this.show.bind(this))

    domUtils.addListener(this.elSelect, 'change', this.onSelectItem.bind(this));
  }

  onSelectItem() {
    pubSub.publish('item-selected', this.idOfCaller, this.value(), this.description());
    this.idOfCaller = null;
    pubSub.publish('song-selected', this.value());
    this.hide();
    this.options[this.selectedIndex].selected = false;
    this.options[0].selected = true;
  }

  /**
    * @param {string} id
    * @param {Point} point
    */
  show(id, point) {
    this.idOfCaller = id;
    domUtils.show(this.elSelect);
    this.elSelect.style.left = `${point.x}px`;
    this.elSelect.style.top = `${point.y}px`;
  }

  hide() {
    domUtils.hide(this.elSelect);
  }

  value() {
    return this.elSelect.value;
  }

  description() {
    return this.options[this.selectedIndex].textContent;
  }

  get selectedIndex() {
    return this.elSelect.selectedIndex;
  }

  get options() {
    return this.elSelect.options;
  }
}
