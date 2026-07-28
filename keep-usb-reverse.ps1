# Keep USB adb reverse alive for Expo Go (ports drop when cable blips).
Write-Host "USB reverse keeper started. Keep this window open." -ForegroundColor Green
while ($true) {
  $devices = adb devices 2>$null | Select-String "`tdevice$"
  if ($devices) {
    adb reverse tcp:8081 tcp:8081 2>$null | Out-Null
    adb reverse tcp:8000 tcp:8000 2>$null | Out-Null
    Write-Host ("[{0}] reverse OK" -f (Get-Date -Format "HH:mm:ss")) -ForegroundColor DarkGreen
  } else {
    Write-Host ("[{0}] phone not connected" -f (Get-Date -Format "HH:mm:ss")) -ForegroundColor Yellow
  }
  Start-Sleep -Seconds 20
}
