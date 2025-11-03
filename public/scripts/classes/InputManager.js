import { PubSub } from './PubSub.js';

class InputManager extends PubSub {
  constructor() {
    super();
    document.addEventListener('click', (function(event) {
      if(event.target.tagName !== 'INPUT' && event.target.type !== 'file') {
        event.preventDefault();
      }
      this.publish('click', event);
    }).bind(this));
    document.addEventListener('contextmenu', (function(event) {
      event.preventDefault();
      this.publish('contextmenu', event);
    }).bind(this))

  }
}

export default new InputManager();
