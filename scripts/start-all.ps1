# Arranca TurnOn + Cloudflare Tunnel y deja un watchdog que re-levanta la API si se cae.
# Uso: npm run start:all   o   INICIAR-TODO.bat

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

Write-Host ""
Write-Host "=== TurnOn TODO (API + tunel + watchdog) ===" -ForegroundColor Cyan

& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "start-lan.ps1")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "start-tunnel.ps1")
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$urlFile = Join-Path $root "tunnel-url.txt"
$port = 3001

Write-Host ""
Write-Host "Watchdog activo: cada 20s revisa si el API vive." -ForegroundColor Yellow
Write-Host "NO cierres esta ventana si queres que se auto-reinicie el servidor."
Write-Host "Ctrl+C detiene el watchdog (API y tunel pueden seguir)."
Write-Host ""

while ($true) {
  Start-Sleep -Seconds 20
  $up = $false
  try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/health" -UseBasicParsing -TimeoutSec 3
    $up = ($r.StatusCode -eq 200)
  } catch { $up = $false }

  if (-not $up) {
    $ts = Get-Date -Format "HH:mm:ss"
    Write-Host "[$ts] API caido — reiniciando start:lan..." -ForegroundColor Red
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "start-lan.ps1")
    Start-Sleep -Seconds 3
    # Re-chequear y avisar si el tunel sigue (mismo link si cloudflared vivo)
    $cf = Get-Process cloudflared -ErrorAction SilentlyContinue
    if (-not $cf) {
      Write-Host "[$ts] Tunel tambien caido — reiniciando start:tunnel (URL NUEVA)..." -ForegroundColor Red
      & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "start-tunnel.ps1")
      if (Test-Path $urlFile) {
        Write-Host "NUEVO LINK: $(Get-Content $urlFile)" -ForegroundColor Green
      }
    } else {
      Write-Host "[$ts] API arriba de nuevo; tunel intacto (mismo link)." -ForegroundColor Green
      if (Test-Path $urlFile) { Write-Host "LINK: $(Get-Content $urlFile)" -ForegroundColor Cyan }
    }
  }
}
