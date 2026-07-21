import domUtils from '../domUtils.js';
import Item from './Item.js';
import ShowSelectItemsEvent from './events/ShowSelectItemsEvent.js';
import ItemRemovedEvent from './events/ShowSelectItemsEvent.js';
import DropItemEvent from './events/DropItemEvent.js';
import inputManager from './InputManager.js';
import Point from './Point.js';
import pubSub from './PubSub.js';

export default class LocationItems {
  constructor(id, name, position) {
    this.id = id;
    this.name = name;
    this.position = position;
    this.width = this.height = 16;
    this.items = [];

    this.createHtmlElement();
    this.addPathToEvents();
    this.addItemsEvents();
    //this.addFoolishButtonClickEvent();
    //this.createButtonToAddItems();
  }

  createHtmlElement() {
    this.el = document.createElement('div');
    this.el.style.position = 'relative';

    const img = document.createElement('img')
    img.src = './assets/location.png';
    img.style.width = `${this.width}px`;
    img.style.height = `${this.height}px`;

    this.itemContainer = document.createElement('div');
    //this.itemContainer.classList.add('hidden');
    this.itemContainer.style.position = 'absolute';
    this.itemContainer.style.top = '0';
    this.itemContainer.style.left = '0';

    this.el.append(img);
    this.el.append(this.itemContainer);

    this.el.style.position = 'absolute';
    this.el.style.top = `${this.position.y}px`;
    this.el.style.left = `${this.position.x}px`;
    this.el.id = this.id;
    /**
    this.el = document.createElement('div');
    this.el.id = `${this.id}-items`;
    this.el.classList.add('items');
    this.el.classList.add('pass-click-through');
    this.el.innerHTML = `
      <span class="location-name pass-click-through">
        <input class="remove-location hidden" value="X" />${this.name}</span>
      <input id="${this.id}-add-item" type="button" value="+" />
    `;
    */

    document.querySelector('body').append(this.el);
  }

  addPathToEvents() {
    inputManager.subscribe('click', (function(clickEvent) {
      if(clickEvent.target.tagName === 'IMG' && clickEvent.target.parentNode?.id === this.id) {
        const clickPoint = new Point(this.position.x + this.width / 2, this.position.y + this.height/2);
        pubSub.publish('path-to', clickPoint);
      }
    }).bind(this));
  }

  addItemsEvents() {
    inputManager.subscribe('contextmenu', (function(clickEvent) {
      if(clickEvent.target.tagName === 'IMG' && clickEvent.target.parentNode?.id === this.id) {
        pubSub.publish('show-select-items', new ShowSelectItemsEvent(this.id, new Point(
          this.position.x,
          this.position.y,
        )));
      }
    }).bind(this))

    pubSub.subscribe('item-selected', this.onItemSelected.bind(this));
    pubSub.subscribe('item-removed', this.onItemRemoved.bind(this));
    pubSub.subscribe('drop-item', this.onItemDropped.bind(this));
  }

  /**
    * @param {ItemSelectedEvent} event
    */
  onItemSelected(event) {
      if(event.anchorId !== this.id) {
        return;
      }

      this.addItem.call(this, event.itemId, event.itemName);
  }

  /**
    * @param {ItemRemovedEvent} event
    */
  onItemRemoved(event) {
    if(event.buttonId !== this.id) {
      return;
    }

    this.removeItem.call(this, event.itemId);
  }

  /**
    * @param {DropItemEvent} event
    */
  onItemDropped(event) {
    if(event.dropTarget.tagName !== 'IMG' || event.dropTarget.parentNode?.id !== this.id) {
      return;
    }

    if(!event.itemId) {
      return;
    }

    this.addItem(event.itemId, event.name);
  }

  addItem(itemId, itemName) {
    const item = new Item(this.id, itemId, itemName, this.locationId);

    this.itemContainer.append(item.el());

    item.el().style.width = '16px';
    item.el().style.height = '16px';
    item.el().style.transform = `rotate(${this.items.length * 45}deg) translate(16px) rotate(-${this.items.length * 45}deg)`;
    item.el().style.position = 'absolute';
    item.el().style.backgroundColor = '#333';
    item.el().style.borderRadius = '50%';

    this.items.push(item);
  }

  removeItem(itemId) {
    const index = this.items.findIndex(item => item.itemId === itemId);
    this.items.splice(index, 1);

    for(let i = 0; i < this.items.length; i++) {
      this.items[i].el().style.transform = `rotate(${i * 45}deg) translate(16px) rotate(-${i * 45}deg)`;
    }
  }

  addFoolishButtonClickEvent() {
    domUtils.addListener(this.el.querySelector('.remove-location'), 'click', (function() {
      this.el.innerHTML = `
        <span class="location-name foolish pass-click-through">${this.name}</span>
      `;
    }).bind(this));
  }
}
