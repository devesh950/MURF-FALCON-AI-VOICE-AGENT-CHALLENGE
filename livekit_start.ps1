$exe = Join-Path $PSScriptRoot 'Livekit server\livekit-server.exe'
if (Test-Path $exe) {
  Write-Host "Starting LiveKit from: $exe"
  & $exe --dev
} else {
  Write-Error "LiveKit executable not found at $exe"
  Start-Sleep -Seconds 30
}
