#!/usr/bin/env bash
# Ejecuta Karate en un contenedor Maven unido a la red Docker del API.
# Evita el problema Jenkins-in-Docker donde localhost:<hostPort> no alcanza el servicio.
#
# Uso:
#   DOCKER_NETWORK=deploy_app-network BASE_URL=http://backend-dev:5000 ./run-karate.sh
#   DOCKER_NETWORK=acceptance-net BASE_URL=http://backend-acceptance:5000 ./run-karate.sh
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

echo "Running Karate on network=${DOCKER_NETWORK} baseUrl=${BASE_URL} tags=${KARATE_TAGS}"

docker volume create "$M2_VOLUME" >/dev/null

docker run --rm \
  --network "$DOCKER_NETWORK" \
  -v "${KARATE_DIR}:/tests" \
  -v "${M2_VOLUME}:/root/.m2" \
  -w /tests \
  -e MAVEN_OPTS="-Dstyle.color=always" \
  "$MAVEN_IMAGE" \
  mvn -B test \
    "-Dkarate.options=${KARATE_TAGS}" \
    "-DbaseUrl=${BASE_URL}" \
    "-DadminEmail=${ADMIN_EMAIL}" \
    "-DadminPassword=${ADMIN_PASSWORD}" \
    "-DprojectId=${PROJECT_ID}"
