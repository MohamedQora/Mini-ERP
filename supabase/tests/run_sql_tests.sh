#!/usr/bin/env bash
set -euo pipefail
: "${DATABASE_URL:?Set DATABASE_URL to a disposable PostgreSQL 16/Supabase-compatible test database}"
if [[ ! "$DATABASE_URL" =~ ^postgres(ql)?://[^@/]+@(127\.0\.0\.1|localhost):54322(/[^?]*)?(\?.*)?$ ]]; then
  echo "Refusing to run: DATABASE_URL must target localhost:54322." >&2
  exit 2
fi
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
for test_file in "$SCRIPT_DIR"/[0-6][0-9]_*.sql; do
  echo "==> Running $(basename "$test_file")"
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$test_file"
done
printf '\nAll SQL suites completed without psql errors. This is not a production approval.\n'
