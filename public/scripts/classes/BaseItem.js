import ItemAcquiredEvent from './events/ItemAcquiredEvent.js';
import ItemRemovedEvent from './events/ItemRemovedEvent.js';
import DragItemEvent from './events/DragItemEvent.js';
import Fsm from './Fsm.js';
import inputManager from './InputManager.js';
import pubSub from './PubSub.js';

export default class BaseItem extends Fsm {
  constructor(itemId, name, states, initialState) {
    super(
      states, 
      {},
      initialState
    );

    this.itemId = itemId;
    this.name = name;
    this.img = document.createElement('img');
    this.img.classList.add('item');
    this.img.title = this.name;

    inputManager.subscribe('click', this.onClick.bind(this));
    inputManager.subscribe('middlemousedown', this.onMiddleClick.bind(this));
  }

  onMiddleClick(event) {
    if(event.target !== this.img) {
      return;
    }

    pubSub.publish('drag-item', new DragItemEvent(this));
  }

  addImg(imgName) {
    this.img.src = `./assets/${imgName}`;
  }

  appendTo(container) {
    return container.append(this.img);
  }

  el() {
    return this.img;
  }
}
