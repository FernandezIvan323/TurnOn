@echo off
title TurnOn - API + Tunel + Watchdog
cd /d "%~dp0"
echo.
echo  Enciende TurnOn + Cloudflare Tunnel y vigila que no se caigan.
echo  Deja ESTA ventana abierta (cargador, sin suspender el PC).
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-all.ps1"
pause
