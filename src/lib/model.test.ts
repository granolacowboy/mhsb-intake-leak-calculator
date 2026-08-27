import { describe, it, expect } from "vitest";
import { computeLeak, clamp01, clampNonNeg, type Inputs } from "./model";
import { DEFAULTS } from "./presets";

const clone = (i: Inputs): Inputs => ({
  ...i,
  current: { ...i.current },
  target: { ...i.target },
});

describe("computeLeak - default worked example (MODEL.md)", () => {
  const r = computeLeak(DEFAULTS);

  it("matches the documented headline and stage breakdown", () => {
    expect(r.annualInquiries).toBe(600);
    expect(r.ev).toBe(3150);
    expect(r.currentCapturedRevenue).toBe(57154);
    expect(r.stages.map((s) => s.leak)).toEqual([
      25719, 17146, 20242, 8165, 12701,
    ]);
    expect(r.headlineLeak).toBe(83973);
    expect(r.recoverableMattersPerYear).toBe(26.7);
  });

  it("stage leaks sum exactly to the headline", () => {
    const sum = r.stages.reduce((a, s) => a + s.leak, 0);
    expect(sum).toBe(r.headlineLeak);
  });

  it("stage shares sum to about 100 percent", () => {
    const shareSum = r.stages.reduce((a, s) => a + s.sharePct, 0);
    expect(shareSum).toBeCloseTo(100, 6);
  });

  it("headline is well below the compounded all-at-target gain (conservative)", () => {
    const c = DEFAULTS.current;
    const t = DEFAULTS.target;
    const pc = c.answer * c.response * c.followup * c.show * c.signing;
    const pt = t.answer * t.response * t.followup * t.show * t.signing;
    const compounded = 600 * 3150 * (pt - pc);
    expect(r.headlineLeak).toBeLessThan(compounded);
  });
});

describe("computeLeak - edge cases and guards", () => {
  it("zero inquiries yields zero everywhere and no NaN", () => {
    const r = computeLeak({ ...clone(DEFAULTS), inquiriesPerMonth: 0 });
    expect(r.headlineLeak).toBe(0);
    expect(r.currentCapturedRevenue).toBe(0);
    expect(r.recoverableMattersPerYear).toBe(0);
    expect(r.stages.every((s) => s.leak === 0)).toBe(true);
    for (const s of r.stages) expect(Number.isFinite(s.leak)).toBe(true);
  });

  it("all current rates at 100 percent leaves nothing to recover", () => {
    const i = clone(DEFAULTS);
    i.current = { answer: 1, response: 1, followup: 1, show: 1, signing: 1 };
    const r = computeLeak(i);
    expect(r.currentConversion).toBe(1);
    expect(r.currentSignedPerYear).toBe(600);
    expect(r.headlineLeak).toBe(0);
  });

  it("target below current is clamped, never negative", () => {
    const i = clone(DEFAULTS);
    i.target = { answer: 0, response: 0, followup: 0, show: 0, signing: 0 };
    const r = computeLeak(i);
    expect(r.headlineLeak).toBe(0);
    expect(r.stages.every((s) => s.leak === 0)).toBe(true);
  });

  it("a mix of above and below target stays non-negative and additive", () => {
    const i = clone(DEFAULTS);
    // answer target below current (no leak), signing target well above.
    i.target.answer = 0.1;
    i.target.signing = 0.9;
    const r = computeLeak(i);
    const answer = r.stages.find((s) => s.key === "answer")!;
    const signing = r.stages.find((s) => s.key === "signing")!;
    expect(answer.leak).toBe(0);
    expect(signing.leak).toBeGreaterThan(0);
    expect(r.headlineLeak).toBeGreaterThanOrEqual(0);
    expect(r.stages.reduce((a, s) => a + s.leak, 0)).toBe(r.headlineLeak);
  });

  it("a zero current rate does not divide by zero (no-divide branch)", () => {
    const i = clone(DEFAULTS);
    i.current.answer = 0; // upstream stage fully broken
    const r = computeLeak(i);
    // Everything downstream multiplies by answer=0, so only the answer lever
    // can recover anything; the others are gated at zero.
    expect(Number.isFinite(r.headlineLeak)).toBe(true);
    expect(r.currentConversion).toBe(0);
    expect(r.currentCapturedRevenue).toBe(0);
    const answer = r.stages.find((s) => s.key === "answer")!;
    expect(answer.leak).toBeGreaterThan(0);
    for (const s of r.stages) {
      if (s.key !== "answer") expect(s.leak).toBe(0);
      expect(Number.isFinite(s.leak)).toBe(true);
    }
  });

  it("NaN, negative, and out-of-range inputs are sanitized", () => {
    const r = computeLeak({
      inquiriesPerMonth: Number.NaN,
      avgMatterValue: -5000,
      closeRate: 2, // > 1, clamps to 1
      current: {
        answer: Number.NaN,
        response: -1,
        followup: 5,
        show: 0.7,
        signing: 0.45,
      },
      target: {
        answer: 0.6,
        response: 0.7,
        followup: 0.7,
        show: 0.8,
        signing: 0.6,
      },
    });
    expect(Number.isFinite(r.headlineLeak)).toBe(true);
    expect(Number.isNaN(r.headlineLeak)).toBe(false);
    // NaN inquiries -> 0 -> nothing to recover, and -5000 matter value -> 0 EV.
    expect(r.headlineLeak).toBe(0);
    expect(r.ev).toBe(0);
  });

  it("absurd overrides clamp instead of overflowing", () => {
    const r = computeLeak({
      ...clone(DEFAULTS),
      inquiriesPerMonth: 1e9,
      avgMatterValue: 1e12,
    });
    expect(r.annualInquiries).toBe(100_000 * 12);
    expect(r.ev).toBe(0.9 * 10_000_000);
    expect(Number.isFinite(r.headlineLeak)).toBe(true);
  });

  it("rounding reconciles for several inputs", () => {
    const cases: Inputs[] = [
      DEFAULTS,
      { ...clone(DEFAULTS), inquiriesPerMonth: 137, avgMatterValue: 4213 },
      { ...clone(DEFAULTS), inquiriesPerMonth: 7, avgMatterValue: 99999 },
    ];
    for (const c of cases) {
      const r = computeLeak(c);
      const sum = r.stages.reduce((a, s) => a + s.leak, 0);
      expect(sum).toBe(r.headlineLeak);
    }
  });
});

describe("clamp helpers", () => {
  it("clamp01", () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(0)).toBe(0);
    expect(clamp01(0.5)).toBe(0.5);
    expect(clamp01(1)).toBe(1);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(Number.NaN)).toBe(0);
    expect(clamp01("x")).toBe(0);
    expect(clamp01("0.25")).toBe(0.25);
  });

  it("clampNonNeg", () => {
    expect(clampNonNeg(-1, 10)).toBe(0);
    expect(clampNonNeg(5, 10)).toBe(5);
    expect(clampNonNeg(20, 10)).toBe(10);
    expect(clampNonNeg(Number.NaN, 10)).toBe(0);
    expect(clampNonNeg(Infinity, 10)).toBe(10);
  });
});
