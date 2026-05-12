#!/usr/bin/env bash
set -euo pipefail
BASE=${BASE:-http://127.0.0.1:3000}
COOKIES=$(mktemp)
trap 'rm -f "$COOKIES"' EXIT
curl -sf -c "$COOKIES" "$BASE/api/cart" >/dev/null
curl -sf -b "$COOKIES" -c "$COOKIES" -H 'content-type: application/json' \
  -d '{"action":"add","id":1,"quantity":2}' "$BASE/api/cart" >/dev/null
cart_json=$(curl -sf -b "$COOKIES" "$BASE/api/cart")
printf '%s\n' "$cart_json"
printf '%s' "$cart_json" | grep -q '"itemCount":2'
order_json=$(curl -sf -b "$COOKIES" -c "$COOKIES" -H 'content-type: application/json' \
  -d '{"cryptoCurrency":"BTC","walletAddress":"bc1qtest"}' "$BASE/api/orders")
printf '%s\n' "$order_json"
printf '%s' "$order_json" | grep -q '"status":"pending"'
echo OK
