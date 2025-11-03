import domUtils from '../domUtils.js';
import ButtonAddItem from './ButtonAddItem.js';

export default class LocationItems {
  constructor(id, name) {
    this.id = id;
    this.name = name;

    this.createHtmlElement();
    this.addFoolishButtonClickEvent();
    this.createButtonToAddItems();
  }

  createHtmlElement() {
    this.el = document.createElement('div');
    this.el.id = `${this.id}-items`;
    this.el.classList.add('items');
    this.el.classList.add('pass-click-through');
    this.el.innerHTML = `
      <span class="location-name pass-click-through">
        <input class="remove-location hidden" value="X" />${this.name}</span>
      <input id="${this.id}-add-item" type="button" value="+" />
    `;

    document.querySelector('body').append(this.el);
  }

  addFoolishButtonClickEvent() {
    domUtils.addListener(this.el.querySelector('.remove-location'), 'click', (function() {
      this.el.innerHTML = `
        <span class="location-name foolish pass-click-through">${this.name}</span>
      `;
    }).bind(this));
  }

  createButtonToAddItems() {
    this.button = new ButtonAddItem(domUtils.el(`#${this.id}-add-item`), domUtils.el(`#${this.id}-items`), this.id);
  }
}
