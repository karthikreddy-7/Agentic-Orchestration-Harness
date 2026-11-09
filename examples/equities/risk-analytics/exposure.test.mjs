import { test } from 'node:test';
import assert from 'node:assert/strict';
import { grossExposure, breachesLimit } from './exposure.mjs';

const book = [
  { quantity: 100, price: 10 },
  { quantity: -50, price: 20 },
];

test('grossExposure sums absolute exposure', () => {
  assert.equal(grossExposure(book), 2000);
  assert.throws(() => grossExposure([{ quantity: NaN, price: 1 }]), RangeError);
});

test('breachesLimit is strictly greater than', () => {
  assert.equal(breachesLimit(book, 2000), false);
  assert.equal(breachesLimit(book, 1999), true);
});
