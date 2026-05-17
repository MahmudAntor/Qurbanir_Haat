#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
RUN_DIR="${RUN_DIR:-$ROOT_DIR/.run}"
PID_FILE="${PID_FILE:-$RUN_DIR/qurbanir-haat.pid}"
LOG_DIR="${LOG_DIR:-$ROOT_DIR/logs}"
LOG_FILE="${LOG_FILE:-$LOG_DIR/qurbanir-haat.server.log}"
CONSOLE_LOG_FILE="${CONSOLE_LOG_FILE:-$LOG_DIR/qurbanir-haat.console.log}"
HEALTH_BODY_FILE="${HEALTH_BODY_FILE:-$LOG_DIR/qurbanir-haat.health.html}"
ENV_FILE="${ENV_FILE:-$ROOT_DIR/.env}"

mkdir -p "$RUN_DIR" "$LOG_DIR"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE" 2>/dev/null || true)
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    echo "Qurbanir Haat is already running with PID $PID."
    exit 0
  fi
  rm -f "$PID_FILE"
fi

if ! command -v node >/dev/null 2>&1; then
  echo "node is not available on PATH." >&2
  exit 1
fi

if [ ! -f "$ROOT_DIR/.output/server/index.mjs" ]; then
  echo "Missing .output/server/index.mjs. Run npm ci && npm run build first." >&2
  exit 1
fi

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ENV_FILE"
  set +a
fi

MISSING_CONFIG=""
if [ -z "${SUPABASE_URL:-${VITE_SUPABASE_URL:-}}" ]; then
  MISSING_CONFIG="SUPABASE_URL"
fi
if [ -z "${SUPABASE_PUBLISHABLE_KEY:-${VITE_SUPABASE_PUBLISHABLE_KEY:-}}" ]; then
  if [ -n "$MISSING_CONFIG" ]; then
    MISSING_CONFIG="$MISSING_CONFIG, SUPABASE_PUBLISHABLE_KEY"
  else
    MISSING_CONFIG="SUPABASE_PUBLISHABLE_KEY"
  fi
fi
if [ -n "$MISSING_CONFIG" ]; then
  echo "Missing required Supabase config: $MISSING_CONFIG. Add it to .env or the server environment, then restart." >&2
  exit 1
fi

cd "$ROOT_DIR"
NODE_ENV="${NODE_ENV:-production}" PORT="${PORT:-3000}" LOG_FILE="$LOG_FILE" \
  nohup node .output/server/index.mjs >>"$CONSOLE_LOG_FILE" 2>&1 &
PID=$!
echo "$PID" >"$PID_FILE"

fail_start() {
  kill "$PID" 2>/dev/null || true
  rm -f "$PID_FILE"
  echo "$1 Check $LOG_FILE, $CONSOLE_LOG_FILE, and $HEALTH_BODY_FILE." >&2
  exit 1
}

HEALTH_URL="http://127.0.0.1:${PORT:-3000}/"
HEALTHY=0
LAST_ERROR=""

i=0
while [ "$i" -lt 20 ]; do
  sleep 1
  if ! kill -0 "$PID" 2>/dev/null; then
    fail_start "Qurbanir Haat exited before it became healthy."
  fi

  if command -v curl >/dev/null 2>&1; then
    BODY=$(curl -fsS "$HEALTH_URL" 2>/tmp/qurbanir-haat-health.err || true)
    if [ -n "$BODY" ]; then
      if printf "%s" "$BODY" | grep -q "This page didn't load"; then
        printf "%s" "$BODY" >"$HEALTH_BODY_FILE"
        fail_start "Qurbanir Haat started but rendered the fallback error page."
      fi
      rm -f "$HEALTH_BODY_FILE"
      HEALTHY=1
      break
    fi
    LAST_ERROR=$(cat /tmp/qurbanir-haat-health.err 2>/dev/null || true)
  fi

  i=$((i + 1))
done

if [ "$HEALTHY" -ne 1 ] && command -v curl >/dev/null 2>&1; then
  fail_start "Qurbanir Haat did not respond at $HEALTH_URL. Last error: $LAST_ERROR."
fi

echo "Started Qurbanir Haat with PID $PID."
echo "URL: $HEALTH_URL"
echo "Server log: $LOG_FILE"
echo "Console log: $CONSOLE_LOG_FILE"
echo "Health body: $HEALTH_BODY_FILE"
