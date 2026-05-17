#!/usr/bin/env sh
set -eu

ROOT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
RUN_DIR="${RUN_DIR:-$ROOT_DIR/.run}"
PID_FILE="${PID_FILE:-$RUN_DIR/qurbanir-haat.pid}"

if [ ! -f "$PID_FILE" ]; then
  echo "Qurbanir Haat is not running; no PID file found."
  exit 0
fi

PID=$(cat "$PID_FILE" 2>/dev/null || true)
if [ -z "$PID" ]; then
  rm -f "$PID_FILE"
  echo "Removed empty PID file."
  exit 0
fi

if ! kill -0 "$PID" 2>/dev/null; then
  rm -f "$PID_FILE"
  echo "Removed stale PID file for PID $PID."
  exit 0
fi

kill "$PID"

i=0
while [ "$i" -lt 30 ]; do
  if ! kill -0 "$PID" 2>/dev/null; then
    rm -f "$PID_FILE"
    echo "Stopped Qurbanir Haat."
    exit 0
  fi
  i=$((i + 1))
  sleep 1
done

kill -9 "$PID" 2>/dev/null || true
rm -f "$PID_FILE"
echo "Force-stopped Qurbanir Haat."
