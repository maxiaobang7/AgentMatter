#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_DIR="${AGENTMATTER_PROJECT_DIR:-/www/wwwroot/agentmatter}"
cd "$PROJECT_DIR"

if [[ "${AGENTMATTER_BACKUP_CONFIRMED:-}" != "YES" ]]; then
  echo "Update stopped: confirm a fresh MySQL, .env.production, and storage/media backup first."
  echo "Then run: AGENTMATTER_BACKUP_CONFIRMED=YES bash deploy/baota/update.sh"
  exit 1
fi

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Update stopped: the server working tree contains local changes."
  git status --short
  exit 1
fi

PREVIOUS_COMMIT="$(git rev-parse HEAD)"
echo "Previous commit: $PREVIOUS_COMMIT"

git fetch origin main
git merge --ff-only origin/main

pnpm install --frozen-lockfile --prod=false
pnpm deploy:preflight
pnpm schema:export
pnpm ops:validate -- operations/templates/resource.example.json
git diff --exit-code -- operations/schemas/resource.schema.json operations/templates/resource.example.json
pnpm test
pnpm lint
pnpm exec next typegen
pnpm exec tsc --noEmit
pnpm build
pnpm db:migrate
pnpm db:seed

if [[ "$(id -u)" == "0" ]] && id "${AGENTMATTER_RUN_USER:-www}" >/dev/null 2>&1; then
  chown -R "${AGENTMATTER_RUN_USER:-www}:${AGENTMATTER_RUN_USER:-www}" .next storage
fi

if command -v pm2 >/dev/null && pm2 describe agentmatter >/dev/null 2>&1; then
  pm2 startOrReload deploy/baota/ecosystem.config.cjs --env production --update-env
  pm2 save
  sleep 3
  AGENTMATTER_SMOKE_URL=http://127.0.0.1:3000 \
    NEXT_PUBLIC_SITE_URL=https://www.agentmatter.net \
    pnpm smoke:production
else
  echo "Build completed. Restart the AgentMatter Node project in Baota, then run the documented smoke command."
fi

echo "Updated from $PREVIOUS_COMMIT to $(git rev-parse HEAD)."
