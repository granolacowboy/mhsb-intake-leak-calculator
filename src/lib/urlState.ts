/**
 * URL-encoded shareable state. Rates travel as percentages for readability
 * (a=40 not a=0.4) and are stored internally as fractions. Decoding is total:
 * any missing or malformed parameter falls back to the default.
 */

import type { Inputs, Rates } from "./model";
import { DEFAULTS } from "./presets";

export interface FullState extends Inputs {
  /** Selected practice-area preset id (UI only, not used by the model). */
  practiceArea: string;
}

export const DEFAULT_STATE: FullState = {
  ...structuredCloneInputs(DEFAULTS),
  practiceArea: "general",
};

function structuredCloneInputs(inp: Inputs): Inputs {
  return {
    inquiriesPerMonth: inp.inquiriesPerMonth,
    avgMatterValue: inp.avgMatterValue,
    closeRate: inp.closeRate,
    current: { ...inp.current },
    target: { ...inp.target },
  };
}

const pctToFraction = (pct: number) => pct / 100;
const fractionToPct = (fr: number) => Math.round(fr * 1000) / 10; // 1 decimal

function num(params: URLSearchParams, key: string, fallback: number): number {
  const raw = params.get(key);
  if (raw === null) return fallback;
  const n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}

/** Serialize state to a query string (without the leading "?"). */
export function encodeState(s: FullState): string {
  const p = new URLSearchParams();
  p.set("i", String(s.inquiriesPerMonth));
  p.set("v", String(s.avgMatterValue));
  p.set("p", s.practiceArea);
  p.set("cl", String(fractionToPct(s.closeRate)));
  const c = s.current;
  const t = s.target;
  p.set("a", String(fractionToPct(c.answer)));
  p.set("r", String(fractionToPct(c.response)));
  p.set("f", String(fractionToPct(c.followup)));
  p.set("s", String(fractionToPct(c.show)));
  p.set("g", String(fractionToPct(c.signing)));
  p.set("ta", String(fractionToPct(t.answer)));
  p.set("tr", String(fractionToPct(t.response)));
  p.set("tf", String(fractionToPct(t.followup)));
  p.set("ts", String(fractionToPct(t.show)));
  p.set("tg", String(fractionToPct(t.signing)));
  return p.toString();
}

/** Parse a query string (with or without leading "?") back into state. */
export function decodeState(search: string): FullState {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const d = DEFAULT_STATE;

  const current: Rates = {
    answer: pctToFraction(num(params, "a", fractionToPct(d.current.answer))),
    response: pctToFraction(
      num(params, "r", fractionToPct(d.current.response)),
    ),
    followup: pctToFraction(
      num(params, "f", fractionToPct(d.current.followup)),
    ),
    show: pctToFraction(num(params, "s", fractionToPct(d.current.show))),
    signing: pctToFraction(num(params, "g", fractionToPct(d.current.signing))),
  };
  const target: Rates = {
    answer: pctToFraction(num(params, "ta", fractionToPct(d.target.answer))),
    response: pctToFraction(
      num(params, "tr", fractionToPct(d.target.response)),
    ),
    followup: pctToFraction(
      num(params, "tf", fractionToPct(d.target.followup)),
    ),
    show: pctToFraction(num(params, "ts", fractionToPct(d.target.show))),
    signing: pctToFraction(num(params, "tg", fractionToPct(d.target.signing))),
  };

  const practiceArea = params.get("p") || d.practiceArea;

  return {
    inquiriesPerMonth: num(params, "i", d.inquiriesPerMonth),
    avgMatterValue: num(params, "v", d.avgMatterValue),
    closeRate: pctToFraction(num(params, "cl", fractionToPct(d.closeRate))),
    current,
    target,
    practiceArea,
  };
}
