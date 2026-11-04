// Risk Analytics demo module (fictional). Rules: equities-risk-analytics-exposure-rules skill.

export function grossExposure(positions) {
  let total = 0;
  for (const { quantity, price } of positions) {
    if (!Number.isFinite(quantity) || !Number.isFinite(price)) {
      throw new RangeError('quantity and price must be finite numbers');
    }
    total += Math.abs(quantity * price);
  }
  return total;
}

export function breachesLimit(positions, limit) {
  return grossExposure(positions) > limit;
}
