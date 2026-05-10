#!/usr/bin/env bash
# Smoke test — verifies the four endpoints work end-to-end.
# Run after `npm run dev` is up. Exits non-zero on any failure.
# Total runtime: ~10 seconds (no real model calls — uses local ollama if available, otherwise just hits health/verify endpoints).

set -e
BASE="${SERVER:-http://localhost:3000}"
PASS=0
FAIL=0

ok()   { echo "  ✓ $1";  PASS=$((PASS+1)); }
fail() { echo "  ✗ $1";  FAIL=$((FAIL+1)); }

echo "▌ smoke test against $BASE"

# 1 · health
echo "  [1/5] /api/health"
HEALTH=$(curl -sf "$BASE/api/health" || echo "FAIL")
if [ "$HEALTH" = "FAIL" ]; then fail "health endpoint unreachable"; exit 1; fi
echo "$HEALTH" | grep -q '"ok":true' && ok "ok flag" || fail "ok flag missing"
echo "$HEALTH" | grep -q '"providers"' && ok "providers block present" || fail "providers block missing"

# 2 · static / serves
echo "  [2/5] / (static html)"
HTML=$(curl -sf "$BASE/" | head -1)
[ "$HTML" = "<!doctype html>" ] && ok "static html served" || fail "html doctype missing"

# 3 · /api/oracle validation
echo "  [3/5] /api/oracle empty body returns JSON 400"
CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE/api/oracle" -H "Content-Type: application/json" -d '{}')
[ "$CODE" = "400" ] && ok "empty question → 400" || fail "expected 400 got $CODE"

# 4 · /api/oracle malformed JSON returns JSON 400 (not HTML)
echo "  [4/5] /api/oracle malformed JSON returns JSON 400"
RESP=$(curl -s -X POST "$BASE/api/oracle" -H "Content-Type: application/json" -d 'not json')
echo "$RESP" | grep -q '"error"' && ok "malformed JSON → JSON error" || fail "expected JSON error, got: $(echo "$RESP" | head -c 80)"

# 5 · /api/verify-cite happy path (real published cite)
echo "  [5/5] /api/verify-cite verified result on Bock Axelsen 2014"
VERIFY=$(curl -sf -X POST "$BASE/api/verify-cite" -H "Content-Type: application/json" -d '{"refs":"Bock Axelsen and Manrubia 2014"}')
echo "$VERIFY" | grep -q '"status":"verified"' && ok "Bock Axelsen 2014 → verified" || fail "expected verified, got: $(echo "$VERIFY" | head -c 200)"
echo "$VERIFY" | grep -q '10.1098/rspb.2014.1179' && ok "DOI matched" || fail "expected DOI 10.1098/rspb.2014.1179"

echo
echo "▌ result: $PASS pass · $FAIL fail"
exit $FAIL
