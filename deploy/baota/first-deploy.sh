#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${AGENTMATTER_PROJECT_DIR:-/www/wwwroot/agentmatter}"
cd "$PROJECT_DIR"

if [[ ! -f .env.production ]]; then
  echo "Missing $PROJECT_DIR/.env.production"
  echo "Copy deploy/baota/agentmatter.env.example and replace every CHANGE_ME value."
  exit 1
fi

command -v node >/dev/null || { echo "Node.js is not installed or not in PATH."; exit 1; }
command -v pnpm >/dev/null || { echo "pnpm is not installed or not in PATH."; exit 1; }

echo "[1/10] Installing locked dependencies"
pnpm install --frozen-lockfile --prod=false

echo "[2/10] Validating production environment"
pnpm deploy:preflight

echo "[3/10] Preparing persistent media directory"
mkdir -p storage/media

echo "[4/10] Applying database migrations"
pnpm db:migrate

echo "[5/10] Importing idempotent seed resources"
pnpm db:seed

echo "[6/10] Exporting and validating the Agent schema"
pnpm schema:export
pnpm ops:validate -- operations/templates/resource.example.json
git diff --exit-code -- operations/schemas/resource.schema.json operations/templates/resource.example.json

echo "[7/10] Running tests and lint"
pnpm test
pnpm lint

echo "[8/10] Generating route types and checking TypeScript"
pnpm exec next typegen
pnpm exec tsc --noEmit

echo "[9/10] Building production application"
pnpm build

if [[ "$(id -u)" == "0" ]] && id "${AGENTMATTER_RUN_USER:-www}" >/dev/null 2>&1; then
  chown -R "${AGENTMATTER_RUN_USER:-www}:${AGENTMATTER_RUN_USER:-www}" .next storage
fi

echo "[10/10] Starting the application"
if [[ "${AGENTMATTER_START_WITH_PM2:-}" == "YES" ]]; then
  command -v pm2 >/dev/null || { echo "PM2 is not installed or not in PATH."; exit 1; }
  pm2 startOrReload deploy/baota/ecosystem.config.cjs --env production --update-env
  pm2 save
  sleep 3
  AGENTMATTER_SMOKE_URL=http://127.0.0.1:3000 \
    NEXT_PUBLIC_SITE_URL=https://www.agentmatter.net \
    pnpm smoke:production
else
  echo "Build completed without starting a process."
  echo "Create and start the Node project in Baota, then run:"
  echo "AGENTMATTER_SMOKE_URL=http://127.0.0.1:3000 NEXT_PUBLIC_SITE_URL=https://www.agentmatter.net pnpm smoke:production"
  echo "For manual PM2 instead, run: AGENTMATTER_START_WITH_PM2=YES bash deploy/baota/first-deploy.sh"
fi

echo "First deployment preparation completed."
