# Installs Node.js LTS just for this Windows user (no admin password needed).
$ErrorActionPreference = 'Stop'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$dest = Join-Path $env:LOCALAPPDATA 'RallyNode'
if (Test-Path (Join-Path $dest 'node.exe')) { Write-Host 'Node.js is already installed for Rally.'; exit 0 }

Write-Host 'Finding the newest Node.js LTS...'
$lts = (Invoke-RestMethod 'https://nodejs.org/dist/index.json') | Where-Object { $_.lts } | Select-Object -First 1
$name = "node-$($lts.version)-win-x64"
$zip = Join-Path $env:TEMP "$name.zip"
Write-Host "Downloading Node.js $($lts.version) LTS..."
Invoke-WebRequest "https://nodejs.org/dist/$($lts.version)/$name.zip" -OutFile $zip -UseBasicParsing
Write-Host 'Unpacking...'
$tmp = Join-Path $env:TEMP 'rally-node-unzip'
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
Expand-Archive $zip -DestinationPath $tmp
Move-Item (Join-Path $tmp $name) $dest
Remove-Item $zip -Force
Write-Host "Node.js $($lts.version) installed in $dest"
