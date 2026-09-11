#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_DIR="$ROOT_DIR/backend-api"
ML_DIR="$ROOT_DIR/ml-service"
PYTHON_BIN="$ROOT_DIR/.venv/bin/python"
CONCURRENTLY_BIN="$ROOT_DIR/node_modules/.bin/concurrently"
NEXT_LOCK_FILE="$FRONTEND_DIR/.next/lock"

if [[ ! -x "$CONCURRENTLY_BIN" ]]; then
  echo "concurrently is not installed in root node_modules. Run npm install at the repo root first."
  exit 1
fi

if [[ ! -x "$PYTHON_BIN" ]]; then
  echo "Python virtual environment not found at .venv. Create it before starting the stack."
  exit 1
fi

if [[ -f "$NEXT_LOCK_FILE" ]]; then
  # Remove only stale lock files. If an active process still owns the lock, fail clearly.
  if command -v lsof >/dev/null 2>&1 && lsof "$NEXT_LOCK_FILE" >/dev/null 2>&1; then
    echo "A frontend build lock is active at $NEXT_LOCK_FILE."
    echo "Stop the running Next build process and run npm start again."
    exit 1
  fi

  echo "Removing stale frontend build lock at $NEXT_LOCK_FILE"
  rm -f "$NEXT_LOCK_FILE"
fi

echo "Building frontend..."
(cd "$FRONTEND_DIR" && npm run build)

echo "Building backend..."
(cd "$BACKEND_DIR" && npm run build)

echo "Starting CAPSTACK services on localhost..."
"$CONCURRENTLY_BIN" \
  -k \
  -n frontend,backend,ml \
  -c blue,green,magenta \
  "cd '$FRONTEND_DIR' && npm run start" \
  "cd '$BACKEND_DIR' && npm start" \
  "cd '$ML_DIR' && '$PYTHON_BIN' -m uvicorn app.main:app --host 0.0.0.0 --port 8000"