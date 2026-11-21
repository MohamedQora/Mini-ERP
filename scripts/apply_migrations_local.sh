#!/usr/bin/env bash
set -euo pipefail

# Safety guard: direct execution is restricted to a local database host.
: "${DATABASE_URL:=postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
if [[ ! "$DATABASE_URL" =~ ^postgres(ql)?://[^@/]+@(127\.0\.0\.1|localhost):54322(/[^?]*)?(\?.*)?$ ]]; then
  echo "Refusing to run: DATABASE_URL must target localhost:54322." >&2
  exit 2
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
MIGRATION_DIR="$ROOT_DIR/supabase/migrations"

for migration in "$MIGRATION_DIR"/*.sql; do
  echo "==> Applying $(basename "$migration")"
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$migration"
done

echo "Migration files applied. Run scripts/run_tests_local.sh next."
