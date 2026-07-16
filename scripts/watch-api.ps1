# Solo vigila el API (puerto 3001). Si se cae, lo reinicia sin tocar el tunel.
# Si el tunel tambien murio, reinicia ambos (URL nueva en tunnel-url.txt).

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root
$port = 3001

Write-Host "Watchdog API TurnOn — dejá esta ventana abierta." -ForegroundColor Cyan
if (Test-Path (Join-Path $root "tunnel-url.txt")) {
  Write-Host "LINK: $(Get-Content (Join-Path $root 'tunnel-url.txt'))" -ForegroundColor Green
}

while ($true) {
  Start-Sleep -Seconds 15
  $up = $false
  try {
    $r = Invoke-WebRequest -Uri "http://127.0.0.1:$port/api/health" -UseBasicParsing -TimeoutSec 3
    $up = ($r.StatusCode -eq 200)
  } catch { $up = $false }

  if ($up) { continue }

  $ts = Get-Date -Format "HH:mm:ss"
  Write-Host "[$ts] API caido — reiniciando..." -ForegroundColor Red
  & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "start-lan.ps1") | Out-Host
  Start-Sleep 2

  $cf = Get-Process cloudflared -ErrorAction SilentlyContinue
  if (-not $cf) {
    Write-Host "[$ts] Tunel caido — reiniciando (URL NUEVA)..." -ForegroundColor Red
    & powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot "start-tunnel.ps1") | Out-Host
  }
  if (Test-Path (Join-Path $root "tunnel-url.txt")) {
    Write-Host "LINK actual: $(Get-Content (Join-Path $root 'tunnel-url.txt'))" -ForegroundColor Cyan
  }
}
