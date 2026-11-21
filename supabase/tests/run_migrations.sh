#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL to a disposable clean PostgreSQL 16/Supabase-compatible database}"
if [[ ! "$DATABASE_URL" =~ ^postgres(ql)?://[^@/]+@(127\.0\.0\.1|localhost):54322(/[^?]*)?(\?.*)?$ ]]; then
  echo "Refusing to run: DATABASE_URL must target localhost:54322." >&2
  exit 2
fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
MIGRATION_DIR="$(cd "$SCRIPT_DIR/../migrations" && pwd)"
for migration in "$MIGRATION_DIR"/*.sql; do
  echo "==> Applying $(basename "$migration")"
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$migration"
done
printf '\nAll migration files applied. Run run_sql_tests.sh next.\n'
