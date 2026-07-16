# Arranca TurnOn (API + UI de dist) con reinicio si el proceso se cae.
# Uso: npm run start:lan

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

$pidApi = Join-Path $root "api.pid"
$port = 3001

$envFile = Join-Path $root "server\.env"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*PORT\s*=\s*"?(\d+)"?\s*$') { $port = [int]$Matches[1] }
  }
}

function Get-LanIPs {
  Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object {
      $_.IPAddress -notlike "127.*" -and
      ($_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*" -or $_.IPAddress -match '^172\.(1[6-9]|2[0-9]|3[0-1])\.')
    } |
    Select-Object -ExpandProperty IPAddress -Unique
}

function Get-NodeOnPort([int]$Port) {
  $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  foreach ($c in $conns) {
    $p = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
    if ($p -and $p.ProcessName -match 'node') { return $p.Id }
  }
  return $null
}

$alive = Get-NodeOnPort $port
if ($alive) {
  Write-Host "[start] TurnOn ya esta corriendo (PID $alive)." -ForegroundColor Yellow
  Write-Host "[start] http://localhost:$port"
  foreach ($ip in Get-LanIPs) { Write-Host "[start] http://${ip}:$port" }
  exit 0
}

if (-not (Test-Path (Join-Path $root "dist\index.html"))) {
  Write-Host "[start] Compilando frontend..." -ForegroundColor Cyan
  npm run build
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

$nodeExe = (Get-Command node.exe).Source
$keeper = Join-Path $env:TEMP "turnon-keeper.bat"
@"
@echo off
title TurnOn-Keeper
cd /d "$root"
:loop
set HOST=0.0.0.0
set LAN_MODE=1
set PORT=$port
"$nodeExe" server\index.js
timeout /t 2 /nobreak >nul
goto loop
"@ | Set-Content -LiteralPath $keeper -Encoding ASCII

cmd.exe /c "start `"TurnOn-Keeper`" /MIN cmd.exe /c `"$keeper`""

$ok = $false
$found = $null
for ($i = 0; $i -lt 50; $i++) {
  Start-Sleep -Milliseconds 400
  $found = Get-NodeOnPort $port
  if ($found) { $ok = $true; break }
}

if (-not $ok) {
  Write-Host "[start] ERROR: no arranco. Mira api.log y api-error.log" -ForegroundColor Red
  if (Test-Path (Join-Path $root "api.log")) { Get-Content (Join-Path $root "api.log") -Tail 25 }
  if (Test-Path (Join-Path $root "api-error.log")) { Get-Content (Join-Path $root "api-error.log") -Tail 25 }
  exit 1
}

$found | Set-Content -LiteralPath $pidApi -Encoding ascii

Write-Host ""
Write-Host "  TurnOn OK (PID $found)" -ForegroundColor Green
Write-Host "  http://localhost:$port"
foreach ($ip in Get-LanIPs) {
  Write-Host "  http://${ip}:$port"
}
Write-Host "  Detener: npm run dev:stop"
Write-Host ""
