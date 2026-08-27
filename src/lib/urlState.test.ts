import { describe, it, expect } from "vitest";
import {
  encodeState,
  decodeState,
  DEFAULT_STATE,
  type FullState,
} from "./urlState";
import { computeLeak } from "./model";

describe("urlState round-trip", () => {
  it("encode then decode returns the default state", () => {
    const decoded = decodeState(encodeState(DEFAULT_STATE));
    expect(decoded).toEqual(DEFAULT_STATE);
  });

  it("preserves the headline leak across a round-trip", () => {
    const before = computeLeak(DEFAULT_STATE).headlineLeak;
    const after = computeLeak(decodeState(encodeState(DEFAULT_STATE)))
      .headlineLeak;
    expect(after).toBe(before);
    expect(after).toBe(83973);
  });

  it("round-trips a custom state exactly", () => {
    const custom: FullState = {
      inquiriesPerMonth: 120,
      avgMatterValue: 9500,
      closeRate: 0.85,
      practiceArea: "family",
      current: {
        answer: 0.35,
        response: 0.4,
        followup: 0.3,
        show: 0.65,
        signing: 0.5,
      },
      target: {
        answer: 0.7,
        response: 0.75,
        followup: 0.7,
        show: 0.85,
        signing: 0.6,
      },
    };
    const decoded = decodeState(encodeState(custom));
    expect(decoded).toEqual(custom);
    expect(computeLeak(decoded).headlineLeak).toBe(
      computeLeak(custom).headlineLeak,
    );
  });
});

describe("urlState decoding is total", () => {
  it("empty string yields defaults", () => {
    expect(decodeState("")).toEqual(DEFAULT_STATE);
  });

  it("leading question mark is tolerated", () => {
    expect(decodeState("?i=50")).toEqual(DEFAULT_STATE);
  });

  it("garbage parameters fall back to defaults", () => {
    const decoded = decodeState("i=abc&v=notmoney&a=xyz");
    expect(decoded.inquiriesPerMonth).toBe(DEFAULT_STATE.inquiriesPerMonth);
    expect(decoded.avgMatterValue).toBe(DEFAULT_STATE.avgMatterValue);
    expect(decoded.current.answer).toBe(DEFAULT_STATE.current.answer);
  });

  it("reads a valid overridden value", () => {
    const decoded = decodeState("i=200");
    expect(decoded.inquiriesPerMonth).toBe(200);
  });
});
