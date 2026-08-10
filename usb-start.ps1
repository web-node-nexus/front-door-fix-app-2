# Front Door — Expo USB launch
# Phone: USB Debugging ON + "Allow USB debugging" prompt Accept

Write-Host "=== Front Door Expo USB ===" -ForegroundColor Magenta

$adb = "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe"
if (-not (Test-Path $adb)) { $adb = "adb" }

& $adb start-server | Out-Null
Write-Host "`n[1] Checking USB phone..." -ForegroundColor Cyan
& $adb devices -l

$deviceLine = (& $adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "device$" })
if (-not $deviceLine) {
    Write-Host "`nPhone nahi mila. Phone pe yeh karo:" -ForegroundColor Yellow
    Write-Host "  1) Developer options ON"
    Write-Host "  2) USB debugging ON"
    Write-Host "  3) USB mode = File Transfer (MTP)"
    Write-Host "  4) Cable reconnect + Allow this computer"
    Write-Host "`nWaiting 45s for phone..." -ForegroundColor Cyan
    $deadline = (Get-Date).AddSeconds(45)
    while ((Get-Date) -lt $deadline) {
        Start-Sleep -Seconds 3
        $deviceLine = (& $adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "device$|unauthorized" })
        if ($deviceLine -match "unauthorized") {
            Write-Host "Phone connected but UNAUTHORIZED — phone pe Allow dabao!" -ForegroundColor Yellow
        }
        if ($deviceLine -match "device$") { break }
        Write-Host "  still waiting..."
    }
}

$deviceLine = (& $adb devices | Select-Object -Skip 1 | Where-Object { $_ -match "device$" })
if (-not $deviceLine) {
    Write-Host "`nFAIL: USB phone still not detected." -ForegroundColor Red
    exit 1
}

Write-Host "`n[2] Port reverse (Metro 8081 + API 8000)..." -ForegroundColor Cyan
& $adb reverse --remove-all 2>$null
& $adb reverse tcp:8081 tcp:8081
& $adb reverse tcp:8000 tcp:8000
& $adb reverse --list

Write-Host "`n[3] Starting Expo (USB / localhost)..." -ForegroundColor Green
Write-Host "Phone Expo Go me open karo: exp://127.0.0.1:8081" -ForegroundColor Yellow
Set-Location $PSScriptRoot
npx expo start --localhost --port 8081
