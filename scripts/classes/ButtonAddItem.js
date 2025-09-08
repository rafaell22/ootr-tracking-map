import domUtils from '../domUtils.js';

export default class ButtonAddItem {
  constructor(elButton, elItems, selectItems) {
    this.elButton = elButton;
    this.elItems = elItems;
    this.selectItems = selectItems;

    domUtils.addListener(this.elButton, 'click', ((clickEvent) => {
      this.selectItems.show(clickEvent.x, clickEvent.y);
      this.selectItems.onselect(((selectEvent) => {
        const src = this.selectItems.value();
        const item = document.createElement('img');
        item.src = src;
        domUtils.addListener.once(item, 'click', () => {
          item.remove();
        })
        this.elItems.appendChild(item);
        this.selectItems.hide();
        console.log(selectItems)
        const selectedIndex = this.selectItems.selectedIndex;
        this.selectItems.options[selectedIndex].selected = false;
        this.selectItems.options[0].selected = true;
      }).bind(this));
    }).bind(this));
  }
}
