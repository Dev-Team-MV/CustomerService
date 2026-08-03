#!/usr/bin/env bash
set -euo pipefail
KARATE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ACCEPTANCE_CONTAINER="${ACCEPTANCE_CONTAINER:-backend-acceptance}"
ACCEPTANCE_MONGO_CONTAINER="${ACCEPTANCE_MONGO_CONTAINER:-backend-acceptance-mongo}"

docker rm -f "$ACCEPTANCE_CONTAINER" 2>/dev/null || true
docker compose -f "$KARATE_DIR/docker-compose.acceptance.yml" down -v 2>/dev/null || true
docker rm -f "$ACCEPTANCE_MONGO_CONTAINER" 2>/dev/null || true
echo "Acceptance stack stopped"
