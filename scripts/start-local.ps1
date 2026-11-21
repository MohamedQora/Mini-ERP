$ErrorActionPreference = 'Stop'

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
Set-Location $root

# Supabase CLI 3.2.0 in this setup supports local PostgreSQL 15/17, not 16.
$env:SUPABASE_DB_MAJOR_VERSION = '17'

Write-Host 'Starting the local Supabase stack...'
$startOutput = & npx --yes supabase@3.2.0 start 2>&1
if ($LASTEXITCODE -ne 0) {
  $startOutput | ForEach-Object { Write-Host $_ }
  throw 'Supabase did not start. Check Docker Desktop and the CLI output above.'
}

$statusOutput = & npx --yes supabase@3.2.0 status --output json 2>&1
if ($LASTEXITCODE -ne 0) {
  $statusOutput | ForEach-Object { Write-Host $_ }
  throw 'Could not read local Supabase settings.'
}

try {
  $localSupabase = ($statusOutput -join [Environment]::NewLine) | ConvertFrom-Json
} catch {
  throw 'Supabase status did not return valid JSON.'
}

if (-not $localSupabase.API_URL -or -not $localSupabase.PUBLISHABLE_KEY -or -not $localSupabase.SERVICE_ROLE_KEY) {
  throw 'Supabase did not return the local API URL and keys.'
}

# Override .env.local for this process only; do not rewrite local or cloud secrets.
$env:NEXT_PUBLIC_SUPABASE_URL = $localSupabase.API_URL
$env:NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = $localSupabase.PUBLISHABLE_KEY
$env:SUPABASE_SERVICE_ROLE_KEY = $localSupabase.SERVICE_ROLE_KEY

Set-Location (Join-Path $root 'frontend')
if (-not (Test-Path 'node_modules/.bin/next.cmd')) {
  Write-Host 'Installing frontend dependencies for the first run...'
  npm ci
  if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host 'Starting Mini ERP at http://localhost:3000'
npm run dev -- --hostname 127.0.0.1
exit $LASTEXITCODE
