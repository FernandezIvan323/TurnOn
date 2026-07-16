# Copia INICIAR-TURNON.bat al Inicio de Windows (arranque con el PC).
# Uso: powershell -ExecutionPolicy Bypass -File scripts/install-startup.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$bat = Join-Path $root "INICIAR-TURNON.bat"
if (-not (Test-Path $bat)) {
  Write-Host "No se encontro INICIAR-TURNON.bat" -ForegroundColor Red
  exit 1
}

$startup = [Environment]::GetFolderPath("Startup")
$dest = Join-Path $startup "TurnOn-LAN.bat"

# Acceso directo vía bat que llama al original (ruta fija del proyecto)
$launcher = @"
@echo off
cd /d "$root"
call "$bat"
"@
Set-Content -LiteralPath $dest -Value $launcher -Encoding ASCII

Write-Host "[startup] TurnOn se iniciara al iniciar sesion de Windows." -ForegroundColor Green
Write-Host "[startup] Acceso: $dest"
Write-Host "[startup] Para quitarlo: borra ese archivo del Inicio."
Write-Host "[startup] Asegura que PostgreSQL tambien arranque con Windows."
