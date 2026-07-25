import test from 'node:test';
import assert from 'node:assert/strict';

class FakeLocalStorage {
  constructor() {
    this.store = {};
  }

  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null;
  }

  setItem(key, value) {
    this.store[key] = value;
  }
}

globalThis.localStorage = new FakeLocalStorage();

const { STORAGE_KEY, getStoredLayoutId, storeLayoutId, resolvePreselectedLayoutId } = await import('./layoutStorage.js');

const manifest = [
  { id: 'scrubsS7', name: 'Scrubs S7', loadModule: () => {} },
  { id: 'escapeFromKak', name: 'Escape from Kak', loadModule: () => {} },
];

test('resolvePreselectedLayoutId returns the stored id when it matches a manifest entry', () => {
  assert.equal(resolvePreselectedLayoutId(manifest, 'escapeFromKak'), 'escapeFromKak');
});

test('resolvePreselectedLayoutId returns null when the stored id is null', () => {
  assert.equal(resolvePreselectedLayoutId(manifest, null), null);
});

test('resolvePreselectedLayoutId returns null when the stored id is undefined', () => {
  assert.equal(resolvePreselectedLayoutId(manifest, undefined), null);
});

test('resolvePreselectedLayoutId returns null when the stored id is not present in the manifest', () => {
  assert.equal(resolvePreselectedLayoutId(manifest, 'bogus'), null);
});

test('storeLayoutId writes the id under the exact STORAGE_KEY value', () => {
  globalThis.localStorage = new FakeLocalStorage();

  storeLayoutId('escapeFromKak');

  assert.equal(globalThis.localStorage.getItem(STORAGE_KEY), 'escapeFromKak');
});

test('getStoredLayoutId reads the id stored under STORAGE_KEY', () => {
  globalThis.localStorage = new FakeLocalStorage();
  globalThis.localStorage.setItem(STORAGE_KEY, 'scrubsS7');

  assert.equal(getStoredLayoutId(), 'scrubsS7');
});

test('getStoredLayoutId returns null when nothing is stored', () => {
  globalThis.localStorage = new FakeLocalStorage();

  assert.equal(getStoredLayoutId(), null);
});
