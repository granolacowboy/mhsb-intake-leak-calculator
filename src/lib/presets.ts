/**
 * Default inputs, practice-area presets, and the two optional helper mappings.
 * Every value here is either a MODEL.md default or an ASSUMPTION documented in
 * MODEL.md sections 5 and 6. No value here is presented in the UI as a sourced
 * fact without its ASSUMPTION badge.
 */

import type { Inputs } from "./model";

/** MODEL.md section 2 defaults. Rates are fractions 0..1. */
export const DEFAULTS: Inputs = {
  inquiriesPerMonth: 50,
  avgMatterValue: 3500,
  closeRate: 0.9,
  current: {
    answer: 0.4,
    response: 0.5,
    followup: 0.48,
    show: 0.7,
    signing: 0.45,
  },
  target: {
    answer: 0.58,
    response: 0.65,
    followup: 0.65,
    show: 0.8,
    signing: 0.55,
  },
};

export interface PracticePreset {
  id: string;
  label: string;
  /** Illustrative average matter value (USD). ASSUMPTION, see MODEL.md 5. */
  matterValue: number;
}

/** MODEL.md section 5. All illustrative ASSUMPTION values, not benchmarks. */
export const PRACTICE_PRESETS: PracticePreset[] = [
  { id: "general", label: "General / not sure", matterValue: 3500 },
  { id: "personal-injury", label: "Personal injury", matterValue: 8000 },
  { id: "family", label: "Family law", matterValue: 6000 },
  { id: "estate", label: "Estate planning", matterValue: 2500 },
  { id: "criminal", label: "Criminal defense", matterValue: 4000 },
  { id: "immigration", label: "Immigration", matterValue: 4500 },
  { id: "business", label: "Business / corporate", matterValue: 7500 },
  { id: "employment", label: "Employment", matterValue: 6500 },
  { id: "real-estate", label: "Real estate", matterValue: 2800 },
  { id: "bankruptcy", label: "Bankruptcy", matterValue: 3000 },
];

export interface RateBand {
  id: string;
  label: string;
  /** Capture rate this band implies (fraction 0..1). ASSUMPTION. */
  rate: number;
}

/** MODEL.md 6a: first-response time band -> responseCaptureRate. */
export const RESPONSE_BANDS: RateBand[] = [
  { id: "under-5m", label: "Under 5 minutes", rate: 0.9 },
  { id: "5-30m", label: "5 to 30 minutes", rate: 0.8 },
  { id: "30-60m", label: "30 minutes to 1 hour", rate: 0.7 },
  { id: "1-24h", label: "1 to 24 hours", rate: 0.5 },
  { id: "over-24h", label: "Over 24 hours", rate: 0.3 },
];

/** MODEL.md 6b: follow-up attempts -> followupCaptureRate. */
export const FOLLOWUP_BANDS: RateBand[] = [
  { id: "1", label: "1 attempt", rate: 0.48 },
  { id: "2-3", label: "2 to 3 attempts", rate: 0.7 },
  { id: "4-5", label: "4 to 5 attempts", rate: 0.85 },
  { id: "6+", label: "6 or more attempts", rate: 0.93 },
];

/** Default band selections that match DEFAULTS.current. */
export const DEFAULT_RESPONSE_BAND = "1-24h"; // 0.50
export const DEFAULT_FOLLOWUP_BAND = "1"; // 0.48

/** Find the band whose rate is closest to a given fraction (for hydration). */
export function bandForRate(bands: RateBand[], rate: number): RateBand {
  let best = bands[0];
  let bestDelta = Infinity;
  for (const b of bands) {
    const d = Math.abs(b.rate - rate);
    if (d < bestDelta) {
      bestDelta = d;
      best = b;
    }
  }
  return best;
}
