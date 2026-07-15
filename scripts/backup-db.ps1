# AppTurnos — Backup de PostgreSQL
# Uso: npm run db:backup
# Requiere pg_dump en PATH y server/.env con DB_*

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$EnvFile = Join-Path $Root "server\.env"
$BackupDir = Join-Path $Root "backups"

if (-not (Test-Path $EnvFile)) {
  Write-Error "No se encontró server\.env. Copia server\.env.example y configura la BD."
}

# Parse simple KEY=VALUE (ignora comentarios y líneas vacías)
$envMap = @{}
Get-Content $EnvFile | ForEach-Object {
  $line = $_.Trim()
  if ($line -eq "" -or $line.StartsWith("#")) { return }
  $i = $line.IndexOf("=")
  if ($i -lt 1) { return }
  $k = $line.Substring(0, $i).Trim()
  $v = $line.Substring($i + 1).Trim().Trim('"').Trim("'")
  $envMap[$k] = $v
}

$DB_HOST = if ($envMap["DB_HOST"]) { $envMap["DB_HOST"] } else { "localhost" }
$DB_PORT = if ($envMap["DB_PORT"]) { $envMap["DB_PORT"] } else { "5432" }
$DB_USER = if ($envMap["DB_USER"]) { $envMap["DB_USER"] } else { "postgres" }
$DB_NAME = if ($envMap["DB_NAME"]) { $envMap["DB_NAME"] } else { "appturnos" }
$DB_PASSWORD = $envMap["DB_PASSWORD"]

$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDump) {
  Write-Error "pg_dump no está en el PATH. Instala PostgreSQL client tools e inténtalo de nuevo."
}

New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmm"
$outFile = Join-Path $BackupDir "appturnos-$stamp.sql"

Write-Host "[backup] Base: $DB_NAME @ ${DB_HOST}:$DB_PORT"
Write-Host "[backup] Destino: $outFile"

$env:PGPASSWORD = $DB_PASSWORD
try {
  & pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -F p --no-owner --no-acl -f $outFile
  if ($LASTEXITCODE -ne 0) { Write-Error "pg_dump falló con código $LASTEXITCODE" }
  $size = (Get-Item $outFile).Length
  Write-Host "[backup] OK ($([math]::Round($size/1KB, 1)) KB)"
} finally {
  Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}
