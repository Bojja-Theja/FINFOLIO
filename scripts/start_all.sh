#!/usr/bin/env bash
# FINFOLIO startup script – starts frontend, backend, and (optionally) ML service
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}") && pwd)/.."
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend-api"
ML_DIR="$ROOT_DIR/ml-service"
CONCURRENTLY_BIN="$ROOT_DIR/node_modules/.bin/concurrently"

# ─── Helpers ──────────────────────────────────────────────────────────────────
log() { echo "[FINFOLIO] $*"; }

# ─── pre-flight: concurrently must be installed ───────────────────────────────
if [[ ! -x "$CONCURRENTLY_BIN" ]]; then
  log "ERROR: concurrently is not installed. Run: npm install (in repo root)"
  exit 1
fi

# ─── Build backend (always fast, ~5 s) ────────────────────────────────────────
log "Building backend…"
(cd "$BACKEND_DIR" && npm run build)
log "Backend built ✓"

# ─── Build frontend only if no production build exists ────────────────────────
if [[ -f "$FRONTEND_DIR/.next/BUILD_ID" ]]; then
  log "Frontend already built – skipping rebuild (run npm run build:frontend to force)"
else
  log "Building frontend (first time, may take ~2 min)…"
  (cd "$FRONTEND_DIR" && npm run build)
  log "Frontend built ✓"
fi

# Remove stale Next.js lock if present
NEXT_LOCK="$FRONTEND_DIR/.next/lock"
if [[ -f "$NEXT_LOCK" ]]; then
  log "Removing stale frontend lock"
  rm -f "$NEXT_LOCK"
fi

# ─── Determine whether ML service is available ────────────────────────────────
ML_PYTHON=""
for candidate in "$ROOT_DIR/.venv/bin/python" \
                 "$ROOT_DIR/../CAPSTACK/.venv/bin/python" \
                 "$(which python3 2>/dev/null || true)"; do
  if [[ -x "$candidate" ]] && "$candidate" -c "import uvicorn" 2>/dev/null; then
    ML_PYTHON="$candidate"
    break
  fi
done

# ─── Build process list for concurrently ──────────────────────────────────────
PROCESSES=()
NAMES=()
COLORS=()

PROCESSES+=("cd '$FRONTEND_DIR' && npm run start")
NAMES+=("frontend")
COLORS+=("blue")

PROCESSES+=("cd '$BACKEND_DIR' && npm start")
NAMES+=("backend")
COLORS+=("green")

if [[ -n "$ML_PYTHON" ]]; then
  log "ML service available at $ML_PYTHON – starting ML service on port 8000"
  PROCESSES+=("cd '$ML_DIR' && '$ML_PYTHON' -m uvicorn app.main:app --host 0.0.0.0 --port 8000")
  NAMES+=("ml")
  COLORS+=("magenta")
else
  log "ML service skipped (no Python with uvicorn found – backend runs fine without it)"
fi

# Join arrays with concurrently separator
PROC_ARGS=()
for p in "${PROCESSES[@]}"; do PROC_ARGS+=("$p"); done

NAME_STR=$(IFS=,; echo "${NAMES[*]}")
COLOR_STR=$(IFS=,; echo "${COLORS[*]}")

log "Starting FINFOLIO services…"
log "  • Frontend  → http://localhost:3000"
log "  • Backend   → http://localhost:3001"
[[ -n "$ML_PYTHON" ]] && log "  • ML service→ http://localhost:8000"
echo ""

"$CONCURRENTLY_BIN" \
  --kill-others-on-fail \
  -n "$NAME_STR" \
  -c "$COLOR_STR" \
  "${PROC_ARGS[@]}"