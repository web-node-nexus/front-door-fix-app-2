# Front Door Flutter App — USB Phone Launch
Write-Host "=== Front Door Flutter — USB Start ===" -ForegroundColor Magenta

$flutter = "C:\flutter\bin\flutter.bat"
if (-not (Test-Path $flutter)) {
    $flutter = "flutter"
}

Write-Host "`n[1/3] Checking phone..." -ForegroundColor Cyan
adb devices

Write-Host "`n[2/3] Port reverse (API + Flutter)..." -ForegroundColor Cyan
adb reverse tcp:8000 tcp:8000

Write-Host "`n[3/3] Starting Flutter app on phone..." -ForegroundColor Green
Write-Host "NOTE: Backend alag terminal mein chalao:" -ForegroundColor Yellow
Write-Host "  cd E:\service-platform\website" -ForegroundColor Yellow
Write-Host "  php artisan serve --host=0.0.0.0 --port=8000" -ForegroundColor Yellow
Write-Host ""

$env:Path = "C:\flutter\bin;" + $env:Path
Set-Location $PSScriptRoot
& $flutter pub get
& $flutter run
