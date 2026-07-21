import pubSub from './PubSub.js';
import DragItemEvent from './events/DragItemEvent.js';
import inputManager from './InputManager.js';
import DropItemEvent from './events/DropItemEvent.js';

export class DragAndDropManager {
  constructor() {
    this.itemBeingDragged = null;

    pubSub.subscribe('drag-item', this.onDragItem.bind(this));
    inputManager.subscribe('mouseup', this.onMouseUp.bind(this));
  }

  /**
   * @param {DragItemEvent} dragItemEvent
   */
  onDragItem(dragItemEvent) {
    console.log('dragItemEvent: ', dragItemEvent)
    this.itemBeingDragged = dragItemEvent.item;
  }

  /**
   * @param {DropItemEvent} event
   */
  onMouseUp(event) {
    if(!this.itemBeingDragged) {
      return;
    }

    pubSub.publish('drop-item', new DropItemEvent(this.itemBeingDragged.itemId, event.target, this.itemBeingDragged.name));

    this.itemBeingDragged = null;
  }
}

export default new DragAndDropManager();
