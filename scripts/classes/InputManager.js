import { PubSub } from './PubSub.js';

export default class InputManager extends PubSub {
  constructor() {
    super();
    document.addEventListener('click', this.publish.bind(this, 'click'));
    document.addEventListener('contextmenu', (function(event) {
      event.preventDefault();
      this.publish('contextmenu', event);
    }).bind(this))
  }
}
