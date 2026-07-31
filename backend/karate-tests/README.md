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

## Isolated Mongo (Testcontainers-style)

Desde una imagen ya construida:

```bash
export IMAGE_NAME=customerservice-backend
export IMAGE_TAG=development-local
# docker build -t $IMAGE_NAME:$IMAGE_TAG ../

chmod +x scripts/*.sh
./scripts/start-acceptance-stack.sh   # Mongo :27018 + seed + API :15001
set -a && source acceptance.env && set +a
./mvnw test -DbaseUrl="$KARATE_BASE_URL" -DprojectId="$KARATE_PROJECT_ID" \
  -DadminEmail="$KARATE_ADMIN_EMAIL" -DadminPassword="$KARATE_ADMIN_PASSWORD"
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
