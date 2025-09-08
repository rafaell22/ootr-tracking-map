import domUtils from '../domUtils.js';

export default class SelectItems {
  constructor(elSelect) {
    this.elSelect = elSelect;
  }

  show(x, y) {
    domUtils.show(this.elSelect);
    console.log(this.elSelect)
    this.elSelect.style.left = `${x}px`;
    this.elSelect.style.top = `${y}px`;
  }

  hide() {
    domUtils.hide(this.elSelect);
  }

  onselect(cb) {
    domUtils.addListener.once(this.elSelect, 'change', cb);
  }

  value() {
    return this.elSelect.value;
  }

  get selectedIndex() {
    return this.elSelect.selectedIndex;
  }

  get options() {
    return this.elSelect.options;
  }
}
