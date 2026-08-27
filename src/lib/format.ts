/** Display formatting. Uses Intl so locale and currency are not hardcoded. */

const money0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

/** Whole-dollar currency, e.g. $83,973. Non-finite -> $0. */
export function formatMoney(n: number): string {
  return money0.format(Number.isFinite(n) ? n : 0);
}

/** Percent from a fraction 0..1, one decimal, e.g. 0.405 -> "40.5%". */
export function formatPercentFromFraction(fraction: number): string {
  const v = Number.isFinite(fraction) ? fraction * 100 : 0;
  return `${roundTo(v, 1)}%`;
}

/** Percent from an already-percent value, one decimal. */
export function formatPercent(pct: number): string {
  const v = Number.isFinite(pct) ? pct : 0;
  return `${roundTo(v, 1)}%`;
}

/** Number with up to one decimal and thousands separators, e.g. 210.7. */
export function formatCount(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(v);
}

function roundTo(n: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(n * f) / f;
}
