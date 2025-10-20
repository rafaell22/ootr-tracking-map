// @ts-check

import domUtils from '../domUtils.js';
import ItemSelectedEvent from './events/ItemSelectedEvent.js';
import ShowSelectItemsEvent from './events/ShowSelectItemsEvent.js';
import pubSub from './PubSub.js';

export default class SelectItems {
  /**
    * @param {HTMLSelectElement} elSelect
    */
  constructor(elSelect) {
    this.elSelect = elSelect;
    this.anchorId = null;

    pubSub.subscribe('hide-select-items', this.hide.bind(this));
    pubSub.subscribe('show-select-items', this.show.bind(this))

    domUtils.addListener(this.elSelect, 'change', this.onSelectItem.bind(this));
  }

  onSelectItem() {
    pubSub.publish('item-selected', new ItemSelectedEvent(this.anchorId, this.value(), this.description()));
    this.anchorId = null;
    this.hide();
    this.options[this.selectedIndex].selected = false;
    this.options[0].selected = true;
  }

  /**
    * @param {ShowSelectItemsEvent} event
    */
  show(event) {
    this.anchorId = event.anchorId;
    domUtils.show(this.elSelect);
    this.elSelect.style.left = `${event.location.x}px`;
    this.elSelect.style.top = `${event.location.y}px`;
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
