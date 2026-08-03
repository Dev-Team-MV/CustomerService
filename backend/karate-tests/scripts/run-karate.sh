#!/usr/bin/env bash
# Ejecuta Karate en un contenedor Maven unido a la red Docker del API.
# Copia el proyecto a un volume Docker vía tar (Jenkins-in-Docker + docker.sock
# no puede montar rutas del workspace del contenedor Jenkins de forma fiable).
#
# Uso:
#   DOCKER_NETWORK=deploy_app-network BASE_URL=http://backend-dev:5000 ./run-karate.sh
set -euo pipefail

KARATE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DOCKER_NETWORK="${DOCKER_NETWORK:?DOCKER_NETWORK is required}"
BASE_URL="${BASE_URL:?BASE_URL is required}"
ADMIN_EMAIL="${KARATE_ADMIN_EMAIL:-superadmin@lakewood.com}"
ADMIN_PASSWORD="${KARATE_ADMIN_PASSWORD:-admin123}"
PROJECT_ID="${KARATE_PROJECT_ID:-69a73ce5b20401b061da6451}"
KARATE_TAGS="${KARATE_TAGS:---tags ~@external}"
MAVEN_IMAGE="${MAVEN_IMAGE:-maven:3.9.9-eclipse-temurin-17}"
M2_VOLUME="${KARATE_M2_VOLUME:-customerservice-karate-m2}"
WS_VOLUME="${KARATE_WS_VOLUME:-customerservice-karate-ws-$$}"

cleanup() {
  docker volume rm -f "$WS_VOLUME" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Running Karate on network=${DOCKER_NETWORK} baseUrl=${BASE_URL} tags=${KARATE_TAGS}"
echo "Karate dir (Jenkins workspace): ${KARATE_DIR}"

docker volume create "$M2_VOLUME" >/dev/null
docker volume create "$WS_VOLUME" >/dev/null

echo "Copying karate-tests into Docker volume ${WS_VOLUME}..."
tar -C "$KARATE_DIR" \
  --exclude='./target' \
  --exclude='./.git' \
  -cf - . \
  | docker run --rm -i -v "${WS_VOLUME}:/tests" alpine:3.20 \
      tar -C /tests -xf -

# Sanity check
docker run --rm -v "${WS_VOLUME}:/tests" alpine:3.20 test -f /tests/pom.xml

echo "Executing Maven in container..."
set +e
docker run --rm \
  --network "$DOCKER_NETWORK" \
  -v "${WS_VOLUME}:/tests" \
  -v "${M2_VOLUME}:/root/.m2" \
  -w /tests \
  "$MAVEN_IMAGE" \
  mvn -B test \
    "-Dkarate.options=${KARATE_TAGS}" \
    "-DbaseUrl=${BASE_URL}" \
    "-DadminEmail=${ADMIN_EMAIL}" \
    "-DadminPassword=${ADMIN_PASSWORD}" \
    "-DprojectId=${PROJECT_ID}"
MVN_EXIT=$?
set -e

echo "Copying reports back to workspace..."
mkdir -p "$KARATE_DIR/target"
docker run --rm -v "${WS_VOLUME}:/tests" alpine:3.20 \
  sh -c 'test -d /tests/target && tar -C /tests -cf - target || true' \
  | tar -C "$KARATE_DIR" -xf - 2>/dev/null || true

exit $MVN_EXIT
