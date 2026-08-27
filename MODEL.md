# Intake Revenue Leak Calculator — MODEL

Version 1.0 · Authored 2026-08-26 · Owner: MHSB Solutions

This document is the single source of truth for the calculator's math and every
coefficient it ships. Gate rule: this file is complete and each coefficient is
either sourced (with a dated citation) or marked **ASSUMPTION** and surfaced as
such in the UI, before any UI code is written. No unsourced benchmark is
presented as fact anywhere in the product.

---

## 1. What the tool computes, and what it does not

A law firm owner enters their intake funnel in about three minutes. The tool
estimates the **annual revenue the firm could recover by closing intake gaps**,
and shows where that revenue is leaking across five stages:

1. Unanswered calls and inquiries
2. Slow first response
3. Insufficient follow-up
4. Consultation no-shows
5. Unsigned engagement letters

The headline number is a **modeled estimate of recoverable revenue**, not a
promise. The tool never guarantees revenue, never claims a specific ROI, and
never presents an assumption as a measured fact. Every coefficient is
overridable; the estimate is only as good as the numbers the firm enters, and
the tool says so on screen.

**Framing chosen to avoid overclaiming.** The five stage figures are computed as
*independent single-lever gains* (see Section 3): each stage answers "if you
improved only this stage and changed nothing else downstream, how much more
signed-client revenue would you expect per year?" These are summed for the
headline. This is deliberately conservative: it values every recovered lead at
the firm's **current** downstream conversion, and it ignores the compounding
that fixing several stages at once would produce. The true simultaneous
potential is higher; we report the smaller, defensible sum.

---

## 2. Inputs

All rates are entered and displayed as percentages (0 to 100) and stored
internally as fractions (0 to 1). "Current" is the firm's status quo; "Target"
is an improved intake operation. Defaults are conservative and every one is
editable. Source grade is **SOURCED** (dated primary citation) or **ASSUMPTION**
(no primary source exists; shown badged in the UI).

| Key | Input (UI label) | Type / range | Current default | Target default | Grade of default | Notes |
|---|---|---|---|---|---|---|
| `inquiriesPerMonth` | New inquiries per month | integer, 0 to 100000 | 50 | n/a | ASSUMPTION | Calls + web forms + referrals that reach the firm. |
| `avgMatterValue` | Average value of a signed matter (USD) | number, 0 to 10000000 | 3500 | n/a | ASSUMPTION | Single biggest driver. UI prompts the firm to enter its own figure. Practice-area presets pre-fill an illustrative starting value (Section 5). |
| `practiceArea` | Practice area (preset) | enum | "General" | n/a | ASSUMPTION | Only pre-fills `avgMatterValue`. See Section 5. |
| `answerRate` | Calls / inquiries actually answered | percent | 40% | 58% | SOURCED (current) / ASSUMPTION (target) | Current 40% = Clio 2024 LTR (share of firms answering calls). Target 58% sits at the Clio 2019 real-world baseline of 56% (sourced reference), not an aspiration. Unit caveat in Section 4. |
| `responseCaptureRate` | Leads kept engaged by a prompt first response | percent | 50% | 65% | ASSUMPTION | Current set by the firm's first-response time band (Section 6a). Target is an adjustable benchmark. Motivated, not computed, by MIT 2007 / HBR 2011 (Section 4). |
| `followupCaptureRate` | Leads converted to a booked consult through follow-up | percent | 48% | 65% | ASSUMPTION | Current set by the firm's follow-up attempts (Section 6b). Target is an adjustable benchmark. |
| `consultShowRate` | Booked consults that are attended | percent | 70% | 80% | ASSUMPTION | Vendor starting point: 25 to 30% no-show for free consults, ~5% for paid. No primary source. |
| `signingRate` | Attended consults that sign an engagement letter | percent | 45% | 55% | ASSUMPTION | Vendor starting point: 40 to 50%+. No primary source. |
| `closeRate` | Signed matters that become paying / funded | percent | 90% | 90% | ASSUMPTION | Value scaler only (Section 3), not one of the five leak stages. Same in current and target. |

Targets are clamped so that `effectiveTarget = max(current, target)` per stage
(Section 7); a stage already at or above its target contributes zero leak, never
a negative.

---

## 3. The formula

Let annual inquiries `I = inquiriesPerMonth * 12`.

The five decomposed stages, in funnel order, with current rate `c_i` and
(clamped) target rate `t_i`:

| i | Stage | current `c_i` | target `t_i` |
|---|---|---|---|
| 1 | Answer | `answerRate` | target `answerRate` |
| 2 | Response | `responseCaptureRate` | target `responseCaptureRate` |
| 3 | Follow-up | `followupCaptureRate` | target `followupCaptureRate` |
| 4 | Show | `consultShowRate` | target `consultShowRate` |
| 5 | Signing | `signingRate` | target `signingRate` |

`closeRate` and `avgMatterValue` combine into the **effective value of one signed
engagement letter**:

```
EV = closeRate * avgMatterValue
```

**Current signed engagement letters per year:**

```
L_current = I * c1 * c2 * c3 * c4 * c5
```

**Current captured revenue per year:**

```
Rev_current = L_current * EV
```

**Per-stage recoverable leak (independent single-lever gain).** For stage `i`,
hold every other stage at its current rate and lift only stage `i` from `c_i` to
`t_i`. The extra signed letters per year are `I * (t_i - c_i) * PROD(c_j for
j != i)`, so:

```
Leak_i = I * EV * (t_i - c_i) * PROD_{j != i}(c_j)
       = I * EV * (t_i - c_i) * (Pc / c_i)      // when c_i > 0, where Pc = PROD(c_j)
```

If `c_i = 0`, compute `PROD_{j != i}(c_j)` directly (do not divide by zero).

**Headline recoverable revenue per year** is the sum of the independent levers:

```
Leak_total = SUM_{i=1..5} Leak_i
```

By construction the five stage figures sum exactly to the headline. This sum is
less than or equal to the full simultaneous potential
`I * EV * (t1*t2*t3*t4*t5 - c1*c2*c3*c4*c5)`, because it excludes compounding.
The tool notes this; it reports the conservative figure.

**Derived display values:**

- Current conversion rate `= c1*c2*c3*c4*c5` (inquiry to signed letter), shown as a percent.
- Recoverable signed matters per year `= Leak_total / EV` (guarded when `EV = 0`).
- Each stage's share of the headline `= Leak_i / Leak_total` (guarded when `Leak_total = 0`).

### Worked example (ships as the default screen)

Defaults: `I = 600/yr`, `EV = 0.90 * 3500 = 3150`, current
`c = [0.40, 0.50, 0.48, 0.70, 0.45]` (so `Pc = 0.03024`), target
`t = [0.58, 0.65, 0.65, 0.80, 0.55]`.

| Stage | `t_i - c_i` | `Pc / c_i` | `Leak_i` |
|---|---|---|---|
| Answer | 0.18 | 0.07560 | $25,719 |
| Response | 0.15 | 0.06048 | $17,146 |
| Follow-up | 0.17 | 0.06300 | $20,242 |
| Show | 0.10 | 0.04320 | $8,165 |
| Signing | 0.10 | 0.06720 | $12,701 |
| **Headline** | | | **$83,973** |

Current captured `= 600 * 0.03024 * 3150 = $57,154`. The default screen therefore
shows recoverable revenue of roughly **1.5x** current captured revenue, for a
firm that (by the sourced default) answers only 40% of its calls and follows up
once. This ratio is a deliberate design choice: the defaults describe a leaky
firm, anchored by the sourced 40% answer rate, and the number is an *estimate*
contingent on the firm's own, fully editable inputs. It is never stated as a
guarantee. A firm entering healthier current numbers sees a proportionally
smaller leak, which is the honest behavior.

---

## 4. Coefficient sourcing and the three attribution traps

| Coefficient / claim | Grade | Source (dated) | Exact figure | Guardrail |
|---|---|---|---|---|
| Current answer rate 40% | PRIMARY | Clio 2024 Legal Trends Report, 9th ed., released 2024-10-07 | 40% of firms answered calls (56% in 2019); 33% answered email; 48% essentially unreachable by phone | Firm-level mystery-shopper share, **not** a per-call rate. Labeled as such. |
| Per-call unanswered rate (corroboration) | VENDOR / PR-grade | Law Leaders "Silent Lines" study, 2025-08 (1,200 test calls) | 35% of calls to law firms go unanswered | Unit-correct per-call figure. Cited beside the Clio firm-level number, badged vendor-grade, so the unit basis is transparent either way. |
| Answer-rate context / realistic target | PRIMARY | Clio 2024 LTR | 2019 baseline 56% answered | Target is still ASSUMPTION; 56% shown as a real reference point. |
| First response speed matters | PRIMARY | MIT / InsideSales Lead Response Management Study, 2007 (Oldroyd, Elkington) | Calling in 5 min vs 30 min: 100x contact odds, 21x qualify odds | **These are contact and qualify odds, NOT conversion or close.** Used only as motivation for the response stage. Never plugged in as a conversion multiplier. |
| First response speed (corroboration) | PRIMARY (paywalled; figures second-hand) | HBR "The Short Life of Online Sales Leads," 2011 | Avg first response 42 hrs; 23% never respond; within 1 hr ~7x likelier meaningful conversation | Kept separate from the 2007 study's numbers. |
| Intake technology impact (copy support) | PRIMARY | Clio 2024 LTR | Firms using client-intake technology see ~50% more prospective clients and ~50% more revenue | Clio's own wording; a secondary blog inflated this to 51/52. Use 50/50. |
| Matter value reference frame | PRIMARY (rate) / ASSUMPTION (matter value) | Clio "Compare Lawyer Rates" | Overall average lawyer rate ~$341/hr (2024), ~$349 (2025); Corporate ~$461 high, Juvenile ~$135 low | Hourly **rate** is sourced. Total **matter value** is not published by Clio and is treated as ASSUMPTION (Section 5). |
| Response capture rate (all values) | ASSUMPTION | none (vendor folklore only) | see Section 6a | Badged ASSUMPTION in UI. |
| Follow-up capture rate (all values) | ASSUMPTION | Velocify-style vendor figures, unverified | see Section 6b | Badged ASSUMPTION in UI. |
| Consult show rate | ASSUMPTION | vendor blogs only | 70% default (25 to 30% no-show free consults) | Badged ASSUMPTION. |
| Signing rate | ASSUMPTION | vendor blogs only | 45% default (40 to 50%+ cited) | Badged ASSUMPTION. |
| Close rate | ASSUMPTION | none | 90% default | Badged ASSUMPTION. |

**Three traps, and how the model avoids each:**

1. **The 21x is not a conversion multiplier.** The 2007 study measured *contact*
   and *qualify* odds and explicitly did not measure close ratios. Vendor blogs
   misquote it as "21x more likely to convert." The model never multiplies
   revenue by 21x; response speed only moves a user-set capture rate.
2. **Clio's 40% is firm-level, not call-level.** It is the share of firms that
   answered a mystery-shopper call, not the share of all calls answered. The UI
   labels `answerRate` as "calls / inquiries actually answered" and cites the
   firm-level basis so the user calibrates to their own reality.
3. **ABA does not cover the intake funnel.** ABA TechReport / Legal Technology
   Survey figures are technology-adoption only. No answer-rate, response-speed,
   no-show, or conversion coefficient is attributed to the ABA. The "400% / 5
   min" stat floating around as "ABA" is a recycled third-party claim and is not
   used.

---

## 5. Practice-area presets (all ASSUMPTION)

Clio publishes hourly **rates** by practice area, not total **matter value**.
Total matter value depends on hours, fee model (hourly, flat, contingency), and
market, none of which Clio publishes. Therefore every preset value below is an
**ASSUMPTION**: an illustrative starting point, badged in the UI, that the firm
is expected to replace with its own average. Presets only pre-fill
`avgMatterValue`; they never feed a sourced claim.

The UI shows one sourced reference frame beside the field: "Clio 2024: average
lawyer rate about $341/hr, from roughly $461 (corporate) down to $135
(juvenile)." The preset numbers themselves are not attributed to Clio.

| Preset | Illustrative `avgMatterValue` (USD) | Basis (all assumption) |
|---|---|---|
| General (default) | 3500 | Round mid-market default. |
| Personal injury | 8000 | Contingency; high variance, illustrative net. |
| Family law | 6000 | Hourly, multi-session matter. |
| Estate planning | 2500 | Flat-fee package. |
| Criminal defense | 4000 | Flat or hourly. |
| Immigration | 4500 | Flat per petition. |
| Business / corporate | 7500 | Higher hourly, longer matter. |
| Employment | 6500 | Hourly / contingency mix. |
| Real estate | 2800 | Transactional flat fee. |
| Bankruptcy | 3000 | Flat-fee consumer filing. |

These illustrative figures are not benchmarks and must not be cited as such.

---

## 6. Optional helper mappings (ASSUMPTION)

Both helpers are conveniences that pre-fill a capture rate the user can then
override. The underlying percentage is the source of truth; the mapping is
ASSUMPTION and badged.

### 6a. First-response time band to `responseCaptureRate`

| Band | Rate |
|---|---|
| Under 5 minutes | 90% |
| 5 to 30 minutes | 80% |
| 30 minutes to 1 hour | 70% |
| 1 to 24 hours | 50% |
| Over 24 hours | 30% |

Direction (faster is better) is supported by MIT 2007 and HBR 2011; the specific
percentages are not sourced.

### 6b. Follow-up attempts to `followupCaptureRate`

| Attempts before giving up | Rate |
|---|---|
| 1 | 48% |
| 2 to 3 | 70% |
| 4 to 5 | 85% |
| 6 or more | 93% |

Vendor commentary (Velocify-style) suggests roughly six attempts approach 90%+
contact; treated as ASSUMPTION.

---

## 7. Edge cases, guards, and rounding

The pure model function must be total (never throw, never return `NaN`).

- **Zero inquiries.** `I = 0` gives `L_current = 0`, every `Leak_i = 0`,
  `Leak_total = 0`. Display "0", not an error.
- **Rates at 0% or 100%.** All rates clamp to `[0, 1]`. If every current rate is
  100%, `Leak_total = 0` (nothing to recover). If a current rate is 0, the
  divide-by-`c_i` shortcut is skipped and the product over `j != i` is computed
  directly.
- **Target below current.** `effectiveTarget_i = max(c_i, t_i)`, so a stage at or
  above target yields `Leak_i = 0`, never negative.
- **Invalid / empty / NaN input.** Numeric parse failures resolve to a safe
  value: current rates and counts to 0, `avgMatterValue` to 0, targets to the
  current rate (zero leak), `closeRate` to 0. No `NaN` may propagate to display.
- **Negative input.** Clamped to 0 (rates and money cannot be negative).
- **Absurd overrides.** `inquiriesPerMonth` clamps to `[0, 100000]`,
  `avgMatterValue` to `[0, 10000000]`. Out-of-range values are clamped, not
  rejected silently; the field shows the clamped value.
- **Money rounding.** Compute in full precision. Round each `Leak_i` to the
  nearest whole dollar for display, and define the displayed headline as the sum
  of the rounded stage values, so the breakdown always reconciles to the total.
  Client counts display to one decimal place.
- **Percent rounding.** Display derived percentages to one decimal place;
  compute from unrounded fractions.

---

## 8. What the copy must never say

Aligned with the MHSB brand banned-phrase and anti-hype rules: no "guaranteed
ROI" or specific revenue promise, no "instant results," no "revolutionary,"
no dashes (em or en) in any client-visible string. The headline is framed as an
*estimate* of *recoverable* revenue, contingent on the firm's own inputs, with a
visible statement that assumptions are the firm's to change and that no outcome
is guaranteed. Any figure drawn from an ASSUMPTION coefficient is shown with its
badge; only Section 4 PRIMARY figures are stated as fact, each with its citation.

**Lint scope.** The brand lint (banned phrases, legacy hexes, retired fonts, em
and en dashes) runs over **client-visible strings only**: the built `dist/` HTML
that a visitor reads, the print output, and the single copy module that feeds
them. Internal engineering docs (this MODEL.md, README, CALCULATOR_REPORT.md)
are out of scope and may use dashes and vendor names freely. This scope is
restated in CALCULATOR_REPORT.md so the QA gate does not trip on its own Gate 1
artifact.

---

## 9. Sources

Accessed 2026-08-26.

- Clio, 2024 Legal Trends Report (9th edition, 2024-10-07): answer rates, intake
  technology impact. https://www.clio.com/about/press/clio-latest-legal-trends-report/
  and https://www.clio.com/blog/highlights-from-2024-legal-trends-report/
- Clio, Compare Lawyer Rates (hourly rate by practice area):
  https://www.clio.com/resources/legal-trends/compare-lawyer-rates/
- MIT / InsideSales Lead Response Management Study, 2007 (Oldroyd, Elkington):
  contact and qualify odds by response speed.
  https://www.leadresponsemanagement.org/lrm_study/
- Harvard Business Review, "The Short Life of Online Sales Leads," 2011
  (Oldroyd, McElheran, Elkington): response-time audit (figures corroborated via
  secondary summaries; full text paywalled).
  https://hbr.org/2011/03/the-short-life-of-online-sales-leads
- ABA TechReport 2024 (referenced only to state what it does NOT cover):
  https://www.americanbar.org/groups/law_practice/resources/tech-report/2024/

Vendor starting points for ASSUMPTION coefficients (no primary source; recorded
for provenance only, never cited as fact in-product): LEXGRO, getstafi,
mylegalacademy, Velocify/Invesp recyclers. These informed default magnitudes and
nothing more.
