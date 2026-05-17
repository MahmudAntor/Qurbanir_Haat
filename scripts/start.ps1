$ErrorActionPreference = "Stop"

$RootDir = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$RunDir = if ($env:RUN_DIR) { $env:RUN_DIR } else { Join-Path $RootDir ".run" }
$PidFile = if ($env:PID_FILE) { $env:PID_FILE } else { Join-Path $RunDir "qurbanir-haat.pid" }
$LogDir = if ($env:LOG_DIR) { $env:LOG_DIR } else { Join-Path $RootDir "logs" }
$LogFile = if ($env:LOG_FILE) { $env:LOG_FILE } else { Join-Path $LogDir "qurbanir-haat.server.log" }
$ConsoleLogFile = if ($env:CONSOLE_LOG_FILE) {
  $env:CONSOLE_LOG_FILE
} else {
  Join-Path $LogDir "qurbanir-haat.console.log"
}
$ConsoleErrorLogFile = if ($env:CONSOLE_ERROR_LOG_FILE) {
  $env:CONSOLE_ERROR_LOG_FILE
} else {
  Join-Path $LogDir "qurbanir-haat.console-error.log"
}
$HealthBodyFile = if ($env:HEALTH_BODY_FILE) {
  $env:HEALTH_BODY_FILE
} else {
  Join-Path $LogDir "qurbanir-haat.health.html"
}
$EnvFile = if ($env:ENV_FILE) { $env:ENV_FILE } else { Join-Path $RootDir ".env" }

New-Item -ItemType Directory -Force -Path $RunDir, $LogDir | Out-Null

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

if (Test-Path -LiteralPath $PidFile) {
  $ExistingPid = (Get-Content -LiteralPath $PidFile -Raw).Trim()
  if ($ExistingPid) {
    $ExistingProcess = Get-Process -Id $ExistingPid -ErrorAction SilentlyContinue
    if ($ExistingProcess) {
      Write-Host "Qurbanir Haat is already running with PID $ExistingPid."
      exit 0
    }
  }
  Remove-Item -LiteralPath $PidFile -Force
}

$ServerEntry = Join-Path $RootDir ".output\server\index.mjs"
if (-not (Test-Path -LiteralPath $ServerEntry)) {
  throw "Missing .output\server\index.mjs. Run npm ci and npm run build first."
}

if (Test-Path -LiteralPath $EnvFile) {
  Get-Content -LiteralPath $EnvFile | ForEach-Object {
    $Line = $_.Trim()
    if (-not $Line -or $Line.StartsWith("#")) { return }
    if ($Line -match "^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$") {
      $Name = $matches[1]
      $Value = $matches[2].Trim()
      if (
        ($Value.StartsWith('"') -and $Value.EndsWith('"')) -or
        ($Value.StartsWith("'") -and $Value.EndsWith("'"))
      ) {
        $Value = $Value.Substring(1, $Value.Length - 2)
      }
      [Environment]::SetEnvironmentVariable($Name, $Value, "Process")
    }
  }
}

if (-not $env:NODE_ENV) {
  $env:NODE_ENV = "production"
}
if (-not $env:PORT) {
  $env:PORT = "3000"
}

$MissingConfig = @()
if (-not ($env:SUPABASE_URL -or $env:VITE_SUPABASE_URL)) {
  $MissingConfig += "SUPABASE_URL"
}
if (-not ($env:SUPABASE_PUBLISHABLE_KEY -or $env:VITE_SUPABASE_PUBLISHABLE_KEY)) {
  $MissingConfig += "SUPABASE_PUBLISHABLE_KEY"
}
if ($MissingConfig.Count -gt 0) {
  throw "Missing required Supabase config: $($MissingConfig -join ', '). Add it to .env or the server environment, then restart."
}

function Test-PortOpen {
  param([int]$Port)

  $Client = [System.Net.Sockets.TcpClient]::new()
  try {
    $Connect = $Client.BeginConnect("127.0.0.1", $Port, $null, $null)
    if (-not $Connect.AsyncWaitHandle.WaitOne(500)) {
      return $false
    }
    $Client.EndConnect($Connect)
    return $true
  } catch {
    return $false
  } finally {
    $Client.Close()
  }
}

if (Test-PortOpen -Port ([int]$env:PORT)) {
  throw "Port $env:PORT is already in use. Stop that process or choose another PORT."
}

$Runner = Join-Path $PSScriptRoot "run-server.ps1"
$env:LOG_FILE = $LogFile

$Process = Start-Process `
  -FilePath "powershell.exe" `
  -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    $Runner,
    "-RootDir",
    $RootDir,
    "-ConsoleLogFile",
    $ConsoleLogFile,
    "-ConsoleErrorLogFile",
    $ConsoleErrorLogFile
  ) `
  -WorkingDirectory $RootDir `
  -WindowStyle Hidden `
  -PassThru

Set-Content -LiteralPath $PidFile -Value $Process.Id

function Fail-Start {
  param([string]$Message)

  Stop-ProcessTree -ProcessId ([int]$Process.Id)
  Remove-Item -LiteralPath $PidFile -Force -ErrorAction SilentlyContinue
  throw "$Message Check $LogFile, $ConsoleLogFile, $ConsoleErrorLogFile, and $HealthBodyFile."
}

$HealthUrl = "http://127.0.0.1:$env:PORT/"
$Healthy = $false
$LastError = ""

for ($i = 0; $i -lt 20; $i++) {
  Start-Sleep -Seconds 1

  if (-not (Get-Process -Id $Process.Id -ErrorAction SilentlyContinue)) {
    Fail-Start "Qurbanir Haat exited before it became healthy."
  }

  try {
    $Response = Invoke-WebRequest -UseBasicParsing -Uri $HealthUrl -TimeoutSec 5
    if ($Response.Content -match "This page didn't load") {
      Set-Content -LiteralPath $HealthBodyFile -Value $Response.Content -Encoding UTF8
      Fail-Start "Qurbanir Haat started but rendered the fallback error page."
    }
    Remove-Item -LiteralPath $HealthBodyFile -Force -ErrorAction SilentlyContinue
    $Healthy = $true
    break
  } catch {
    $LastError = $_.Exception.Message
  }
}

if (-not $Healthy) {
  Fail-Start "Qurbanir Haat did not respond at $HealthUrl. Last error: $LastError."
}

Write-Host "Started Qurbanir Haat with PID $($Process.Id)."
Write-Host "URL: $HealthUrl"
Write-Host "Server log: $LogFile"
Write-Host "Console log: $ConsoleLogFile"
Write-Host "Console error log: $ConsoleErrorLogFile"
Write-Host "Health body: $HealthBodyFile"
