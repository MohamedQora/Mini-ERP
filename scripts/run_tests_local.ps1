$ErrorActionPreference = 'Stop'
$databaseUrl = if ($env:DATABASE_URL) { $env:DATABASE_URL } else { 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' }
if ($databaseUrl -notmatch '^postgres(?:ql)?://[^@]+@(?:127\.0\.0\.1|localhost):54322(?:/|\?|$)') {
  throw 'رفض التنفيذ: DATABASE_URL يجب أن يشير إلى قاعدة التطوير المحلية على المنفذ 54322.'
}
if (-not (Get-Command psql -ErrorAction SilentlyContinue)) { throw 'psql غير مثبت أو غير موجود في PATH.' }

$root = Split-Path -Parent $PSScriptRoot
$testDir = Join-Path $root 'supabase\tests'
Get-ChildItem -LiteralPath $testDir -Filter '*.sql' -File | Where-Object Name -Match '^[0-6][0-9]_' | Sort-Object Name | ForEach-Object {
  Write-Host "==> تشغيل $($_.Name)"
  & psql $databaseUrl -X -v ON_ERROR_STOP=1 -f $_.FullName
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
Write-Host 'اجتازت كل مجموعات SQL التنفيذ دون أخطاء psql. هذا لا يعني اعتماد الإنتاج.'
