import test from 'node:test';
import assert from 'node:assert/strict';

function createFakeElement(tagName) {
  return {
    tagName: tagName ? tagName.toUpperCase() : undefined,
    style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    children: [],
    append(...nodes) { this.children.push(...nodes); },
    appendChild(node) { this.children.push(node); return node; },
    addEventListener() {},
    removeEventListener() {},
  };
}

globalThis.document = {
  createElement: (tagName) => createFakeElement(tagName),
  querySelector: () => createFakeElement('body'),
  addEventListener() {},
};

const { default: LocationItems } = await import('./LocationItems.js');
const { default: pubSub } = await import('./PubSub.js');
const { default: ItemFoundEvent } = await import('./events/ItemFoundEvent.js');
const { default: ItemSelectedEvent } = await import('./events/ItemSelectedEvent.js');

test('item-found places an item already acquired and publishes item-acquired for the tracker', () => {
  const location = new LocationItems('location-found', 'Location Found', { x: 0, y: 0 });
  const acquiredEvents = [];
  pubSub.subscribe('item-acquired', (event) => acquiredEvents.push(event));

  pubSub.publish('item-found', new ItemFoundEvent('location-found', 'kokiri-sword', 'Kokiri Sword'));

  assert.equal(location.items.length, 1);
  assert.equal(location.items[0].itemId, 'kokiri-sword');
  assert.equal(location.items[0].el().src, './assets/kokiri-sword_32x32.png');
  assert.equal(acquiredEvents.length, 1);
  assert.equal(acquiredEvents[0].itemId, 'kokiri-sword');
});

test('item-found for a different location is ignored', () => {
  const location = new LocationItems('location-found-b', 'Location Found B', { x: 0, y: 0 });

  pubSub.publish('item-found', new ItemFoundEvent('some-other-location', 'kokiri-sword', 'Kokiri Sword'));

  assert.equal(location.items.length, 0);
});

test('item-selected still places a greyed-out, unacquired item without publishing item-acquired (peek unchanged)', () => {
  const location = new LocationItems('location-peek', 'Location Peek', { x: 0, y: 0 });
  const acquiredEvents = [];
  pubSub.subscribe('item-acquired', (event) => acquiredEvents.push(event));

  pubSub.publish('item-selected', new ItemSelectedEvent('location-peek', 'kokiri-sword', 'Kokiri Sword'));

  assert.equal(location.items.length, 1);
  assert.equal(location.items[0].el().src, './assets/kokiri-sword-bw_32x32.png');
  assert.equal(acquiredEvents.length, 0);
});
