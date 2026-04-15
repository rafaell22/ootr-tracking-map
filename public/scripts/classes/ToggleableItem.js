import inputManager from './InputManager.js';
import pubSub from './PubSub.js';
import BaseItem from './BaseItem.js';

export default class ToggleableItem extends BaseItem {
  constructor(itemId, name, initialState = 'notAcquired', canBeUnknown = false) {
    if(initialState === 'unknown') {
      canBeUnknown = true;
    }

    const states = [
      { name: 'findOutItem', from: 'unknown', to: 'notAcquired' },
      { name: 'acquireItem', from: 'notAcquired', to: 'acquired' },
      { name: 'unacquireItem', from: 'acquired', to: 'notAcquired'},
      { name: 'markNotRequired', from: 'unknown', to: 'notRequired' },
      { name: 'markKey', from: 'notRequired', to: 'key' },
      { name: 'markUnknown', from: 'key', to: 'unknown' },
    ];

    if(canBeUnknown) {
      states.push({ name: 'removeItem', from: [ 'notAcquired', 'acquired' ], to: 'unknown' });
    }

    super(itemId, name, states, 
      initialState);

    this.actions = {
      onFindOutItem: (function() {
        this.addNotAcquiredImg();
      }).bind(this),
      onAcquireItem: (function() {
        this.addAcquiredImg();
      }).bind(this),
      onUnacquireItem: (function() {
        this.addNotAcquiredImg();
      }).bind(this),
      onRemoveItem: (function() {
        this.itemId = null;
        this.addUnknownImg();
      }).bind(this),
      onMarkNotRequired: (function() {
        this.addNotRequiredImg();
      }).bind(this),
      onMarkKey: (function() {
        this.addKeyImg();
      }).bind(this),
      onMarkUnknown: (function() {
        this.addUnknownImg();
      }).bind(this),
    };

    if(this.itemId) {
      this.addNotAcquiredImg();

      pubSub.publish('loadImages', [
        `./assets/${this.itemId}-bw_32x32.png`,
        `./assets/${this.itemId}_32x32.png`,
      ]);
    } else {
      this.addUnknownImg();
    }

    pubSub.publish('loadImages', [
        './assets/gossip-stone-bw_32x32.png',
    ]);

    if(canBeUnknown) {
      inputManager.subscribe('contextmenu', this.onContextMenu.bind(this));
    }

    pubSub.subscribe('drop-item', this.onItemDropped.bind(this));
    pubSub.subscribe('item-acquired', this.onItemAcquired.bind(this));
    pubSub.subscribe('item-removed', this.onItemRemoved.bind(this));
  }

  /**
    * @param {ItemAcquiredEvent} event
    */
  onItemAcquired(event) {
    if(event.itemId === this.itemId) {
      this.acquireItem();
    }
  }

  /**
    * @param {ItemRemovedEvent} event
    */
  onItemRemoved(event) {
    if(event.itemId === this.itemId) {
      this.unacquireItem();
    }
  }

  addAcquiredImg() {
    this.addImg(`${this.itemId}_32x32.png`);
  }

  addNotAcquiredImg() {
    this.addImg(`${this.itemId}-bw_32x32.png`);
  }

  addKeyImg() {
    this.addImg('key_32x32.png');
  }

  addUnknownImg() {
    this.addImg('gossip-stone-bw_32x32.png');
  }

  addNotRequiredImg() {
    this.addImg('dead-bw_32x32.png');
  }

  onClick(clickEvent) {
    if(clickEvent.target !== this.img) {
      return;
    }

    clickEvent.stopPropagation();
    switch(true) {
      case this.is('notAcquired'):
        this.acquireItem();
        break;
      case this.is('acquired'):
        this.unacquireItem();
        break;
      case this.is('notRequired'):
        this.markKey();
        break;
      case this.is('key'):
        this.markUnknown();
        break;
      default:
    }
  }

  onContextMenu(clickEvent) {
    if(clickEvent.target !== this.img) {
      return;
    }

    clickEvent.stopPropagation();

    if(this.is('unknown')) {
      this.markNotRequired();
      return;
    }

    this.removeItem();
  }

  /**
   * @param {DropItemEvent} event
   */
  onItemDropped(event) {
    if(event.dropTarget !== this.img) {
      return;
    }

    this.itemId = event.itemId;
    this.findOutItem();
  }
}
