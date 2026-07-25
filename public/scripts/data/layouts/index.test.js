import test from 'node:test';
import assert from 'node:assert/strict';

import layoutManifest from './index.js';

test('every manifest entry has a unique id', () => {
  const ids = layoutManifest.map((entry) => entry.id);
  const uniqueIds = new Set(ids);

  assert.equal(uniqueIds.size, ids.length);
});

test('every manifest entry has a non-empty name', () => {
  for(const entry of layoutManifest) {
    assert.equal(typeof entry.name, 'string');
    assert.ok(entry.name.length > 0);
  }
});

test('every manifest entry has a loadModule function', () => {
  for(const entry of layoutManifest) {
    assert.equal(typeof entry.loadModule, 'function');
  }
});
