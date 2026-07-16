# Cloudflare Quick Tunnel → TurnOn en http://127.0.0.1:PORT
# Uso: npm run start:tunnel
# Importante: NO redirigir stdout de cloudflared (llena el buffer y mata el proceso).

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
  } catch {
    return $false
  }
}

if (-not (Test-TurnOn)) {
  Write-Host ""
  Write-Host "[tunnel] TurnOn NO responde en $target" -ForegroundColor Red
  Write-Host "[tunnel] Primero: npm run start:lan   o   INICIAR-TURNON.bat" -ForegroundColor Yellow
  Write-Host ""
  exit 1
}

$cf = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cf) {
  Write-Host ""
  Write-Host "[tunnel] No se encontro cloudflared." -ForegroundColor Red
  Write-Host "  winget install --id Cloudflare.cloudflared" -ForegroundColor Yellow
  Write-Host ""
  exit 1
}

Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Milliseconds 400
Remove-Item $tunnelLog, $urlFile -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TurnOn + Cloudflare Quick Tunnel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Local OK: $target"
Write-Host "  Deja esta ventana abierta (o el proceso cloudflared en segundo plano)."
Write-Host ""

$p = Start-Process -FilePath $cf.Source `
  -ArgumentList @("tunnel", "--url", $target, "--no-autoupdate", "--logfile", $tunnelLog, "--loglevel", "info") `
  -WorkingDirectory $root `
  -WindowStyle Minimized `
  -PassThru

$p.Id | Set-Content -LiteralPath $pidFile -Encoding ascii

$url = $null
for ($i = 0; $i -lt 60; $i++) {
  Start-Sleep -Milliseconds 500
  if ($p.HasExited) {
    Write-Host "[tunnel] cloudflared salio (codigo $($p.ExitCode)). Mira tunnel.log" -ForegroundColor Red
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
  Write-Host "[tunnel] No aparecio URL. Mira tunnel.log" -ForegroundColor Red
  if (Test-Path $tunnelLog) { Get-Content $tunnelLog -Tail 40 }
  exit 1
}

$url | Set-Content -LiteralPath $urlFile -Encoding ascii

Write-Host "========================================" -ForegroundColor Green
Write-Host "  LINK PUBLICO (celular con datos):" -ForegroundColor Green
Write-Host "  $url" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Guardado en tunnel-url.txt"
Write-Host "  Ctrl+C no cierra el tunel minimizado; para detener:"
Write-Host "    Stop-Process -Name cloudflared -Force"
Write-Host "  o cierra la ventana minimizada de cloudflared."
Write-Host ""
Write-Host "  Si ves Error 530 / Host / puerta de enlace:"
Write-Host "    1) npm run start:lan"
Write-Host "    2) npm run start:tunnel   (link NUEVO)"
Write-Host ""

# Mantener la ventana del script abierta mostrando el link (tunel ya corre aparte)
Write-Host "Presiona Enter para cerrar esta ventana (el tunel SIGUE corriendo)..."
[void][System.Console]::ReadLine()
