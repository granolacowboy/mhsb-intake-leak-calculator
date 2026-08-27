# Intake Revenue Leak Calculator — Build Report

Date: 2026-08-26 · Status: built, verified, not deployed · Author: MHSB (with Claude Code)

## What this is

A standalone static web tool for mhsbsolutions.com. A firm owner enters their
intake numbers in about three minutes and sees an estimate of annual revenue
recoverable by closing intake gaps, decomposed across five leak stages. Zero
backend, client-side computation, URL-encoded shareable state, printable
summary, keyboard accessible, brand-tokened, no analytics, no email capture.

## Existence gate (fact)

Searched `~/projects`, `~/Documents`, and `gh repo list granolacowboy --limit 400`.
No prior build of the calculator or the readiness assessment exists. The only
adjacent repo is `intake-triage-mcp` (an MCP scoring server, not a marketing
tool). This was a fresh build, not a hardening pass.

## Stack decision (fact)

The live site `granolacowboy/mhsbsolutions-astro-gitty-` runs **Astro 5 static +
Tailwind v4 (CSS-first) + npm + Vercel**, dark mode off. This tool mirrors that
stack (Astro 5 static, npm, Vercel-ready) so it can merge into the site later.
It uses plain CSS with the brand tokens as custom properties rather than
Tailwind, to control every verified contrast pairing directly; the tokens map
1:1 to the site's `@theme` block. Client compute is vanilla TypeScript (no UI
framework): smallest bundle, CSP-clean (`script-src 'self'`).

## Brand decision (flagged)

The brief named brand skill **v4.3 (Coral/Slate, white-based)**; the live site
still ships **v4.2 cream** tokens. Roo chose to follow v4.3. This tool is built
to v4.3 using only its verified WCAG pairings. Bright coral `#f26c56` fails AA
as text (2.98:1 on white), so it is used for non-text accents only; text and the
CTA use pairings that pass AA (CTA is Dark Coral `#d95a45` with a white 1.2rem
bold label, 3.78:1 large-text AA). **Reconciliation needed at merge time:** the
current site is cream; either update the site to v4.3 or re-token this tool to
the v4.2 cream palette (which would require re-verifying contrast on cream, as
only `#be4a37` is pre-documented as AA on cream).

## Model

Full model and every coefficient are in `MODEL.md`. Each stage figure is an
independent single-lever gain (fix one stage to target, hold the rest at
current), valued at the current downstream conversion. The five figures sum, by
construction, to the headline; the framing is conservative (ignores compounding)
so it does not overclaim. Default screen shows ~$83,973 recoverable vs ~$57,154
captured (~1.5x) for a firm answering only 40% of calls.

Sourced vs assumption (shown in the UI as per-coefficient badges):

| Coefficient | Grade | Source |
|---|---|---|
| Current answer rate (40%) | SOURCED | Clio 2024 Legal Trends Report (Oct 2024) |
| Response speed matters | SOURCED (motivation only) | MIT/InsideSales 2007; HBR 2011 |
| Matter value reference ($341/$461/$135 per hour) | SOURCED (rate) | Clio Compare Lawyer Rates |
| Matter value, follow-up, no-show, signing, close, all targets | ASSUMPTION | no primary source; vendor starting points |

Three attribution traps are handled: the MIT 21x/100x is contact/qualify odds
and is never used as a conversion multiplier; Clio's 40% is labeled firm-level
(a per-call 35% figure is cited beside it, vendor-grade); ABA is used only to
state what it does not cover.

## Gates and evidence

| Gate / DoD item | Result | Evidence |
|---|---|---|
| G1: MODEL.md complete, every coefficient sourced or ASSUMPTION | PASS | `MODEL.md`, committed alone as first commit |
| G2: build passes, captured | PASS | `docs/build-output.txt` (exit 0) |
| Unit tests (model + URL state) | PASS | 22 tests: zero, 100%, overrides, NaN/Infinity, rounding reconciliation, no-divide branch, totality, URL round-trip |
| Smoke test (fills form, asserts result, share round-trip) | PASS | `tests/smoke.spec.ts`, 5 tests |
| a11y (axe-core, WCAG A/AA) | PASS | 0 violations on default, interacted, and empty states |
| Brand lint (client copy + rendered HTML) | PASS | 0 errors, 0 warnings |
| Type check (`astro check`) | PASS | 0 errors (1 hint: execCommand fallback) |
| Screenshot in docs/ | PASS | `docs/screenshot-desktop.png` |
| G3: skeptic attacks model + copy | PASS | see below |

**Lint scope:** the brand lint runs over client-visible strings only (the copy
module and rendered `dist` HTML). Internal docs (this report, MODEL.md, README)
are out of scope and may use dashes and vendor names.

## Gate 3: adversarial review (fact)

A skeptic subagent fuzzed the model with 221 structured hostile cases and
300,000 random iterations, plus an independent copy scan. A second subagent
reviewed the UI against the Vercel Web Interface Guidelines.

Held under attack: no NaN / Infinity / negative output from any input; no
divide-by-zero; the five-stage breakdown always reconciles to the headline
(max delta $0.00 over 300k); the model never multiplies by 21 or 100; copy is
free of em/en dashes, banned phrases, hype, and any phone number; every
displayed figure matches MODEL.md.

Findings, all fixed:

| ID | Severity | Issue | Fix |
|---|---|---|---|
| F1 | Medium | "Sourced" badge sat on a computed dollar that also depends on assumptions | Moved sourced/assumption grading onto the input coefficients; removed the result-row badges; added a basis note |
| M1 | Low | `computeLeak(null/{})` threw | Guarded containers; now total |
| U1 | Low | Form/URL did not echo clamped values | Clamp on commit and rewrite fields + URL |
| C1 | Low | "essentially" qualifier dropped from the 48% claim | Restored |
| C2 | Low | At-target stages rendered unexplained | Render the at-target note |
| UI-M1 | Medium | Share column lacked tabular-nums | Added |
| UI-M2 | Medium | Units/help not associated with inputs for screen readers | Added `aria-describedby` and visually-hidden units |
| UI-L3/L4/L6/L8 | Low | replaceState not debounced; target inputs unnamed; no submit guard; brand names not `translate="no"` | All applied |

Deliberately kept (documented decisions, not defects): tagline is Title Case
(brand slogan); font preload skipped (`font-display: swap` already prevents
blocking); reset has no undo (conventional for a calculator).

## Queued deploy actions (human, gated)

Nothing was deployed, pushed, or configured. To ship:

**Option A, standalone Vercel project (recommended):**
1. Create a GitHub repo under `granolacowboy` and push this local repo (currently
   no remote). This is a gated human action.
2. New Vercel project. Framework preset **Astro**. Build `npm run build`, output
   `dist`, install `npm install`. Node 24 (matches `.nvmrc`), or Vercel default.
3. **Environment variables: none.** No Sentry, no analytics, no secrets.
4. Domain / DNS: attach a subdomain such as `calculator.mhsbsolutions.com` (add
   the CNAME Vercel provides at the DNS host) or serve it at a path. DNS change
   is a gated human action.

**Option B, merge into the main site `mhsbsolutions-astro-gitty-`:**
1. Copy `src/lib/*` and the page into a route, e.g.
   `src/pages/tools/intake-revenue-leak-calculator/index.astro`.
2. Reconcile brand tokens (v4.3 white vs the site's v4.2 cream — see Brand
   decision above).
3. The tool needs no new CSP hosts. It relies on inline `style` attributes for
   the bar widths and inline module script, both allowed by the site's existing
   `style-src 'unsafe-inline'` and `script-src 'self'`. Fonts are self-hosted
   here; dedupe against the site's font loading.
4. Confirm the CTA target: it defaults to `https://www.mhsbsolutions.com/consultation/`
   (the only live consult route; no `/diagnostic/` route exists). Change the
   `DIAGNOSTIC_URL` constant in `src/lib/copy.ts` if a dedicated landing page is
   created.

## Notes and boundaries

- Practice-area matter-value presets are ASSUMPTION (illustrative), badged in the
  UI; Clio publishes hourly rates, not matter values. No invented number is
  presented as fact.
- Self-hosted fonts bundle all `@fontsource` subsets; only the Latin subset is
  fetched at runtime (unicode-range). Trimming to Latin-only imports is an
  optional size optimization.
- This report contains structure and counts only; no client names or case data.
- Repo has local commits on `main` and no remote. No push performed.
