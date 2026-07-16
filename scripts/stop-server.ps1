# Detiene Vite + API y el keeper de reinicio.
# Uso: powershell -ExecutionPolicy Bypass -File scripts/stop-server.ps1

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $root

$pidVite = Join-Path $root "vite.pid"
$pidApi  = Join-Path $root "api.pid"

function Kill-Port([int]$Port, [string]$Label) {
  $conns = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
  if (-not $conns) { return }
  foreach ($c in $conns) {
    $childPid = $c.OwningProcess
    Stop-Process -Id $childPid -Force -ErrorAction SilentlyContinue
    Write-Host "[stop] $Label (PID $childPid, puerto $Port) detenido."
    $child = Get-CimInstance Win32_Process -Filter "ProcessId=$childPid" -ErrorAction SilentlyContinue
    if ($child -and $child.ParentProcessId) {
      $parent = Get-CimInstance Win32_Process -Filter "ProcessId=$($child.ParentProcessId)" -ErrorAction SilentlyContinue
      if ($parent -and $parent.Name -eq 'node.exe' -and $parent.CommandLine -like '*server/index.js*') {
        Stop-Process -Id $parent.ProcessId -Force -ErrorAction SilentlyContinue
        Write-Host "[stop] $Label watcher padre (PID $($parent.ProcessId)) detenido." -ForegroundColor Yellow
      }
    }
  }
  Get-CimInstance Win32_Process -Filter "Name='node.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -like '*server/index.js*' } |
    ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

function Remove-PidFile([string]$Path) {
  if (Test-Path -LiteralPath $Path) {
    Remove-Item -LiteralPath $Path -Force -ErrorAction SilentlyContinue
  }
}

Get-CimInstance Win32_Process -Filter "Name='cmd.exe'" -ErrorAction SilentlyContinue |
  Where-Object { $_.CommandLine -like '*turnon-keeper*' -or $_.CommandLine -like '*TurnOn-Keeper*' } |
  ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    Write-Host "[stop] Keeper (cmd PID $($_.ProcessId)) detenido."
  }

Kill-Port 3001 "API"
Kill-Port 5180 "Vite"
Start-Sleep -Milliseconds 1000
Kill-Port 3001 "API"

Remove-PidFile $pidVite
Remove-PidFile $pidApi
Remove-Item -LiteralPath "$root\vite.log", "$root\vite-error.log", "$root\api.log", "$root\api-error.log" -Force -ErrorAction SilentlyContinue

Write-Host "[stop] TurnOn detenido." -ForegroundColor Green
