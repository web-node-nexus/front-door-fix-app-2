# Front Door — Flutter Mobile App

Premium Home Services app connected to Laravel API.

## Run (Phone USB)

```powershell
# Terminal 1 — Backend
cd E:\service-platform\website
php artisan serve --host=0.0.0.0 --port=8000

# Terminal 2 — Flutter
adb reverse tcp:8000 tcp:8000
$env:Path = "C:\flutter\bin;" + $env:Path
cd E:\service-platform\app
flutter pub get
flutter run
```

## Login

- Email: `customer@frontdoor.in`
- Password: `password`

## What Works

| Feature | Status |
|---------|--------|
| Home (API services + categories) | ✅ |
| Search & filter services | ✅ |
| Login / Logout | ✅ |
| Book service (date, slot, address) | ✅ |
| Payment + create booking (API) | ✅ |
| Bookings tabs (API) | ✅ |
| Cancel booking | ✅ |
| Track booking flow (poll API) | ✅ |
| OTP from server | ✅ |
| Live progress checklist | ✅ |
| Review submit (API) | ✅ |
| Chat with professional | ✅ |
| Call / WhatsApp support | ✅ |
| Profile, addresses, payment history | ✅ |
| Raise support ticket | ✅ |

## Booking Flow

Home → Service → Book → Payment → Confirmed → Searching → Professional → Track → OTP → Progress → Completed → Review

## API Base URL

Default: `http://127.0.0.1:8000/api` (with `adb reverse`)

Emulator: `flutter run --dart-define=API_BASE=http://10.0.2.2:8000/api`
