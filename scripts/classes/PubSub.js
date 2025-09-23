/**
 * Create a simple publish-subscribe pattern.
 */
export class PubSub {
  constructor() {
    this.events = {};
  }

  /**
   * Subscribe to an event. If the event doesn't exist yet, create one.
   * @param  {string}   event                  Event name to subscribe to
   * @param  {function} callback               Function that will be executed when the event is published
   * @return {string}                          Unique identification of a subscription. Can be used to unsubscribe specific listeners
   */
  subscribe(event, callback) {
    if(!this.events[event]) {
        this.events[event] = [];
    }
    const id = this.events[event].length + (new Date()).toISOString();
    this.events[event].push({
        id: id,
        callback: callback
    });

    return id;
  }

  /**
   * [description]
   * @param  {string} event                   Name of the event to be published
   * @param  {array}  [args=[]]               Array of arguments to be passed to the subscribers' callbacks
   */
  publish(event, ...args) {
    if(this.events[event]) {
        this.events[event].forEach(listener => {
            listener.callback(...args);
        });
    }
  }

  /**
   * Unsubscribe a certain listener to from an event
   * @param  {string} id               id that identifies the listener
   */
  unsubscribe(event, id) {
    const eventIndex = this.events[event].findIndex(event => event.id === id);
    if(eventIndex >= 0) {
        this.events[event].splice(eventIndex, 1);
    }
  }

  /**
    * @param {string} event
    */
  unsubscribeAll(event) {
    this.events[event] = [];
  }
}

export default new PubSub();
