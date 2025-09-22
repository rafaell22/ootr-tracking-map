import { PubSub } from './PubSub.js';

class InputManager extends PubSub {
  constructor() {
    super();
    document.addEventListener('click', (function(event) {
      event.preventDefault();
      this.publish('click', event);
    }).bind(this));
    document.addEventListener('contextmenu', (function(event) {
      event.preventDefault();
      this.publish('contextmenu', event);
    }).bind(this))
  }
}

export default new InputManager();
