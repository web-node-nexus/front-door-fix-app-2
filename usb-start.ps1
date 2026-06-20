# Phone USB se connect karo + USB Debugging ON
Write-Host 'Setting up USB port forwarding...'
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8000 tcp:8000
adb devices
Write-Host ''
Write-Host 'Expo URL (manual): exp://127.0.0.1:8081'
Write-Host 'Starting Expo...'
npx expo start --clear
