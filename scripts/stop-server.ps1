# Detiene Vite + API arrancados con start-detached.ps1
# Uso: powershell -ExecutionPolicy Bypass -File scripts/stop-server.ps1

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
$pidVite = Join-Path $root "vite.pid"
$pidApi  = Join-Path $root "api.pid"

function Kill-PidFile([string]$PidFile, [string]$Label) {
  if (-not (Test-Path -LiteralPath $PidFile)) { return }
  $procId = Get-Content -LiteralPath $PidFile -ErrorAction SilentlyContinue
  if ($procId) {
    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    Write-Host "[stop] $Label pid $procId detenido."
  }
  Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
}

Kill-PidFile $pidVite "Vite"
Kill-PidFile $pidApi  "API"

# Fallback: matar cualquier node.exe en los puertos
foreach ($port in @(3001,5180)) {
  $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($c in $conns) {
    Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
  }
}

Write-Host "[stop] Hecho."
