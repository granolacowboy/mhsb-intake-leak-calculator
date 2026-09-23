# Contributing

This calculator is intentionally small, static, inspectable, and conservative. Contributions should preserve those properties.

## Before changing the math

`MODEL.md` is the source of truth. Any change to a coefficient, target, formula, or interpretation should:

1. update `MODEL.md` first;
2. distinguish sourced facts from assumptions;
3. include or update unit tests;
4. avoid turning directional research into a numeric claim it does not support.

The five stage estimates are independent single-lever gains. Do not silently change them into a compounded model or market a sum as guaranteed recoverable revenue.

## Verification

```bash
npm ci
npx playwright install chromium
npm run check
npm run verify
```

A PR affecting UI behavior should keep the Playwright smoke test and axe accessibility checks meaningful. Copy changes must pass the brand lint.

## Privacy and deployment

The production artifact is browser-only: no backend, analytics, tracking, email capture, or runtime network calls. A proposal to add any of those is an architectural change and should be called out explicitly rather than introduced as an incidental dependency.

Do not commit client, matter, analytics, or other personal data.
