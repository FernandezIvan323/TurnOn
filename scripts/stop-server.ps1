# Detiene el server arrancado con start-detached.ps1
# Uso: powershell -ExecutionPolicy Bypass -File scripts/stop-server.ps1

$ErrorActionPreference = "Continue"
$root = Split-Path -Parent $PSScriptRoot
$pidFile = Join-Path $root "server.pid"

if (-not (Test-Path -LiteralPath $pidFile)) {
  Write-Host "[stop] No hay server.pid, nada que detener."
  exit 0
}

$pid_ = Get-Content -LiteralPath $pidFile -ErrorAction SilentlyContinue
if (-not $pid_) {
  Write-Host "[stop] server.pid vacio, nada que detener."
  Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
  exit 0
}

# Matamos el PID principal y todos sus hijos (vite + concurrently).
$procs = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" -ErrorAction SilentlyContinue
$parent = Get-CimInstance Win32_Process -Filter "ProcessId = $pid_" -ErrorAction SilentlyContinue

# Encuentra todos los descendientes.
$children = New-Object System.Collections.Generic.List[int]
if ($parent) {
  $queue = New-Object System.Collections.Generic.Queue[int]
  $queue.Enqueue([int]$parent.ProcessId)
  while ($queue.Count -gt 0) {
    $cur = $queue.Dequeue()
    foreach ($p in $procs) {
      if ($p.ParentProcessId -eq $cur) {
        $children.Add([int]$p.ProcessId)
        $queue.Enqueue([int]$p.ProcessId)
      }
    }
  }
}

$targets = @($pid_) + $children | Sort-Object -Unique
Write-Host "[stop] Deteniendo procesos: $($targets -join ', ')"
foreach ($t in $targets) {
  Stop-Process -Id $t -Force -ErrorAction SilentlyContinue
}

# Limpieza adicional: cualquier nodo que haya quedado huerfano en nuestros puertos.
foreach ($port in 3001, 5180) {
  $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
  foreach ($c in $conns) {
    Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue
  }
}

Remove-Item -LiteralPath $pidFile -Force -ErrorAction SilentlyContinue
Write-Host "[stop] Hecho."
