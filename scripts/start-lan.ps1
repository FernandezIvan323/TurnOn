# Arranca TurnOn LAN como proceso Windows independiente.
# NO redirigir stdout/stderr al mismo api.log (el server ya hace tee a disco;
# redirigir al mismo archivo en Windows puede tumbar el proceso).

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
  Write-Host "[lan] TurnOn ya esta corriendo (PID $alive)." -ForegroundColor Yellow
  Write-Host "[lan] Local:  http://localhost:$port"
  foreach ($ip in Get-LanIPs) { Write-Host "[lan] Meseros: http://${ip}:$port" -ForegroundColor Green }
  Write-Host "[lan] Detener: npm run dev:stop"
  exit 0
}

if (-not (Test-Path (Join-Path $root "dist\index.html"))) {
  Write-Host "[lan] Compilando frontend..." -ForegroundColor Cyan
  npm run build
  if ($LASTEXITCODE -ne 0) { exit 1 }
}

$nodeExe = (Get-Command node.exe).Source
$env:HOST = "0.0.0.0"
$env:LAN_MODE = "1"
$env:TUNNEL_MODE = "1"
$env:TRUST_PROXY = "1"
$env:PORT = "$port"

# cmd /c start con proceso separado del job tree de la terminal
$bat = Join-Path $env:TEMP "turnon-lan-stable.bat"
@"
@echo off
cd /d "$root"
set HOST=0.0.0.0
set LAN_MODE=1
set TUNNEL_MODE=1
set TRUST_PROXY=1
set PORT=$port
start "TurnOn-API" /MIN "$nodeExe" server\index.js
"@ | Set-Content -LiteralPath $bat -Encoding ASCII

cmd.exe /c "`"$bat`""

$ok = $false
$found = $null
for ($i = 0; $i -lt 40; $i++) {
  Start-Sleep -Milliseconds 400
  $found = Get-NodeOnPort $port
  if ($found) { $ok = $true; break }
}

if (-not $ok) {
  Write-Host "[lan] ERROR: no arranco. Mira api.log y api-error.log" -ForegroundColor Red
  if (Test-Path (Join-Path $root "api.log")) { Get-Content (Join-Path $root "api.log") -Tail 25 }
  if (Test-Path (Join-Path $root "api-error.log")) { Get-Content (Join-Path $root "api-error.log") -Tail 25 }
  exit 1
}

$found | Set-Content -LiteralPath $pidApi -Encoding ascii

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  TurnOn LAN OK (PID $found)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Cajero / PC:  http://localhost:$port"
foreach ($ip in Get-LanIPs) {
  Write-Host "  Meseros:       http://${ip}:$port" -ForegroundColor Cyan
}
Write-Host ""
Write-Host "  Internet celular: npm run start:tunnel  (o INICIAR-TODO.bat)"
Write-Host "  admin / 7482   |   ivan o maria / 3197"
Write-Host "  Detener: npm run dev:stop"
Write-Host ""
