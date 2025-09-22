import domUtils from '../domUtils.js';
import Fsm from './Fsm.js';
import Point from './Point.js';
import pubSub from './PubSub.js';
import inputManager from './InputManager.js';

export default class Med extends Fsm {
  constructor(src, name) {
    super([
      { name: 'addMed', from: ['notAcquired', 'acquirable'], to: 'acquired' },
      { name: 'removeMed', from: 'acquired', to: 'notAcquired' },
      { name: 'markCompletable', from: 'notAcquired', to: 'acquirable' }], 
      {},
      'notAcquired');
    this.actions = {
      onAddMed: (function() {
        this.addImg();
        this.removeBorder();
      }).bind(this),
      onRemoveMed: (function() {
        this.addGreyedOutImg();
      }).bind(this),
      onMarkCompletable: this.addBorder.bind(this),
    };
    this.src = src;
    this.name = name;
    this.img = document.createElement('img');
    this.img.title = this.name;
    this.location = document.createElement('span');
    this.container = document.createElement('div');
    this.container.append(this.img);
    this.container.append(this.location);

    this.addGreyedOutImg();

    inputManager.subscribe('contextmenu', (function(clickEvent) {
      if(clickEvent.target !== this.img) {
        return;
      }
      pubSub.publish('show-select-med-location', new Point(
        clickEvent.x, 
        clickEvent.y,
      ));
      const subId = pubSub.subscribe('med-location-selected', (function(value, description) {
        this.location.textContent = value;
        pubSub.publish('hide-select-med-location')
        pubSub.unsubscribe('med-location-selected', subId);
      }).bind(this))
    }).bind(this));

    this.addMedListenerId = inputManager.subscribe('click', this.onClick.bind(this));
  }

  onClick(clickEvent) {
    if(clickEvent.target !== this.img) {
      return;
    }

    clickEvent.stopPropagation();
    switch(true) {
      case this.is('notAcquired'):
        this.addMed();
        break;
      case this.is('acquired'):
        this.removeMed();
        break;
      default:
    }
  }

  addGreyedOutImg() {
    this.img.src = this.src.replace('_32x32.png', '-bw_32x32.png');
    domUtils.addListener.once(this.img, 'click', this.addImg.bind(this));
  }

  addImg() {
    this.img.src = this.src;
    domUtils.addListener(this.img, 'oncontextmenu ', this.addGreyedOutImg.bind(this));
  }

  addBorder() {
    this.img.classList.add('med-acquirable');
  }

  removeBorder() {
    this.img.classList.remove('med-acquirable');
  }

  appendTo(container) {
    return container.append(this.container);
  }
}
