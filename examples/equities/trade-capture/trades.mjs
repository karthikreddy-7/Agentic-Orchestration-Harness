// Trade Capture demo module (fictional). The quickstart asks the agents to add
// `validateTradeId()` here, following the equities-trade-capture-trade-id-format skill.

const SIDES = new Set(['BUY', 'SELL']);

export function normalizeSide(side) {
  if (typeof side !== 'string') return null;
  const upper = side.trim().toUpperCase();
  return SIDES.has(upper) ? upper : null;
}

// Notional in minor units (cents) to avoid floating-point money.
export function notionalMinor(quantity, priceMinor) {
  if (!Number.isInteger(quantity) || !Number.isInteger(priceMinor)) return null;
  return quantity * priceMinor;
}
