# Decision ledger: mhsb-intake-leak-calculator

Append-only. One entry per decision that gates or shapes work; referenced by `state/PROJECT_STATE.json` `decisions_ref`. Newest entry last. Never rewrite history; supersede with a new entry.

## 2026-10-02 handoff-core state scaffold

- decision: state/ scaffolded via handoff-core init-state, validated, and committed locally on branch fix/intake-referer-leak.
- by: claude-code (docs-standardization lane)
- why: estate-consolidation docs standardization so every repo carries a cross-harness state/ scaffold.
- evidence: handoff-core init-state.sh plus validate-handoff.sh; base 63cc25775ff5fb725c4572774948825daf197a16
