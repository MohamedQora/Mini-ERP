$ErrorActionPreference = 'Stop'
$databaseUrl = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' }
if ($databaseUrl -notmatch '^postgres(?:ql)?://[^@]+@(?:127\.0\.0\.1|localhost):54322(?:/|\?|$)') {
  throw 'رفض التنفيذ: DATABASE_URL يجب أن يشير إلى قاعدة التطوير المحلية على المنفذ 54322.'
}
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) { throw 'psql غير مثبت أو غير موجود في PATH.' }

$root = Split-Path -Parent $PSScriptRoot
$migrationDir = Join-Path $root 'supabase\migrations'
Get-ChildItem -LiteralPath $migrationDir -Filter '*.sql' -File | Sort-Object Name | ForEach-Object {
  Write-Host "==> تطبيق $($_.Name)"
  & psql $databaseUrl -X -v ON_ERROR_STOP=1 -f $_.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
Write-Host 'اكتمل تطبيق ملفات الترحيل. شغّل run_tests_local.ps1 بعد ذلك.'
