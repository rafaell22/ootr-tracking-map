import domUtils from '../domUtils.js';

export default class ButtonAddLine {
  constructor(elButton, elItems, drawLine) {
    this.elButton = elButton;
    this.elItems = elItems;
    this.drawLine = drawLine;

    domUtils.addListener(this.elButton, 'click', ((clickEvent) => {
    }).bind(this));
  }
}
