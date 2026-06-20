# Front Door - Expo Go USB start
Write-Host "=== Front Door Expo Go ===" -ForegroundColor Magenta

Set-Location $PSScriptRoot

# WiFi IP for QR page
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notmatch 'Loopback' -and $_.IPAddress -notlike '169.*'
} | Select-Object -First 1).IPAddress

if ($ip) {
    Write-Host "WiFi IP: $ip" -ForegroundColor Cyan
    $htmlPath = Join-Path $PSScriptRoot "open-qr.html"
    if (Test-Path $htmlPath) {
        $html = Get-Content $htmlPath -Raw -Encoding UTF8
        $html = $html -replace "const wifiIp = '[\d.]+';", "const wifiIp = '$ip';"
        [System.IO.File]::WriteAllText($htmlPath, $html)
    }
}

Write-Host "[1] Phone..." -ForegroundColor Cyan
adb devices

Write-Host "[2] adb reverse..." -ForegroundColor Cyan
adb reverse tcp:8081 tcp:8081
adb reverse tcp:8000 tcp:8000
adb reverse --list

Write-Host "[3] Backend check port 8000..." -ForegroundColor Cyan
$backendUp = $false
try {
    $null = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/home" -UseBasicParsing -TimeoutSec 3
    $backendUp = $true
    Write-Host "  Backend OK" -ForegroundColor Green
} catch {
    Write-Host "  Backend NOT running - starting..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd E:\service-platform\website; php artisan serve --host=0.0.0.0 --port=8000"
    Start-Sleep -Seconds 4
    try {
        $null = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/home" -UseBasicParsing -TimeoutSec 5
        $backendUp = $true
        Write-Host "  Backend started OK" -ForegroundColor Green
    } catch {
        Write-Host "  Backend still down! Manually run: php artisan serve --host=0.0.0.0 --port=8000" -ForegroundColor Red
    }
}

Write-Host "[4] Login API test..." -ForegroundColor Cyan
try {
    $loginBody = '{"email":"customer@frontdoor.in","password":"password"}'
    $lr = Invoke-WebRequest -Uri "http://127.0.0.1:8000/api/login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing -TimeoutSec 5
    Write-Host "  Login API OK ($($lr.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "  Login API FAILED - check database" -ForegroundColor Red
}

Write-Host "[5] Free port 8081..." -ForegroundColor Cyan
$on8081 = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($procId in $on8081) {
    if ($procId -and $procId -ne 0) {
        Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
    }
}

Write-Host "[6] Open QR page..." -ForegroundColor Green
Start-Process (Join-Path $PSScriptRoot "open-qr.html")

Write-Host ""
Write-Host "USB QR scan: exp://127.0.0.1:8081" -ForegroundColor Cyan
Write-Host "Login: customer@frontdoor.in / password" -ForegroundColor Cyan
Write-Host ""

$env:EXPO_OFFLINE = '1'
npx expo start --offline
