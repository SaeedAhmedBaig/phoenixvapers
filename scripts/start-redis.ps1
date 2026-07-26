# ---------------------------------------------------------------------
# start-redis.ps1 - start the local Redis server if it is not running.
#
# We run Redis natively on Windows (no Docker, by project decision) via
# the winget portable package taizod1024.redis-windows-fork.
# Usage:  pnpm redis:start   (from the repo root)
#
# NOTE: keep this file ASCII-only. Windows PowerShell 5.1 reads BOM-less
# scripts as ANSI, and typographic dashes/quotes corrupt the parser.
# ---------------------------------------------------------------------

$ErrorActionPreference = "Stop"

# Already running? A listener on 6379 means there is nothing to do.
$listening = Get-NetTCPConnection -LocalPort 6379 -State Listen -ErrorAction SilentlyContinue
if ($listening) {
    Write-Host "Redis is already running on port 6379." -ForegroundColor Green
    exit 0
}

# Locate redis-server.exe inside the winget portable package.
$packagesRoot = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages"
$redisExe = Get-ChildItem -Path $packagesRoot -Recurse -Filter "redis-server.exe" -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty FullName

if (-not $redisExe) {
    Write-Error "redis-server.exe not found. Install it with: winget install taizod1024.redis-windows-fork --scope user"
}

Start-Process -FilePath $redisExe -WindowStyle Hidden
Start-Sleep -Seconds 2

# Confirm it came up before declaring success.
$redisCli = Join-Path (Split-Path $redisExe) "redis-cli.exe"
$pong = & $redisCli ping 2>$null
if ($pong -eq "PONG") {
    Write-Host "Redis started on port 6379." -ForegroundColor Green
} else {
    Write-Error "Redis was launched but did not respond to PING - check the server log."
}
