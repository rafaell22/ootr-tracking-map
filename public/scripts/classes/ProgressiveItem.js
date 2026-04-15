import BaseItem from './BaseItem.js';
import pubSub from './PubSub.js';

export default class ProgressiveItem extends BaseItem {
  constructor(itemId, name, progressions) {
    const progressiveStates = [
      { name: 'unacquireItem', from: 'progression', to: 'notAcquired'},
      { name: 'progress', from: ['notAcquired', 'progression'], to: 'progression' },
      { name: 'regress', from: 'progression', to: 'progression' },
    ];

    super(
      itemId,
      name,
      progressiveStates, 
      'notAcquired'
    );

    this.actions = {
      onUnacquireItem: (function() {
        this.progression = 0;
        this.addNotAcquiredImg();
      }).bind(this),
      onProgress: (function() {
        this.progression += 1;
        this.addProgressiveImg();
      }).bind(this),
      onRegress: (function() {
        this.progression -= 1;
        this.addProgressiveImg();
      })
    };

    this.progression = 0;
    this.progressions = progressions;

    this.addNotAcquiredImg();

    pubSub.subscribe('item-acquired', this.onItemAcquired.bind(this));
    pubSub.subscribe('item-removed', this.onItemRemoved.bind(this));
  }

  /**
    * @param {ItemAcquiredEvent} event
    */
  onItemAcquired(event) {
    if(event.itemId === this.itemId) {
      this.progress();
    }
  }

  /**
    * @param {ItemRemovedEvent} event
    */
  onItemRemoved(event) {
    if(event.itemId === this.itemId) {
      if(this.progression === 1) {
        this.unacquireItem();
        return;
      }

      this.regress();
    }
  }

  addNotAcquiredImg() {
    this.addImg(`${this.itemId}-bw_32x32.png`);
  }

  addProgressiveImg() {
    this.addImg(`${this.itemId}${this.progression}_32x32.png`);
  }

  onClick(clickEvent) {
    if(clickEvent.target !== this.img) {
      return;
    }
    console.log('click')

    clickEvent.stopPropagation();
    switch(true) {
      case this.is('progression'):
        if(this.progression > this.progressions) {
          this.unacquireItem();
          return;
        }

        this.progress();
        break;
      default:
        this.progress();
    }
  }
}
