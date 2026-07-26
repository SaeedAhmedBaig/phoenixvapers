# ---------------------------------------------------------------------
# start-mongo.ps1 - start local MongoDB as a single-node replica set.
#
# Portable binaries in .local\mongodb (no Docker, no admin install, by
# project decision). A replica set - even single-node - is required for
# the multi-document transactions and change streams the spec relies on
# (section 16.3). Usage:  pnpm mongo:start   (from the repo root)
#
# NOTE: keep this file ASCII-only. Windows PowerShell 5.1 reads BOM-less
# scripts as ANSI, and typographic dashes/quotes corrupt the parser.
# ---------------------------------------------------------------------

$ErrorActionPreference = "Stop"
$repoRoot  = Split-Path $PSScriptRoot -Parent
$mongod    = Join-Path $repoRoot ".local\mongodb\bin\mongod.exe"
$dataDir   = Join-Path $repoRoot ".local\mongo-data"
$logFile   = Join-Path $repoRoot ".local\mongod.log"

if (-not (Test-Path $mongod)) {
    Write-Error "mongod.exe not found at $mongod - see README 'Prerequisites'."
}

# Already running? A listener on 27017 means there is nothing to do.
$listening = Get-NetTCPConnection -LocalPort 27017 -State Listen -ErrorAction SilentlyContinue
if ($listening) {
    Write-Host "MongoDB is already running on port 27017." -ForegroundColor Green
    exit 0
}

New-Item -ItemType Directory -Force $dataDir | Out-Null

# Bind to loopback only - the dev database is never reachable from the LAN.
Start-Process -FilePath $mongod -WindowStyle Hidden -ArgumentList @(
    "--dbpath", "`"$dataDir`"",
    "--logpath", "`"$logFile`"",
    "--replSet", "rs0",
    "--bind_ip", "127.0.0.1",
    "--port", "27017"
)

# Wait for the listener before initiating the replica set.
$deadline = (Get-Date).AddSeconds(30)
do {
    Start-Sleep -Milliseconds 500
    $up = Get-NetTCPConnection -LocalPort 27017 -State Listen -ErrorAction SilentlyContinue
} while (-not $up -and (Get-Date) -lt $deadline)

if (-not $up) {
    Write-Error "mongod did not start within 30s - see $logFile"
}

# Initiate the single-node replica set (no-op if already initiated).
# Runs from apps/api so 'mongoose' resolves from that workspace.
Push-Location (Join-Path $repoRoot "apps\api")
node ..\..\scripts\init-replica-set.mjs
Pop-Location

Write-Host "MongoDB running on 127.0.0.1:27017 (replica set rs0)." -ForegroundColor Green
