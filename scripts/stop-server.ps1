# Detiene Vite + API: mata por puerto primero (encuentra el node.exe real),
# luego limpia PID files y logs.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/stop-server.ps1

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

$pidVite = Join-Path $root "vite.pid"
$pidApi  = Join-Path $root "api.pid"

function Kill-Port([int]$Port, [string]$Label) {
  $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if (-not $conns) { return }
  foreach ($c in $conns) {
    Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
    Write-Host "[stop] $Label (PID $($c.OwningProcess), puerto $Port) detenido."
  }
}

function Remove-PidFile([string]$Path) {
  if (Test-Path -LiteralPath $Path) {
    Remove-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue
  }
}

# --- 1) Matar por puerto (primario): encuentra el node.exe real ---
Kill-Port 3001 "API"
Kill-Port 5180 "Vite"

# --- 2) Esperar que los procesos mueran ---
Start-Sleep -Milliseconds 1000

# --- 3) Limpiar PID files y logs ---
Remove-PidFile $pidVite
Remove-PidFile $pidApi
Remove-Item -LiteralPath "$root\vite.log", "$root\vite-error.log", "$root\api.log", "$root\api-error.log" -Force -ErrorAction SilentlyContinue

Write-Host "[stop] AppTurnos detenido (puertos 3001 y 5180 liberados)." -ForegroundColor Green
