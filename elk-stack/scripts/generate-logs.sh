#!/bin/bash
# ════════════════════════════════════════════════════════════════
# generate-logs.sh
#
# Generates realistic sample log entries into the logs/ directory.
# Run this while the ELK stack is up to see logs flow through:
#
#   logs/ → Filebeat → Logstash → Elasticsearch → Kibana
#
# Usage:
#   chmod +x scripts/generate-logs.sh
#   ./scripts/generate-logs.sh
#
# Stop with Ctrl+C. Logs are written to:
#   logs/access.log — Apache Combined Log Format
#   logs/app.log    — JSON application logs
#   logs/error.log  — Plain text error logs
# ════════════════════════════════════════════════════════════════

set -e

LOGS_DIR="$(dirname "$0")/../logs"
ACCESS_LOG="$LOGS_DIR/access.log"
APP_LOG="$LOGS_DIR/app.log"
ERROR_LOG="$LOGS_DIR/error.log"

mkdir -p "$LOGS_DIR"

# ── Sample data pools ─────────────────────────────────────────────
IPS=("192.168.1.10" "10.0.0.42" "172.16.0.5" "203.0.113.20" "198.51.100.7" "185.199.108.1")
METHODS=("GET" "GET" "GET" "GET" "POST" "PUT" "DELETE")
PATHS=(
  "/" "/api/v1/users" "/api/v1/products" "/api/v1/orders"
  "/health" "/login" "/dashboard" "/static/main.js" "/static/style.css"
  "/admin" "/api/v1/users/123" "/api/v1/products/42"
)
CODES=(200 200 200 200 200 201 301 400 401 403 404 500)
SERVICES=("auth-service" "product-service" "order-service" "gateway" "scheduler")
LOG_LEVELS=("INFO" "INFO" "INFO" "WARN" "ERROR")
ERRORS=(
  "Connection timeout to database"
  "Failed to parse request body"
  "Rate limit exceeded for IP"
  "Disk usage above 90%"
  "Circuit breaker opened for downstream service"
)

USER_AGENT="Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ELK Stack Log Generator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Access logs → $ACCESS_LOG"
echo "  App logs    → $APP_LOG"
echo "  Error logs  → $ERROR_LOG"
echo ""
echo "  Press Ctrl+C to stop"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

COUNT=0

while true; do
  # ── Apache Access Log ──────────────────────────────────────────
  IP="${IPS[$RANDOM % ${#IPS[@]}]}"
  METHOD="${METHODS[$RANDOM % ${#METHODS[@]}]}"
  PATH_="${PATHS[$RANDOM % ${#PATHS[@]}]}"
  CODE="${CODES[$RANDOM % ${#CODES[@]}]}"
  BYTES=$((RANDOM % 8192 + 128))
  DATE=$(date +"%d/%b/%Y:%H:%M:%S %z")

  echo "$IP - - [$DATE] \"$METHOD $PATH_ HTTP/1.1\" $CODE $BYTES \"-\" \"$USER_AGENT\"" >> "$ACCESS_LOG"

  # ── JSON App Log ───────────────────────────────────────────────
  SERVICE="${SERVICES[$RANDOM % ${#SERVICES[@]}]}"
  LEVEL="${LOG_LEVELS[$RANDOM % ${#LOG_LEVELS[@]}]}"
  REQUEST_ID=$(cat /proc/sys/kernel/random/uuid 2>/dev/null || echo "$(date +%s)-$RANDOM")
  ISO_DATE=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
  DURATION=$((RANDOM % 500 + 5))

  printf '{"timestamp":"%s","level":"%s","service":"%s","request_id":"%s","message":"Processed request %s %s","duration_ms":%d,"status":%d}\n' \
    "$ISO_DATE" "$LEVEL" "$SERVICE" "$REQUEST_ID" "$METHOD" "$PATH_" "$DURATION" "$CODE" >> "$APP_LOG"

  # ── Error Log (less frequent) ──────────────────────────────────
  if (( RANDOM % 5 == 0 )); then
    ERROR="${ERRORS[$RANDOM % ${#ERRORS[@]}]}"
    ERR_DATE=$(date +"%Y-%m-%d %H:%M:%S")
    echo "[$ERR_DATE] ERROR [$SERVICE] $ERROR" >> "$ERROR_LOG"
  fi

  COUNT=$((COUNT + 1))
  printf "\r  Events written: %d" "$COUNT"

  sleep 1
done
