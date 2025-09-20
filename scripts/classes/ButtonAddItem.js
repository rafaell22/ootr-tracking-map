import domUtils from '../domUtils.js';
import Item from './Item.js';

export default class ButtonAddItem {
  constructor(elButton, elItems, selectItems) {
    this.elButton = elButton;
    this.elItems = elItems;
    this.selectItems = selectItems;

    domUtils.addListener(this.elButton, 'click', ((clickEvent) => {
      this.selectItems.show(clickEvent.x, clickEvent.y);
      this.selectItems.onselect(((selectEvent) => {
        const src = this.selectItems.value();
        const selectedIndex = this.selectItems.selectedIndex;
        const itemName = this.selectItems.options[selectedIndex].textContent;

        const item = new Item(src, itemName);

        this.elItems.append(item.el());

        this.selectItems.hide();
        this.selectItems.options[selectedIndex].selected = false;
        this.selectItems.options[0].selected = true;
      }).bind(this));
    }).bind(this));
  }
}
