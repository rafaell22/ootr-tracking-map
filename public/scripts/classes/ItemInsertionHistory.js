// @ts-check
import pubSub from './PubSub.js';
import { locationItems } from '../data/locations.js';

/**
 * Tracks voice-driven item placements (found/peek) as a LIFO undo stack so
 * the "item remove last" voice command can walk back through them. Manual
 * context-menu picks and drag-and-drop placements are never pushed here.
 */
export class ItemInsertionHistory {
  constructor() {
    this.stack = [];
    pubSub.subscribe('voice-item-placed', this.onVoiceItemPlaced.bind(this));
  }

  /**
   * @param {import('./events/VoiceItemPlacedEvent.js').default} event
   */
  onVoiceItemPlaced(event) {
    this.stack.push(event);
  }

  /**
   * Pops the most recent voice placement off the stack and removes it via
   * `LocationItems.removeItem`, skipping over stale entries whose item was
   * already removed manually (by clicking it) before reaching a live one.
   *
   * Both the staleness check (`location.items.includes(entry.item)`) and the
   * actual removal (`location.removeItem(itemId, entry.item)`) are identity-based
   * rather than keyed off `itemId` alone, so that placing the same item twice at
   * the same location is handled correctly: an itemId-only match could otherwise
   * treat a stale reference as still live, or remove the wrong of two same-itemId
   * placements from `location.items`.
   *
   * `LocationItems.removeItem` only splices its internal array and re-lays
   * out the remaining icons — it does not detach the DOM node, since it was
   * written assuming `Item.remove()` already did that first (the manual-click
   * removal path). This method calls that removal path directly, so it must
   * also detach the DOM node itself.
   * @returns {{ itemName: string, locationName: string } | null}
   */
  undoLast() {
    while(this.stack.length > 0) {
      const entry = this.stack.pop();
      const location = locationItems[entry.locationId];

      if(!location || !location.items.includes(entry.item)) {
        continue;
      }

      location.removeItem(entry.item.itemId, entry.item);
      entry.item.el().remove();

      return { itemName: entry.itemName, locationName: entry.locationName };
    }

    return null;
  }
}

export default new ItemInsertionHistory();
