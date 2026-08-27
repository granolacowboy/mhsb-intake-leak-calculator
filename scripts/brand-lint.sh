#!/usr/bin/env bash
# Brand compliance gate for client-visible copy only.
# Scope (per MODEL.md section 8): the copy module and the rendered dist HTML.
# Internal docs (MODEL.md, README, CALCULATOR_REPORT.md) are intentionally out
# of scope and may use dashes and vendor names.
set -uo pipefail
cd "$(dirname "$0")/.."

CFG="brand-config.json"
LINT="scripts/brand_lint.py"
fail=0

echo "== brand lint: copy module =="
python3 "$LINT" "$CFG" src/lib/copy.ts --ext .ts "$@" || fail=1

if [ -d dist ]; then
  echo "== brand lint: rendered HTML =="
  # dist/ is excluded by directory name in the linter, so stage the HTML under a
  # non-excluded folder and lint that.
  rm -rf .brandlint
  mkdir -p .brandlint
  i=0
  while IFS= read -r -d '' f; do
    cp "$f" ".brandlint/page_${i}.html"
    i=$((i + 1))
  done < <(find dist -name '*.html' -print0)
  python3 "$LINT" "$CFG" .brandlint --ext .html "$@" || fail=1
  rm -rf .brandlint
else
  echo "note: dist/ not found; run 'npm run build' to also lint rendered HTML."
fi

if [ "$fail" -ne 0 ]; then
  echo "brand lint: FAIL"
  exit 1
fi
echo "brand lint: clean"
