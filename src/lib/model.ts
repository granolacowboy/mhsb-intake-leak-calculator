/**
 * Intake Revenue Leak model. Pure, total, framework-free.
 *
 * Implements MODEL.md exactly. Never throws, never returns NaN. Every numeric
 * output is finite. The five stage leaks are independent single-lever gains and
 * sum, by construction, to the headline.
 */

export type StageKey = "answer" | "response" | "followup" | "show" | "signing";

export const STAGE_ORDER: StageKey[] = [
  "answer",
  "response",
  "followup",
  "show",
  "signing",
];

export interface Rates {
  answer: number;
  response: number;
  followup: number;
  show: number;
  signing: number;
}

export interface Inputs {
  inquiriesPerMonth: number;
  avgMatterValue: number;
  /** Signed engagement letters that become paying / funded. Value scaler. */
  closeRate: number;
  /** The firm's status quo per stage (fractions 0..1). */
  current: Rates;
  /** The improved target per stage (fractions 0..1). */
  target: Rates;
}

export interface StageLeak {
  key: StageKey;
  /** Current rate as a fraction 0..1. */
  current: number;
  /** Effective target as a fraction 0..1 (clamped to be >= current). */
  target: number;
  /** Recoverable annual revenue attributed to this stage, whole dollars. */
  leak: number;
  /** Share of the headline this stage represents, 0..100. */
  sharePct: number;
}

export interface Result {
  annualInquiries: number;
  /** Effective value of one signed engagement letter = closeRate * avgMatterValue. */
  ev: number;
  /** Inquiry to signed-letter conversion at current rates, fraction 0..1. */
  currentConversion: number;
  /** Signed engagement letters per year at current rates (not rounded). */
  currentSignedPerYear: number;
  /** Captured revenue per year at current rates, whole dollars. */
  currentCapturedRevenue: number;
  stages: StageLeak[];
  /** Total recoverable revenue per year = sum of rounded stage leaks. */
  headlineLeak: number;
  /** Recoverable signed matters per year = headlineLeak / ev, one decimal. */
  recoverableMattersPerYear: number;
}

const MAX_INQUIRIES_PER_MONTH = 100_000;
const MAX_MATTER_VALUE = 10_000_000;

/**
 * Clamp any input to a fraction in [0, 1]. NaN and non-positive (including
 * -Infinity) resolve to 0; anything at or above 1 (including +Infinity) to 1.
 */
export function clamp01(x: unknown): number {
  const n = typeof x === "number" ? x : Number(x);
  if (Number.isNaN(n) || n <= 0) return 0;
  if (n >= 1) return 1;
  return n;
}

/**
 * Clamp a non-negative number to [0, max]. NaN and non-positive (including
 * -Infinity) resolve to 0; anything at or above max (including +Infinity) is
 * clamped to max, so an absurd override caps out rather than zeroing.
 */
export function clampNonNeg(x: unknown, max: number): number {
  const n = typeof x === "number" ? x : Number(x);
  if (Number.isNaN(n) || n <= 0) return 0;
  if (n >= max) return max;
  return n;
}

function sanitizeRates(r: Rates): Rates {
  return {
    answer: clamp01(r.answer),
    response: clamp01(r.response),
    followup: clamp01(r.followup),
    show: clamp01(r.show),
    signing: clamp01(r.signing),
  };
}

/**
 * Compute the leak result from raw (possibly hostile) inputs.
 * All clamping and NaN guarding happens here, so callers may pass anything.
 */
export function computeLeak(inputs: Inputs): Result {
  const inquiriesPerMonth = clampNonNeg(
    inputs.inquiriesPerMonth,
    MAX_INQUIRIES_PER_MONTH,
  );
  const annualInquiries = inquiriesPerMonth * 12;
  const avgMatterValue = clampNonNeg(inputs.avgMatterValue, MAX_MATTER_VALUE);
  const closeRate = clamp01(inputs.closeRate);
  const ev = closeRate * avgMatterValue;

  const current = sanitizeRates(inputs.current);
  const rawTarget = sanitizeRates(inputs.target);

  // Effective target is never below current, so no stage yields a negative leak.
  const target: Rates = {
    answer: Math.max(current.answer, rawTarget.answer),
    response: Math.max(current.response, rawTarget.response),
    followup: Math.max(current.followup, rawTarget.followup),
    show: Math.max(current.show, rawTarget.show),
    signing: Math.max(current.signing, rawTarget.signing),
  };

  const currentArr = STAGE_ORDER.map((k) => current[k]);
  const targetArr = STAGE_ORDER.map((k) => target[k]);

  const currentConversion = currentArr.reduce((a, b) => a * b, 1);
  const currentSignedPerYear = annualInquiries * currentConversion;
  const currentCapturedRevenue = Math.round(currentSignedPerYear * ev);

  // Isolated single-lever gain per stage: lift only this stage to target, hold
  // all others at current. Product over the OTHER current rates is computed
  // directly, so a current rate of 0 never causes a divide-by-zero.
  const rawLeaks = STAGE_ORDER.map((_key, i) => {
    let prodOthers = 1;
    for (let j = 0; j < currentArr.length; j++) {
      if (j !== i) prodOthers *= currentArr[j];
    }
    const delta = targetArr[i] - currentArr[i];
    return annualInquiries * ev * delta * prodOthers;
  });

  const roundedLeaks = rawLeaks.map((v) => Math.round(v));
  // Headline is the sum of the rounded stage leaks, so the breakdown always
  // reconciles to the total exactly (no off-by-a-dollar display drift).
  const headlineLeak = roundedLeaks.reduce((a, b) => a + b, 0);

  const stages: StageLeak[] = STAGE_ORDER.map((key, i) => ({
    key,
    current: currentArr[i],
    target: targetArr[i],
    leak: roundedLeaks[i],
    sharePct: headlineLeak > 0 ? (roundedLeaks[i] / headlineLeak) * 100 : 0,
  }));

  const recoverableMattersPerYear =
    ev > 0 ? Math.round((headlineLeak / ev) * 10) / 10 : 0;

  return {
    annualInquiries,
    ev,
    currentConversion,
    currentSignedPerYear,
    currentCapturedRevenue,
    stages,
    headlineLeak,
    recoverableMattersPerYear,
  };
}
