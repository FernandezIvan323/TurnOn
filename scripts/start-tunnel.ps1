# Cloudflare Quick Tunnel. Deja cloudflared corriendo (ventana minimizada).
# NO redirigir stdout (buffer deadlock).

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
Start-Sleep -Milliseconds 400
Remove-Item $tunnelLog, $urlFile -Force -ErrorAction SilentlyContinue

# Lanzar con cmd start para que sobreviva a la terminal
$bat = Join-Path $env:TEMP "turnon-tunnel.bat"
@"
@echo off
cd /d "$root"
start "TurnOn-Tunnel" /MIN "$($cf.Source)" tunnel --url $target --no-autoupdate --logfile "$tunnelLog" --loglevel info
"@ | Set-Content -LiteralPath $bat -Encoding ASCII
cmd.exe /c "`"$bat`""

$url = $null
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Milliseconds 500
  $cfProc = Get-Process cloudflared -ErrorAction SilentlyContinue
  if (-not $cfProc -and $i -gt 10) {
    Write-Host "[tunnel] cloudflared no arranco. Mira tunnel.log" -ForegroundColor Red
    if (Test-Path $tunnelLog) { Get-Content $tunnelLog -Tail 30 }
    exit 1
  }
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

# Esperar a que el tunel conteste
$ok = $false
for ($i = 1; $i -le 10; $i++) {
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
if ($ok) {
  Write-Host "  Health check: OK" -ForegroundColor Green
} else {
  Write-Host "  Health check: pendiente (proba en 10s en el celular)" -ForegroundColor Yellow
}
Write-Host "  Guardado en tunnel-url.txt"
Write-Host "  Deja el PC despierto (cargador, sin suspender)."
Write-Host "  Si 502 Host Error: start:lan + start:tunnel otra vez (link NUEVO)."
Write-Host ""
