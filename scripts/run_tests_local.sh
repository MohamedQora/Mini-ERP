#!/usr/bin/env bash
set -euo pipefail

# Safety guard: test execution is restricted to a local database host.
: "${DATABASE_URL:=postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
if [[ ! "$DATABASE_URL" =~ ^postgres(ql)?://[^@/]+@(127\.0\.0\.1|localhost):54322(/[^?]*)?(\?.*)?$ ]]; then
  echo "Refusing to run: DATABASE_URL must target localhost:54322." >&2
  exit 2
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEST_DIR="$ROOT_DIR/supabase/tests"

for test_file in "$TEST_DIR"/[0-6][0-9]_*.sql; do
  echo "==> Running $(basename "$test_file")"
  psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f "$test_file"
done

echo "All SQL suites completed without psql errors. This is not production approval."
