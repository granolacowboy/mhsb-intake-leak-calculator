/**
 * Client-side controller. Reads the form, computes with the pure model, updates
 * the results and the URL, and wires copy / print / reset. No network, no
 * analytics. Values are clamped to model bounds and echoed back on commit, so
 * the fields and the share URL never misrepresent the estimate. Screen-reader
 * status and URL writes are debounced.
 */
import {
  computeLeak,
  STAGE_ORDER,
  clamp01,
  clampNonNeg,
  type Result,
} from "./model";
import { formatMoney, formatPercent, formatCount } from "./format";
import {
  PRACTICE_PRESETS,
  RESPONSE_BANDS,
  FOLLOWUP_BANDS,
  bandForRate,
} from "./presets";
import {
  encodeState,
  decodeState,
  DEFAULT_STATE,
  type FullState,
} from "./urlState";
import { COPY } from "./copy";

const MAX_INQ = 100000;
const MAX_MV = 10000000;

const byId = (id: string) => document.getElementById(id);
const pct = (f: number) => Math.round(f * 1000) / 10;

function inputVal(id: string, fallback: number): number {
  const el = byId(id) as HTMLInputElement | null;
  if (!el) return fallback;
  const n = Number(el.value);
  return Number.isFinite(n) ? n : fallback;
}

function selVal(id: string, fallback: string): string {
  const el = byId(id) as HTMLSelectElement | null;
  return el ? el.value : fallback;
}

function readForm(): FullState {
  const responseRate =
    RESPONSE_BANDS.find((b) => b.id === selVal("responseBand", ""))?.rate ??
    DEFAULT_STATE.current.response;
  const followupRate =
    FOLLOWUP_BANDS.find((b) => b.id === selVal("followupBand", ""))?.rate ??
    DEFAULT_STATE.current.followup;

  return {
    inquiriesPerMonth: inputVal("inquiries", DEFAULT_STATE.inquiriesPerMonth),
    avgMatterValue: inputVal("matterValue", DEFAULT_STATE.avgMatterValue),
    practiceArea: selVal("practiceArea", DEFAULT_STATE.practiceArea),
    closeRate: inputVal("closeRate", pct(DEFAULT_STATE.closeRate)) / 100,
    current: {
      answer: inputVal("answerRate", pct(DEFAULT_STATE.current.answer)) / 100,
      response: responseRate,
      followup: followupRate,
      show: inputVal("showRate", pct(DEFAULT_STATE.current.show)) / 100,
      signing: inputVal("signingRate", pct(DEFAULT_STATE.current.signing)) / 100,
    },
    target: {
      answer: inputVal("tAnswer", pct(DEFAULT_STATE.target.answer)) / 100,
      response: inputVal("tResponse", pct(DEFAULT_STATE.target.response)) / 100,
      followup: inputVal("tFollowup", pct(DEFAULT_STATE.target.followup)) / 100,
      show: inputVal("tShow", pct(DEFAULT_STATE.target.show)) / 100,
      signing: inputVal("tSigning", pct(DEFAULT_STATE.target.signing)) / 100,
    },
  };
}

/** Clamp every field to model bounds so the form and URL never lie. */
function normalize(s: FullState): FullState {
  const clampRates = (r: FullState["current"]) => ({
    answer: clamp01(r.answer),
    response: clamp01(r.response),
    followup: clamp01(r.followup),
    show: clamp01(r.show),
    signing: clamp01(r.signing),
  });
  return {
    inquiriesPerMonth: clampNonNeg(s.inquiriesPerMonth, MAX_INQ),
    avgMatterValue: clampNonNeg(s.avgMatterValue, MAX_MV),
    practiceArea: s.practiceArea,
    closeRate: clamp01(s.closeRate),
    current: clampRates(s.current),
    target: clampRates(s.target),
  };
}

function writeForm(s: FullState): void {
  const setV = (id: string, v: number) => {
    const el = byId(id) as HTMLInputElement | null;
    if (el) el.value = String(v);
  };
  const setS = (id: string, v: string) => {
    const el = byId(id) as HTMLSelectElement | null;
    if (el) el.value = v;
  };
  setV("inquiries", s.inquiriesPerMonth);
  setV("matterValue", s.avgMatterValue);
  setS("practiceArea", s.practiceArea);
  setV("closeRate", pct(s.closeRate));
  setV("answerRate", pct(s.current.answer));
  setS("responseBand", bandForRate(RESPONSE_BANDS, s.current.response).id);
  setS("followupBand", bandForRate(FOLLOWUP_BANDS, s.current.followup).id);
  setV("showRate", pct(s.current.show));
  setV("signingRate", pct(s.current.signing));
  setV("tAnswer", pct(s.target.answer));
  setV("tResponse", pct(s.target.response));
  setV("tFollowup", pct(s.target.followup));
  setV("tShow", pct(s.target.show));
  setV("tSigning", pct(s.target.signing));
}

function setText(id: string, text: string): void {
  const el = byId(id);
  if (el) el.textContent = text;
}

let statusTimer: number | undefined;
function scheduleStatus(r: Result): void {
  if (statusTimer) window.clearTimeout(statusTimer);
  statusTimer = window.setTimeout(() => {
    setText(
      "a11y-status",
      `${COPY.results.headlineLabel}: ${formatMoney(r.headlineLeak)} per year.`,
    );
  }, 500);
}

function renderPrintInputs(s: FullState): void {
  const dl = byId("print-inputs-dl");
  if (!dl) return;
  dl.textContent = "";
  const add = (dt: string, dd: string) => {
    const dtEl = document.createElement("dt");
    dtEl.textContent = dt;
    const ddEl = document.createElement("dd");
    ddEl.textContent = dd;
    dl.append(dtEl, ddEl);
  };
  add(COPY.form.inquiries.label, formatCount(s.inquiriesPerMonth));
  add(COPY.form.matterValue.label, formatMoney(s.avgMatterValue));
  add(COPY.form.answerRate.label, formatPercent(pct(s.current.answer)));
  add(
    COPY.form.responseTime.label,
    bandForRate(RESPONSE_BANDS, s.current.response).label,
  );
  add(
    COPY.form.followupAttempts.label,
    bandForRate(FOLLOWUP_BANDS, s.current.followup).label,
  );
  add(COPY.form.showRate.label, formatPercent(pct(s.current.show)));
  add(COPY.form.signingRate.label, formatPercent(pct(s.current.signing)));
  add(COPY.form.closeRate.label, formatPercent(pct(s.closeRate)));
}

function render(state: FullState): void {
  const r = computeLeak(state);
  setText("headline-number", formatMoney(r.headlineLeak));
  setText("captured-value", formatMoney(r.currentCapturedRevenue));
  setText("matters-value", formatCount(r.recoverableMattersPerYear));

  const empty = byId("empty-note");
  if (empty) (empty as HTMLElement).hidden = r.headlineLeak !== 0;

  for (const key of STAGE_ORDER) {
    const s = r.stages.find((x) => x.key === key);
    if (!s) continue;
    setText(`amount-${key}`, formatMoney(s.leak));
    const atTarget = s.target <= s.current;
    setText(
      `share-${key}`,
      atTarget
        ? COPY.results.atTargetNote
        : `${formatPercent(s.sharePct)} ${COPY.results.shareSuffix}`,
    );
    const seg = byId(`seg-${key}`);
    if (seg) (seg as HTMLElement).style.width = `${s.sharePct}%`;
  }

  renderPrintInputs(state);
  scheduleStatus(r);
}

function writeURLNow(state: FullState): void {
  try {
    history.replaceState(null, "", `${location.pathname}?${encodeState(state)}`);
  } catch {
    /* Some browsers throttle replaceState; the visible UI already reflects state. */
  }
}

let urlTimer: number | undefined;
function updateURL(state: FullState): void {
  if (urlTimer) window.clearTimeout(urlTimer);
  urlTimer = window.setTimeout(() => writeURLNow(state), 200);
}

function handleLive(): void {
  const state = normalize(readForm());
  render(state);
  updateURL(state);
}

function handleCommit(): void {
  const state = normalize(readForm());
  writeForm(state); // echo clamped values back into the fields
  render(state);
  updateURL(state);
}

function init(): void {
  const form = byId("calc-form") as HTMLFormElement | null;
  if (!form) return;

  const initial = normalize(decodeState(location.search));
  writeForm(initial);
  render(initial);
  // If arriving via a shared link, rewrite the URL to the clamped values.
  if (location.search) writeURLNow(initial);

  // Selecting a practice area pre-fills the matter value, then commits.
  const practice = byId("practiceArea") as HTMLSelectElement | null;
  practice?.addEventListener("change", () => {
    const preset = PRACTICE_PRESETS.find((p) => p.id === practice.value);
    const mv = byId("matterValue") as HTMLInputElement | null;
    if (preset && mv) mv.value = String(preset.matterValue);
    handleCommit();
  });

  form.addEventListener("input", handleLive);
  form.addEventListener("change", handleCommit);
  form.addEventListener("submit", (e) => e.preventDefault());

  byId("btn-reset")?.addEventListener("click", () => {
    writeForm(DEFAULT_STATE);
    render(DEFAULT_STATE);
    try {
      history.replaceState(null, "", location.pathname);
    } catch {
      /* ignore */
    }
  });

  byId("btn-print")?.addEventListener("click", () => window.print());

  byId("btn-copy")?.addEventListener("click", async () => {
    writeURLNow(normalize(readForm()));
    const btn = byId("btn-copy");
    try {
      await navigator.clipboard.writeText(location.href);
    } catch {
      const tmp = document.createElement("input");
      tmp.value = location.href;
      document.body.append(tmp);
      tmp.select();
      try {
        document.execCommand("copy");
      } catch {
        /* clipboard unavailable; the URL is already in the address bar */
      }
      tmp.remove();
    }
    if (btn) {
      btn.textContent = COPY.actions.copyLinkDone;
      window.setTimeout(() => {
        btn.textContent = COPY.actions.copyLink;
      }, 1800);
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
