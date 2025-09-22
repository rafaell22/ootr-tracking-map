// @ts-check
import domUtils from '../domUtils.js';
import inputManager from '../classes/InputManager.js';
import pubSub from './PubSub.js';

export default class ContextMenu {
  /**
    * @param {HTMLElement} contextMenuEl
    */
  constructor(contextMenuEl) {
    this.el = contextMenuEl;
    inputManager.subscribe('contextmenu', (function(clickEvent) {
      if(clickEvent.target.tagName !== 'CANVAS') {
        return;
      }

      domUtils.toggle(this.el);
      pubSub.publish('hide-select-items');
      this.el.style.left = `${clickEvent.x}px`;
      this.el.style.top = `${clickEvent.y}px`;
    }).bind(this));

    domUtils.addListener('#undo', 'click', (function() {
      pubSub.publish('remove-line');
      domUtils.hide(this.el);
    }).bind(this));

    domUtils.addListener('#foolish', 'click', (function() {
      document.querySelectorAll('.remove-location').forEach(el => {
        domUtils.toggle(el);
      })
      pubSub.publish('hide-select-items');
      domUtils.hide(this.el);
    }).bind(this));

    const colors = this.el.querySelectorAll('.color');
    for(const color of colors) {
      domUtils.addListener(color, 'click', (function() {
        const selectedColor = this.el.querySelector('.selected');
        pubSub.publish('set-line-color', color.style.backgroundColor);
        selectedColor.classList.remove('selected');
        color.classList.add('selected');
      }).bind(this))
    }
  }
}
