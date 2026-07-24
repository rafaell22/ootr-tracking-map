import test from 'node:test';
import assert from 'node:assert/strict';

function createFakeElement(tagName) {
  return {
    tagName: tagName ? tagName.toUpperCase() : undefined,
    style: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    children: [],
    removed: false,
    append(...nodes) { this.children.push(...nodes); },
    appendChild(node) { this.children.push(node); return node; },
    addEventListener() {},
    removeEventListener() {},
    remove() { this.removed = true; },
  };
}

globalThis.document = {
  createElement: (tagName) => createFakeElement(tagName),
  querySelector: () => createFakeElement('body'),
  addEventListener() {},
};

const { default: LocationItems } = await import('./LocationItems.js');
const { default: pubSub } = await import('./PubSub.js');
const { default: VoiceItemPlacedEvent } = await import('./events/VoiceItemPlacedEvent.js');
const { locationItems } = await import('../data/locations.js');
const { default: itemInsertionHistory } = await import('./ItemInsertionHistory.js');

test('undoLast returns null when the stack starts empty', () => {
  assert.strictEqual(itemInsertionHistory.undoLast(), null);
});

test('undoLast removes a single voice-placed item and reports where it was removed from', () => {
  const location = new LocationItems('undo-single', 'Undo Single', { x: 0, y: 0 });
  locationItems['undo-single'] = location;

  location.addItem('kokiri-sword', 'Kokiri Sword');
  const placedItem = location.items[0];
  pubSub.publish('voice-item-placed', new VoiceItemPlacedEvent(placedItem, 'Kokiri Sword', 'undo-single', 'Undo Single'));

  const result = itemInsertionHistory.undoLast();

  assert.deepStrictEqual(result, { itemName: 'Kokiri Sword', locationName: 'Undo Single' });
  assert.strictEqual(location.items.length, 0);
  assert.strictEqual(placedItem.el().removed, true);
});

test('undoLast is a LIFO stack across multiple placements at the same location', () => {
  const location = new LocationItems('undo-lifo', 'Undo Lifo', { x: 0, y: 0 });
  locationItems['undo-lifo'] = location;

  location.addItem('kokiri-sword', 'Kokiri Sword');
  const firstItem = location.items[0];
  pubSub.publish('voice-item-placed', new VoiceItemPlacedEvent(firstItem, 'Kokiri Sword', 'undo-lifo', 'Undo Lifo'));

  location.addItem('hylian-shield', 'Hylian Shield');
  const secondItem = location.items[1];
  pubSub.publish('voice-item-placed', new VoiceItemPlacedEvent(secondItem, 'Hylian Shield', 'undo-lifo', 'Undo Lifo'));

  const firstUndo = itemInsertionHistory.undoLast();
  const secondUndo = itemInsertionHistory.undoLast();

  assert.deepStrictEqual(firstUndo, { itemName: 'Hylian Shield', locationName: 'Undo Lifo' });
  assert.deepStrictEqual(secondUndo, { itemName: 'Kokiri Sword', locationName: 'Undo Lifo' });
  assert.strictEqual(location.items.length, 0);
});

test('undoLast removes the exact instance placed last when the same itemId was placed twice at one location', () => {
  const location = new LocationItems('undo-duplicate', 'Undo Duplicate', { x: 0, y: 0 });
  locationItems['undo-duplicate'] = location;

  location.addItem('small-key', 'Small Key');
  const olderPlacement = location.items[0];
  pubSub.publish('voice-item-placed', new VoiceItemPlacedEvent(olderPlacement, 'Small Key', 'undo-duplicate', 'Undo Duplicate'));

  location.addItem('small-key', 'Small Key');
  const newerPlacement = location.items[1];
  pubSub.publish('voice-item-placed', new VoiceItemPlacedEvent(newerPlacement, 'Small Key', 'undo-duplicate', 'Undo Duplicate'));

  const firstUndo = itemInsertionHistory.undoLast();

  assert.deepStrictEqual(firstUndo, { itemName: 'Small Key', locationName: 'Undo Duplicate' });
  assert.strictEqual(location.items.length, 1);
  assert.strictEqual(location.items[0], olderPlacement);
  assert.strictEqual(newerPlacement.el().removed, true);
  assert.strictEqual(olderPlacement.el().removed, false);

  const secondUndo = itemInsertionHistory.undoLast();

  assert.deepStrictEqual(secondUndo, { itemName: 'Small Key', locationName: 'Undo Duplicate' });
  assert.strictEqual(location.items.length, 0);
  assert.strictEqual(olderPlacement.el().removed, true);
});

test('undoLast skips a stale entry whose item was already removed manually, then removes the next valid entry underneath it', () => {
  const location = new LocationItems('undo-stale', 'Undo Stale', { x: 0, y: 0 });
  locationItems['undo-stale'] = location;

  location.addItem('hylian-shield', 'Hylian Shield');
  const validItem = location.items[0];
  pubSub.publish('voice-item-placed', new VoiceItemPlacedEvent(validItem, 'Hylian Shield', 'undo-stale', 'Undo Stale'));

  location.addItem('kokiri-sword', 'Kokiri Sword');
  const staleItem = location.items[1];
  pubSub.publish('voice-item-placed', new VoiceItemPlacedEvent(staleItem, 'Kokiri Sword', 'undo-stale', 'Undo Stale'));

  location.removeItem('kokiri-sword');

  const result = itemInsertionHistory.undoLast();

  assert.deepStrictEqual(result, { itemName: 'Hylian Shield', locationName: 'Undo Stale' });
  assert.strictEqual(location.items.length, 0);
});

test('undoLast returns null once the stack is exhausted', () => {
  assert.strictEqual(itemInsertionHistory.undoLast(), null);
});
