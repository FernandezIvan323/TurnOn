@echo off
REM TurnOn LAN — doble clic o copiar a la carpeta Inicio de Windows
REM para que al encender el PC se levante el servidor del local.
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-lan.ps1"
if errorlevel 1 pause
