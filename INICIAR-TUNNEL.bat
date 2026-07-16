@echo off
title TurnOn - Cloudflare Tunnel
cd /d "%~dp0"
echo.
echo  Primero debe estar corriendo TurnOn (INICIAR-TURNON.bat o npm run start:lan)
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-tunnel.ps1"
if errorlevel 1 pause
