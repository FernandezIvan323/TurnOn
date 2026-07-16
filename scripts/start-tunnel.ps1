# Cloudflare Quick Tunnel → TurnOn en http://127.0.0.1:PORT
# Uso: npm run start:tunnel
# Requiere: TurnOn corriendo (npm run start:lan) + cloudflared instalado

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

$port = 3001
$envFile = Join-Path $root "server\.env"
if (Test-Path $envFile) {
  Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*PORT\s*=\s*"?(\d+)"?\s*$') { $port = [int]$Matches[1] }
  }
}

$target = "http://127.0.0.1:$port"

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
  Write-Host "[tunnel] Primero arrancá el servidor:" -ForegroundColor Yellow
  Write-Host "         npm run start:lan"
  Write-Host "         o doble clic en INICIAR-TURNON.bat"
  Write-Host ""
  exit 1
}

$cf = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cf) {
  Write-Host ""
  Write-Host "[tunnel] No se encontro cloudflared en el PATH." -ForegroundColor Red
  Write-Host "[tunnel] Instala con una de estas opciones:" -ForegroundColor Yellow
  Write-Host "  winget install --id Cloudflare.cloudflared"
  Write-Host "  o descarga: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
  Write-Host ""
  Write-Host "Luego cierra y reabre la terminal y vuelve a ejecutar: npm run start:tunnel"
  Write-Host ""
  exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TurnOn + Cloudflare Quick Tunnel" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Local:  $target  (OK)"
Write-Host "  Copiá la URL https://….trycloudflare.com que aparece abajo."
Write-Host "  Los meseros entran con DATOS MOVILES (no hace falta la misma Wi-Fi)."
Write-Host ""
Write-Host "  Si el portatil PIERDE internet: el tunel cae."
Write-Host "  Sigue funcionando en LAN/hotspot: http://IP-DEL-PC:$port"
Write-Host "  Admin en otro celular: misma red local o la URL del tunel si hay internet."
Write-Host ""
Write-Host "  Ctrl+C cierra solo el tunel (TurnOn sigue corriendo)."
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

& cloudflared tunnel --url $target
