#!/bin/bash
set -e

# Development Docker helper
# Usage: ./scripts/dev.sh [up|down|stop|start|check]
#
#   up    - Create and start all containers (compose up -d)
#   down  - Stop and remove containers, networks, volumes
#   stop  - Stop containers (compose stop)
#   start - Start existing containers (compose start)
#   check - Run typecheck (pnpm --filter web typecheck && pnpm --filter server typecheck)

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${REPO_ROOT}/compose.dev.yml"
cd "$REPO_ROOT"

cmd="${1:-}"

if [ -z "$cmd" ]; then
  echo "Usage: ./scripts/dev.sh [up|down|stop|start|check]"
  echo ""
  echo "  up    - Create and start all containers"
  echo "  down  - Stop and remove containers, networks, volumes"
  echo "  stop  - Stop containers"
  echo "  start - Start existing containers"
  echo "  check - Run typecheck on web and server"
  exit 1
fi

case "$cmd" in
  check)
    echo "Running typecheck..."
    pnpm --filter web typecheck && pnpm --filter server typecheck
    echo "Typecheck passed."
    exit 0
    ;;
esac

if ! command -v docker &> /dev/null; then
  echo "Docker is required. Install from https://docs.docker.com/get-docker/"
  exit 1
fi

if ! docker compose version &> /dev/null; then
  echo "Docker Compose is required. Install from https://docs.docker.com/compose/install/"
  exit 1
fi

case "$cmd" in
  up)
    echo "Starting development stack (migrate → server → web, waiting for ready)..."
    docker compose -f "$COMPOSE_FILE" up -d --wait
    echo ""
    echo "Done. Web: http://localhost:3000  API: http://localhost:4000"
    ;;
  down)
    echo "Stopping and removing containers, networks, volumes..."
    docker compose -f "$COMPOSE_FILE" down -v
    echo "Done."
    ;;
  stop)
    echo "Stopping containers..."
    docker compose -f "$COMPOSE_FILE" stop
    echo "Done."
    ;;
  start)
    echo "Starting existing containers..."
    docker compose -f "$COMPOSE_FILE" start
    echo "Done. Web: http://localhost:3000  API: http://localhost:4000"
    ;;
  *)
    echo "Unknown command: $cmd"
    echo "Use: up, down, stop, start, or check"
    exit 1
    ;;
esac
