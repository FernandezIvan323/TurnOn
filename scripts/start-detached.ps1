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
  $null -ne (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue)
}

function Kill-Port([int]$Port) {
  Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

function Is-Alive([string]$PidFile) {
  if (-not (Test-Path -LiteralPath $PidFile)) { return $false }
  $procId = Get-Content -LiteralPath $PidFile -ErrorAction SilentlyContinue
  if (-not $procId) { return $false }
  return $null -ne (Get-Process -Id $procId -ErrorAction SilentlyContinue)
}

function Start-One([string]$Name, [string]$Cmd, [string]$PidFile, [int]$Port, [string]$Log, [string]$Err) {
  if (Is-Alive $PidFile) {
    $existing = Get-Content $PidFile
    Write-Host "[detached] $Name ya esta corriendo (PID $existing)." -ForegroundColor Yellow
    return
  }

  # Liberar zombie en el puerto antes de arrancar
  if (Test-Port $Port) {
    Write-Host "[detached] ${Name}: puerto ${Port} ocupado por zombie. Liberando..." -ForegroundColor Yellow
    Kill-Port $Port
    Start-Sleep 1
  }

  Remove-Item -LiteralPath $PidFile -ErrorAction SilentlyContinue
  $proc = Start-Process -FilePath "cmd.exe" -ArgumentList @("/c", $Cmd) `
    -WorkingDirectory $root `
    -RedirectStandardOutput $Log -RedirectStandardError $Err `
    -WindowStyle Hidden -PassThru
  Start-Sleep -Milliseconds 1500
  if ($proc.HasExited) {
    Write-Host "[detached] ERROR: $Name fallo al arrancar. Revisa $Err" -ForegroundColor Red
    return
  }
  $proc.Id | Set-Content -LiteralPath $PidFile -Encoding ascii
  Write-Host "[detached] $Name arrancado (PID $($proc.Id)). Log: $Log" -ForegroundColor Green
}

# --- 1) Si AMBOS ya estan vivos, salir sin tocar nada ---
$viteAlive = Is-Alive $pidVite
$apiAlive  = Is-Alive $pidApi

if ($viteAlive -and $apiAlive) {
  Write-Host "[detached] AppTurnos ya esta corriendo (Vite: $(Get-Content $pidVite), API: $(Get-Content $pidApi))." -ForegroundColor Green
  Write-Host "[detached] Para detener: npm run dev:stop"
  exit 0
}

# --- 2) Limpiar logs solo de los procesos que se van a arrancar ---
try {
  if (-not $viteAlive) { "" | Set-Content $logVite -Encoding utf8; "" | Set-Content $errVite -Encoding utf8 }
  if (-not $apiAlive)  { "" | Set-Content $logApi  -Encoding utf8; "" | Set-Content $errApi  -Encoding utf8 }
} catch {
  Write-Host "[detached] AVISO: no se pudieron limpiar logs (¿usados por otro proceso?). Continuando..." -ForegroundColor Yellow
}

# --- 3) Arrancar cada proceso que falte ---
if (-not $apiAlive)  { Start-One "API"  "npm run dev:api"  $pidApi  3001  $logApi  $errApi }
if (-not $viteAlive) { Start-One "Vite" "npm run dev:web" $pidVite 5180 $logVite $errVite }

Write-Host "[detached] Para detener: npm run dev:stop"
