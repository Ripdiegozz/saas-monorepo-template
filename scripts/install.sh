#!/bin/bash
set -e

# AIO install script for self-hosted deployment
# Usage: ./scripts/install.sh [aio|noproxy]

MODE="${1:-noproxy}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

# Check Docker
if ! command -v docker &> /dev/null; then
  echo "Docker is required. Install from https://docs.docker.com/get-docker/"
  exit 1
fi

if ! docker compose version &> /dev/null; then
  echo "Docker Compose is required. Install from https://docs.docker.com/compose/install/"
  exit 1
fi

# Create .env if missing
if [ ! -f .env ]; then
  echo "Creating .env from template..."
  cp apps/server/.env.example .env 2>/dev/null || true
  echo "Edit .env and set DATABASE_URL, BETTER_AUTH_SECRET, etc."
fi

echo "Starting stack (mode: $MODE)..."
if [ "$MODE" = "aio" ]; then
  docker compose -f infra/compose/compose.aio.yml up -d
else
  docker compose -f infra/compose/compose.noproxy.yml up -d
fi

echo "Done. UI: http://localhost:3000  API: http://localhost:4000"
echo "Run migrations: pnpm --filter @workspace/db db:migrate"
