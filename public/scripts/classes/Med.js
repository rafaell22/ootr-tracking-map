import domUtils from '../domUtils.js';
import Fsm from './Fsm.js';
import inputManager from './InputManager.js';

const medLocations = [
  'jabu',
  'dc',
  'deku',
  'pocket',
  '',
  'forest',
  'fire',
  'water',
  'shadow',
  'spirit'
];

export default class Med extends Fsm {
  constructor(medId, name) {
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
    this.medLocationIndex = 4;
    this.medId = medId;
    this.name = name;
    this.img = document.createElement('img');
    this.img.title = this.name;
    this.location = document.createElement('span');
    this.container = document.createElement('div');
    this.container.append(this.img);
    this.container.append(this.location);

    this.addGreyedOutImg();

    this.addMedListenerId = inputManager.subscribe('click', this.onClick.bind(this));


    this.img.addEventListener('wheel', this.changeMedLocation.bind(this))
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

  changeMedLocation(event) {
    event.preventDefault();

    if(event.deltaY > 0) {
      if(this.medLocationIndex < (medLocations.length - 1)){
        this.medLocationIndex += 1;
      }
    } else if(this.medLocationIndex > 0) {
      this.medLocationIndex -= 1;
    }

    this.location.textContent = medLocations[this.medLocationIndex];
  }

  addGreyedOutImg() {
    this.img.src = `./assets/${this.medId}-bw_32x32.png`;
    domUtils.addListener.once(this.img, 'click', this.addImg.bind(this));
  }

  addImg() {
    this.img.src = `./assets/${this.medId}_32x32.png`;
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
