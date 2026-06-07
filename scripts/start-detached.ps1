# Arranc la API + Vite en segundo plano, sobrevive al cierre de terminal.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/start-detached.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

$pidFile = Join-Path $root "server.pid"
$apiLog  = Join-Path $root "server.log"
$apiErr  = Join-Path $root "server-error.log"

function Test-Port([int]$Port) {
  $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  return $null -ne $conn
}

# 1. Si ya hay un server.pid valido y vivo, no hacer nada.
if (Test-Path -LiteralPath $pidFile) {
  $existing = Get-Content -LiteralPath $pidFile -ErrorAction SilentlyContinue
  if ($existing -and (Get-Process -Id $existing -ErrorAction SilentlyContinue)) {
    Write-Host "[detached] Server ya esta corriendo (PID $existing). Nada que hacer."
    exit 0
  } else {
    Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
  }
}

# 2. Si los puertos ya estan ocupados por algo que no es nuestro, abortar.
if (Test-Port 3001) {
  Write-Host "[detached] ERROR: el puerto 3001 ya esta en uso por otro proceso. Liberalo primero." -ForegroundColor Red
  exit 1
}
if (Test-Port 5180) {
  Write-Host "[detached] AVISO: el puerto 5180 ya esta en uso. Vite no podra arrancar." -ForegroundColor Yellow
}

# 3. Limpiar logs viejos.
"" | Set-Content -LiteralPath $apiLog -Encoding utf8
"" | Set-Content -LiteralPath $apiErr -Encoding utf8

# 4. Lanzar concurrently en una ventana oculta, redirigir salida.
$cmd = "npm run dev:start"
$startArgs = @{
  FilePath               = "powershell.exe"
  ArgumentList           = @("-NoProfile", "-Command", $cmd)
  WorkingDirectory       = $root
  RedirectStandardOutput = $apiLog
  RedirectStandardError  = $apiErr
  WindowStyle            = "Hidden"
  PassThru               = $true
}

$proc = Start-Process @startArgs
$proc.Id | Set-Content -LiteralPath $pidFile -Encoding ascii

Write-Host "[detached] Server arrancado. PID principal: $($proc.Id)"
Write-Host "[detached] PID guardado en: $pidFile"
Write-Host "[detached] Logs:    $apiLog"
Write-Host "[detached] Errores: $apiErr"
Write-Host "[detached] Para detenerlo ejecuta: npm run dev:stop"
