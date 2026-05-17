$ErrorActionPreference = "Stop"

$RootDir = Resolve-Path (Join-Path $PSScriptRoot "..")
$RunDir = if ($env:RUN_DIR) { $env:RUN_DIR } else { Join-Path $RootDir ".run" }
$PidFile = if ($env:PID_FILE) { $env:PID_FILE } else { Join-Path $RunDir "qurbanir-haat.pid" }

function Stop-ProcessTree {
  param([int]$ProcessId)

  $Children = Get-CimInstance Win32_Process -Filter "ParentProcessId = $ProcessId" -ErrorAction SilentlyContinue
  foreach ($Child in $Children) {
    Stop-ProcessTree -ProcessId ([int]$Child.ProcessId)
  }

  $Target = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
  if ($Target) {
    Stop-Process -Id $ProcessId -Force
  }
}

if (-not (Test-Path -LiteralPath $PidFile)) {
  Write-Host "Qurbanir Haat is not running; no PID file found."
  exit 0
}

$PidValue = (Get-Content -LiteralPath $PidFile -Raw).Trim()
if (-not $PidValue) {
  Remove-Item -LiteralPath $PidFile -Force
  Write-Host "Removed empty PID file."
  exit 0
}

$Process = Get-Process -Id $PidValue -ErrorAction SilentlyContinue
if (-not $Process) {
  Remove-Item -LiteralPath $PidFile -Force
  Write-Host "Removed stale PID file for PID $PidValue."
  exit 0
}

Stop-ProcessTree -ProcessId ([int]$PidValue)
Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
Write-Host "Stopped Qurbanir Haat."
