#!/bin/bash
# Starts the dashboard container if needed and opens it in the default browser.
# Used by the desktop launcher; can also be run directly.
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
URL='http://localhost:4280'
export PATH="/usr/local/bin:/opt/homebrew/bin:$PATH"

notify() {
  osascript -e "display notification \"$1\" with title \"GitHub PR Dashboard\"" || true
}

fail() {
  notify "$1"
  echo "$1" >&2
  exit 1
}

wait_until() {
  local seconds=$1; shift
  for _ in $(seq "$seconds"); do
    "$@" >/dev/null 2>&1 && return 0
    sleep 1
  done
  return 1
}

if ! docker info >/dev/null 2>&1; then
  notify 'Iniciando Docker…'
  open -a Docker
  wait_until 120 docker info || fail 'Docker no arrancó a tiempo.'
fi

cd "$PROJECT_DIR"
# Builds the image only the first time; `docker compose up -d --build` picks up code changes.
docker compose up -d || fail 'No se pudo levantar el contenedor (ver docker compose logs).'

wait_until 30 curl -fsS "$URL" || fail "El dashboard no responde en $URL."
open "$URL"
