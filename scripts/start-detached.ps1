# Arranca Vite + API como DOS procesos independientes (no concurrently).
# Si uno muere, el otro sigue vivo. Sobreviven al cierre de terminal.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/start-detached.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

$pidVite = Join-Path $root "vite.pid"
$pidApi  = Join-Path $root "api.pid"
$logVite = Join-Path $root "vite.log"
$logApi  = Join-Path $root "api.log"
$errVite = Join-Path $root "vite-error.log"
$errApi  = Join-Path $root "api-error.log"

function Test-Port([int]$Port) {
  $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  return $null -ne $conn
}

function Is-Alive([string]$PidFile) {
  if (-not (Test-Path -LiteralPath $PidFile)) { return $false }
  $pid = Get-Content -LiteralPath $PidFile -ErrorAction SilentlyContinue
  if (-not $pid) { return $false }
  return $null -ne (Get-Process -Id $pid -ErrorAction SilentlyContinue)
}

function Start-One([string]$Name, [string]$Cmd, [string]$PidFile, [string]$Log, [string]$Err) {
  if (Is-Alive $PidFile) {
    $existing = Get-Content $PidFile
    Write-Host "[detached] $Name ya esta corriendo (PID $existing)." -ForegroundColor Yellow
    return
  }
  Remove-Item -LiteralPath $PidFile -ErrorAction SilentlyContinue
  $proc = Start-Process -FilePath "cmd.exe" -ArgumentList @("/c", $Cmd) `
    -WorkingDirectory $root `
    -RedirectStandardOutput $Log -RedirectStandardError $Err `
    -WindowStyle Hidden -PassThru
  Start-Sleep -Milliseconds 500
  if ($proc.HasExited) {
    Write-Host "[detached] ERROR: $Name fallo al arrancar. Revisa $Err" -ForegroundColor Red
    return
  }
  $proc.Id | Set-Content -LiteralPath $PidFile -Encoding ascii
  Write-Host "[detached] $Name arrancado (PID $($proc.Id)). Log: $Log" -ForegroundColor Green
}

# Verificar puertos
if (Test-Port 3001) {
  Write-Host "[detached] ERROR: puerto 3001 ocupado. Mata el proceso y reintenta." -ForegroundColor Red
  exit 1
}

# Limpiar logs viejos
"" | Set-Content $logVite -Encoding utf8
"" | Set-Content $errVite -Encoding utf8
"" | Set-Content $logApi  -Encoding utf8
"" | Set-Content $errApi  -Encoding utf8

# Arrancar API primero (mas lento)
Start-One "API"  "npm run dev:api"  $pidApi  $logApi  $errApi

# Arrancar Vite
Start-One "Vite" "npm run dev:web" $pidVite $logVite $errVite

Write-Host "[detached] Para detener: npm run dev:stop"
