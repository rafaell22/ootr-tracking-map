import ItemAcquiredEvent from './events/ItemAcquiredEvent.js';
import ItemRemovedEvent from './events/ItemRemovedEvent.js';
import Fsm from './Fsm.js';
import inputManager from './InputManager.js';
import pubSub from './PubSub.js';

export default class Song extends Fsm {
  constructor(songId, name) {
    super([
      { name: 'addSong', from: 'notAcquired', to: 'acquired' },
      { name: 'removeSong', from: 'acquired', to: 'notAcquired'}
    ], 
      {},
      'notAcquired');
    this.actions = {
      onAddSong: (function() {
        this.addImg();
      }).bind(this),
      onRemoveSong: (function() {
        this.addGreyedOutImg();
      }).bind(this),
    };
    this.songId = songId;
    this.name = name;
    this.img = document.createElement('img');
    this.img.title = this.name;

    this.addGreyedOutImg();

    inputManager.subscribe('click', this.onClick.bind(this));
    pubSub.subscribe('item-acquired', this.onItemAcquired.bind(this));
    pubSub.subscribe('item-removed', this.onItemRemoved.bind(this));
  }

  /**
    * @param {ItemAcquiredEvent} event
    */
  onItemAcquired(event) {
    if(event.itemId === this.songId) {
      this.addSong();
    }
  }

  /**
    * @param {ItemRemovedEvent} event
    */
  onItemRemoved(event) {
    if(event.itemId === this.songId) {
      this.removeSong();
    }
  }

  onClick(clickEvent) {
    if(clickEvent.target !== this.img) {
      return;
    }

    clickEvent.stopPropagation();
    switch(true) {
      case this.is('notAcquired'):
        this.addSong();
        break;
      case this.is('acquired'):
        this.removeSong();
        break;
      default:
    }
  }

  addGreyedOutImg() {
    this.img.src = `./assets/${this.songId}-bw_32x32.png`;
  }

  addImg() {
    this.img.src = `./assets/${this.songId}_32x32.png`;
  }

  appendTo(container) {
    return container.append(this.img);
  }
}
