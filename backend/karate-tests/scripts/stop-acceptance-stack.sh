#!/usr/bin/env bash
# Detiene stack de aceptación. Usa `docker run` cleanup (sin docker compose)
# para agentes Jenkins sin Compose V2.
set -euo pipefail
ACCEPTANCE_CONTAINER="${ACCEPTANCE_CONTAINER:-backend-acceptance}"
ACCEPTANCE_MONGO_CONTAINER="${ACCEPTANCE_MONGO_CONTAINER:-backend-acceptance-mongo}"
NETWORK_NAME="${ACCEPTANCE_NETWORK:-acceptance-net}"

docker rm -f "$ACCEPTANCE_CONTAINER" 2>/dev/null || true
docker rm -f "$ACCEPTANCE_MONGO_CONTAINER" 2>/dev/null || true
docker network rm "$NETWORK_NAME" 2>/dev/null || true
echo "Acceptance stack stopped"
