import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSide, notionalMinor } from './trades.mjs';

test('normalizeSide accepts buy/sell in any case', () => {
  assert.equal(normalizeSide(' buy '), 'BUY');
  assert.equal(normalizeSide('SELL'), 'SELL');
  assert.equal(normalizeSide('hold'), null);
  assert.equal(normalizeSide(42), null);
});

test('notionalMinor multiplies integer quantity and price', () => {
  assert.equal(notionalMinor(100, 2550), 255000);
  assert.equal(notionalMinor(1.5, 100), null);
});
