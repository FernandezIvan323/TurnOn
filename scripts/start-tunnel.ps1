# Cloudflare Quick Tunnel con auto-reinicio si se cae.
# Uso: npm run start:tunnel

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
  [System.Environment]::GetEnvironmentVariable("Path", "User")

$port = 3001
$envFile = Join-Path $root "server\.env"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*PORT\s*=\s*"?(\d+)"?\s*$') { $port = [int]$Matches[1] }
  }
}

$target = "http://127.0.0.1:$port"
$urlFile = Join-Path $root "tunnel-url.txt"
$tunnelLog = Join-Path $root "tunnel.log"
$pidFile = Join-Path $root "tunnel.pid"

function Test-TurnOn {
  try {
    $r = Invoke-WebRequest -Uri "$target/api/health" -UseBasicParsing -TimeoutSec 3
    return $r.StatusCode -eq 200
  } catch { return $false }
}

if (-not (Test-TurnOn)) {
  Write-Host "[tunnel] TurnOn no responde en $target. Corre: npm run start:lan" -ForegroundColor Red
  exit 1
}

$cf = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cf) {
  Write-Host "[tunnel] Falta cloudflared: winget install --id Cloudflare.cloudflared" -ForegroundColor Red
  exit 1
}

Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
# Matar keepers viejos de tunel
Get-CimInstance Win32_Process -Filter "Name='cmd.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like '*turnon-tunnel-keeper*' -or $_.CommandLine -like '*TurnOn-Tunnel-Keeper*' } |
  ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }

Start-Sleep -Milliseconds 400
Remove-Item $tunnelLog, $urlFile -Force -ErrorAction SilentlyContinue

$cfPath = $cf.Source
$keeper = Join-Path $env:TEMP "turnon-tunnel-keeper.bat"
@"
@echo off
title TurnOn-Tunnel-Keeper
cd /d "$root"
:loop
if exist "$tunnelLog" del /q "$tunnelLog" >nul 2>&1
"$cfPath" tunnel --url $target --no-autoupdate --protocol http2 --logfile "$tunnelLog" --loglevel info
echo [%date% %time%] Tunel caido. Reinicio en 3s...
timeout /t 3 /nobreak >nul
goto loop
"@ | Set-Content -LiteralPath $keeper -Encoding ASCII

cmd.exe /c "start `"TurnOn-Tunnel-Keeper`" /MIN cmd.exe /c `"$keeper`""

$url = $null
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Milliseconds 500
  if (Test-Path $tunnelLog) {
    $m = Select-String -Path $tunnelLog -Pattern "https://[a-zA-Z0-9-]+\.trycloudflare\.com" -ErrorAction SilentlyContinue |
      Select-Object -Last 1
    if ($m -and $m.Line -match "(https://[a-zA-Z0-9-]+\.trycloudflare\.com)") {
      $url = $Matches[1]
      break
    }
  }
}

if (-not $url) {
  Write-Host "[tunnel] No salio URL. Mira tunnel.log" -ForegroundColor Red
  if (Test-Path $tunnelLog) { Get-Content $tunnelLog -Tail 40 }
  exit 1
}

$cfId = (Get-Process cloudflared -ErrorAction SilentlyContinue | Select-Object -First 1).Id
if ($cfId) { $cfId | Set-Content -LiteralPath $pidFile -Encoding ascii }
$url | Set-Content -LiteralPath $urlFile -Encoding ascii

$ok = $false
for ($i = 1; $i -le 12; $i++) {
  Start-Sleep -Seconds 1
  try {
    $r = Invoke-WebRequest -Uri "$url/api/health" -UseBasicParsing -TimeoutSec 15
    if ($r.StatusCode -eq 200) { $ok = $true; break }
  } catch { }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  LINK PUBLICO (celular + datos):" -ForegroundColor Green
Write-Host "  $url" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
if ($ok) { Write-Host "  Health: OK" -ForegroundColor Green }
else { Write-Host "  Health: esperando DNS (proba en 10s)" -ForegroundColor Yellow }
Write-Host "  Auto-reinicio del tunel activo (keeper)."
Write-Host "  Si el tunel se reinicia, la URL puede CAMBIAR — mira tunnel-url.txt"
Write-Host "  Guardado en tunnel-url.txt"
Write-Host ""
