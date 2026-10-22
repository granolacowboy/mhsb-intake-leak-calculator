# HANDOFF: mhsb-intake-leak-calculator

type: kickoff
written: 2026-10-02 by claude-code
base: fix/intake-referer-leak @ 63cc25775ff5fb725c4572774948825daf197a16
status: kickoff scaffold on fix/intake-referer-leak; DoD unverified (todo); reverify before acting

## State snapshot (verified at write time; consumer must reverify)

- HEAD at write time: 63cc25775ff5fb725c4572774948825daf197a16
- Dirty files: clean (aside from the state/ scaffold added this session)
- Verification evidence: state/ scaffolded by handoff-core init-state.sh; this handoff gated by handoff-core validate-handoff.sh this session (PASS recorded in the session report).

## What is NOT done / not authorized

- definition_of_done items are unverified this session (no test or build suite was run this session); status is todo and the next session must verify before claiming done.
- No git push and no deploy were performed; push and deploy remain operator-gated per estate convention.
- Scaffold lands on fix/intake-referer-leak; merge to main and the live redeploy are operator-gated.

## Resume prompt

```text
Repo: mhsb-intake-leak-calculator (base 63cc25775ff5fb725c4572774948825daf197a16, branch fix/intake-referer-leak). Standalone static Astro tool for mhsbsolutions.com that estimates a law firm's recoverable intake revenue across five stages; zero backend, no tracking. Reverify live state first: git status, git log -1, and run the project's verify command before acting. Then work the definition_of_done in state/PROJECT_STATE.json. Stop and escalate at any operator gate (push, deploy, credential provisioning, client-system mutation).
```
