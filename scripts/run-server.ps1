param(
  [Parameter(Mandatory = $true)]
  [string]$RootDir,

  [Parameter(Mandatory = $true)]
  [string]$ConsoleLogFile,

  [Parameter(Mandatory = $true)]
  [string]$ConsoleErrorLogFile
)

$ErrorActionPreference = "Stop"

Set-Location -LiteralPath $RootDir
& node ".output/server/index.mjs" 1>> $ConsoleLogFile 2>> $ConsoleErrorLogFile
