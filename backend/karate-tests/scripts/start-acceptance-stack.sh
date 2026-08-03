#!/usr/bin/env bash
# Arranca Mongo de aceptación (Testcontainers-style) + seed + contenedor API.
# Escribe backend/karate-tests/acceptance.env con variables para Karate/Jenkins.
# Health y seed usan la red Docker (no localhost) para funcionar con Jenkins-in-Docker.
set -euo pipefail

KARATE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BACKEND_DIR="$(cd "$KARATE_DIR/.." && pwd)"

IMAGE_NAME="${IMAGE_NAME:-customerservice-backend}"
IMAGE_TAG="${IMAGE_TAG:?IMAGE_TAG is required}"
ACCEPTANCE_PORT="${ACCEPTANCE_PORT:-15001}"
ACCEPTANCE_MONGO_PORT="${ACCEPTANCE_MONGO_PORT:-27018}"
ACCEPTANCE_CONTAINER="${ACCEPTANCE_CONTAINER:-backend-acceptance}"
ACCEPTANCE_MONGO_CONTAINER="${ACCEPTANCE_MONGO_CONTAINER:-backend-acceptance-mongo}"
JWT_SECRET="${JWT_SECRET:-supersecretkey123456789}"
NETWORK_NAME="${ACCEPTANCE_NETWORK:-acceptance-net}"
SEED_OUT="${KARATE_DIR}/acceptance-seed.out"
ENV_OUT="${KARATE_DIR}/acceptance.env"

echo "Starting acceptance Mongo on port ${ACCEPTANCE_MONGO_PORT}..."
docker rm -f "$ACCEPTANCE_MONGO_CONTAINER" "$ACCEPTANCE_CONTAINER" 2>/dev/null || true
docker network create "$NETWORK_NAME" 2>/dev/null || true

export ACCEPTANCE_MONGO_PORT
docker compose -f "$KARATE_DIR/docker-compose.acceptance.yml" up -d

echo "Waiting for Mongo health..."
for i in $(seq 1 40); do
  if docker exec "$ACCEPTANCE_MONGO_CONTAINER" mongosh --quiet --eval "db.adminCommand('ping').ok" 2>/dev/null | grep -q 1; then
    break
  fi
  sleep 2
done

export KARATE_ADMIN_EMAIL="${KARATE_ADMIN_EMAIL:-superadmin@lakewood.com}"
export KARATE_ADMIN_PASSWORD="${KARATE_ADMIN_PASSWORD:-admin123}"

echo "Seeding acceptance DB (via Docker network)..."
docker run --rm \
  --network "$NETWORK_NAME" \
  -v "${BACKEND_DIR}:/app" \
  -w /app \
  -e MONGODB_URI="mongodb://${ACCEPTANCE_MONGO_CONTAINER}:27017/acceptance" \
  -e KARATE_ADMIN_EMAIL \
  -e KARATE_ADMIN_PASSWORD \
  node:20-alpine \
  node scripts/seedAcceptanceDb.js | tee "$SEED_OUT"

PROJECT_ID="$(grep '^KARATE_PROJECT_ID=' "$SEED_OUT" | cut -d= -f2)"
if [ -z "$PROJECT_ID" ]; then
  echo "Failed to parse KARATE_PROJECT_ID from seed output"
  exit 1
fi

echo "Starting API container ${ACCEPTANCE_CONTAINER}..."
docker run -d \
  --name "$ACCEPTANCE_CONTAINER" \
  --network "$NETWORK_NAME" \
  -p "${ACCEPTANCE_PORT}:5000" \
  -e NODE_ENV=development \
  -e PORT=5000 \
  -e MONGODB_URI="mongodb://${ACCEPTANCE_MONGO_CONTAINER}:27017/acceptance" \
  -e JWT_SECRET="$JWT_SECRET" \
  -e FRONTEND_URL="${FRONTEND_URL:-http://localhost:5173}" \
  -e PUBLIC_URL="${PUBLIC_URL:-http://localhost:${ACCEPTANCE_PORT}}" \
  --restart no \
  "${IMAGE_NAME}:${IMAGE_TAG}"

echo "Waiting for API health (docker exec)..."
for i in $(seq 1 40); do
  if docker exec "$ACCEPTANCE_CONTAINER" node -e "fetch('http://127.0.0.1:5000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))" 2>/dev/null; then
    # URL usable desde un contenedor en la misma red Docker (Jenkins-in-Docker)
    cat > "$ENV_OUT" <<EOF
KARATE_BASE_URL=http://${ACCEPTANCE_CONTAINER}:5000
KARATE_DOCKER_NETWORK=${NETWORK_NAME}
KARATE_PROJECT_ID=${PROJECT_ID}
KARATE_ADMIN_EMAIL=${KARATE_ADMIN_EMAIL}
KARATE_ADMIN_PASSWORD=${KARATE_ADMIN_PASSWORD}
EOF
    echo "API health OK — wrote ${ENV_OUT}"
    cat "$ENV_OUT"
    exit 0
  fi
  sleep 3
done

echo "API failed to become healthy"
docker logs "$ACCEPTANCE_CONTAINER" || true
exit 1
