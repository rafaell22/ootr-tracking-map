// @ts-check

import domUtils from '../domUtils.js';
import Point from './Point.js';
import pubSub from './PubSub.js';

export default class SelectMedLocation {
  /**
    * @param {HTMLSelectElement} elSelect
    */
  constructor(elSelect) {
    this.elSelect = elSelect;

    pubSub.subscribe('hide-select-med-location', this.hide.bind(this));
    pubSub.subscribe('show-select-med-location', this.show.bind(this))

    domUtils.addListener(this.elSelect, 'change', this.onSelectMedLocation.bind(this));
  }

  onSelectMedLocation() {
    pubSub.publish('med-location-selected', this.value(), this.description());
    this.hide();
    this.options[this.selectedIndex].selected = false;
    this.options[0].selected = true;
  }

  /**
    * @param {Point} point
    */
  show(point) {
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
