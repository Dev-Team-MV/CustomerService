# Backend acceptance tests (Karate)

Suite amplia de API (`@wide`) más smoke (`@smoke`). Por defecto se excluyen escenarios `@external` (GCS/Twilio).

## Prerequisites

- JDK 17+
- Backend reachable (`npm run start` / Docker)
- Para gate aislado: Docker + Docker Compose

Maven via `./mvnw` (no hace falta Maven global).

## Run against a running API

```bash
./mvnw test \
  -DbaseUrl=http://localhost:5001 \
  -DadminEmail=superadmin@lakewood.com \
  -DadminPassword=admin123 \
  -DprojectId=<mongoProjectId>
```

Solo smoke:

```bash
./mvnw test -Dkarate.options="--tags @smoke" -DbaseUrl=http://localhost:5001 ...
```

Incluir externos (GCS):

```bash
./mvnw test -Dkarate.options="--tags @wide" ...
```

## Jenkins / Docker networking

Jenkins suele correr en un contenedor: `localhost:5001` **no** alcanza puertos publicados en el host.
Por eso el pipeline:

1. Comprueba health con `docker exec … fetch('http://127.0.0.1:5000/api/health')`
2. Ejecuta Karate con `scripts/run-karate.sh` en la misma red Docker (`deploy_app-network` o `acceptance-net`)
   apuntando a `http://<container>:5000`

## Isolated Mongo (Testcontainers-style)

Desde una imagen ya construida:

```bash
export IMAGE_NAME=customerservice-backend
export IMAGE_TAG=development-local

chmod +x scripts/*.sh
./scripts/start-acceptance-stack.sh
set -a && source acceptance.env && set +a
DOCKER_NETWORK="$KARATE_DOCKER_NETWORK" BASE_URL="$KARATE_BASE_URL" ./scripts/run-karate.sh
./scripts/stop-acceptance-stack.sh
```

Seed manual:

```bash
MONGODB_URI=mongodb://127.0.0.1:27018/acceptance npm run seed:acceptance --prefix ..
```

## Jenkins

| Job | Comportamiento |
|-----|----------------|
| Develop | Deploy → health → Karate `@wide ~@external`; fallo → rollback a imagen anterior / `development-last-good` |
| Production | Gate con Mongo aislado + seed + Karate; fallo → **no** Deploy pdn |

## Tags

| Tag | Uso |
|-----|-----|
| `@smoke` | health, auth, projects, properties, users |
| `@wide` | cobertura de listados GET de casi todos los `/api/*` |
| `@external` | GCS / Twilio / backup (excluidos por defecto) |
