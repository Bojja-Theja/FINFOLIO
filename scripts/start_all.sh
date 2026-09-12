#!/usr/bin/env bash
# FINFOLIO startup script – starts frontend, backend, and (optionally) ML service
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend-api"
ML_DIR="$ROOT_DIR/ml-service"
CONCURRENTLY_BIN="$ROOT_DIR/node_modules/.bin/concurrently"

# ─── Helpers ──────────────────────────────────────────────────────────────────
log() { echo "[FINFOLIO] $*"; }

# ─── pre-flight: concurrently must be installed ───────────────────────────────
if [[ ! -x "$CONCURRENTLY_BIN" ]]; then
  log "ERROR: concurrently not found. Run: npm install (in repo root)"
  exit 1
fi

# ─── Build backend (always fast, ~5 s) ────────────────────────────────────────
log "Building backend..."
( cd "$BACKEND_DIR" && npm run build )
log "Backend built OK"

# ─── Build frontend only if no production build exists ────────────────────────
if [[ -f "$FRONTEND_DIR/.next/BUILD_ID" ]]; then
  log "Frontend already built – skipping rebuild"
else
  log "Building frontend (first time, may take ~2 min)..."
  ( cd "$FRONTEND_DIR" && npm run build )
  log "Frontend built OK"
fi

# Remove stale Next.js lock if present
NEXT_LOCK="$FRONTEND_DIR/.next/lock"
if [[ -f "$NEXT_LOCK" ]]; then
  log "Removing stale frontend lock"
  rm -f "$NEXT_LOCK"
fi

# ─── Free ports if occupied by stale processes ──────────────────────────────
for port in 3000 3001 8000; do
  pid=$(lsof -ti :"$port" 2>/dev/null || true)
  if [[ -n "$pid" ]]; then
    log "Releasing occupied port $port (PID $pid)..."
    kill "$pid" 2>/dev/null || true
    sleep 0.5
  fi
done

# ─── Auto-detect ML Python ────────────────────────────────────────────────────
ML_PYTHON=""
for candidate in \
    "$ROOT_DIR/.venv/bin/python" \
    "$ROOT_DIR/../FINFOLIO/.venv/bin/python" \
    "$(command -v python3 2>/dev/null || true)"; do
  if [[ -x "$candidate" ]] && "$candidate" -c "import uvicorn" 2>/dev/null; then
    ML_PYTHON="$candidate"
    break
  fi
done

# ─── Launch all services concurrently ─────────────────────────────────────────
log ""
log "Starting FINFOLIO services..."
log "  Frontend  -> http://localhost:3000"
log "  Backend   -> http://localhost:3001"
if [[ -n "$ML_PYTHON" ]]; then
  log "  ML        -> http://localhost:8000"
else
  log "  ML        -> skipped (no Python venv with uvicorn found)"
fi
log ""

if [[ -n "$ML_PYTHON" ]]; then
  "$CONCURRENTLY_BIN" \
    --kill-others-on-fail \
    -n "frontend,backend,ml" \
    -c "blue,green,magenta" \
    "cd '$FRONTEND_DIR' && npm run start" \
    "cd '$BACKEND_DIR' && npm start" \
    "cd '$ML_DIR' && '$ML_PYTHON' -m uvicorn app.main:app --host 0.0.0.0 --port 8000"
else
  "$CONCURRENTLY_BIN" \
    --kill-others-on-fail \
    -n "frontend,backend" \
    -c "blue,green" \
    "cd '$FRONTEND_DIR' && npm run start" \
    "cd '$BACKEND_DIR' && npm start"
fi