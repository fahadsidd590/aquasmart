# AquaSmart Backend (.NET + MongoDB)

This backend receives IoT readings from ESP devices and stores every reading in MongoDB.
It keeps full history (no overwrite), so you can track all data over time.

## Stack

- ASP.NET Core Web API (`.NET 9`)
- MongoDB (`MongoDB.Driver`)

## Project Path

`backend/AquaSmart.Api`

## Configure MongoDB

Update `backend/AquaSmart.Api/appsettings.json`:

```json
"MongoDb": {
  "ConnectionString": "mongodb://localhost:27017",
  "DatabaseName": "aquasmart",
  "ReadingsCollectionName": "sensor_readings",
  "SettingsCollectionName": "device_settings",
  "ControlActionsCollectionName": "control_actions",
  "UsersCollectionName": "users",
  "WaterFiltersCollectionName": "water_filters",
  "FilterHistoryCollectionName": "filter_history"
}
```

### JWT (required for admin portal and mobile ` /api/me/*`)

Set a long random `Jwt:SecretKey` in `appsettings.json` (or user secrets / environment variables). Tokens are returned from `POST /api/auth/login` and must be sent as `Authorization: Bearer {token}` for protected routes.

### First SuperAdmin (one-time bootstrap)

1. Set `Bootstrap:Enabled` to `true` and set a strong `Bootstrap:SecretKey`.
2. Call `POST /api/system/bootstrap` with JSON `{ "secretKey", "name", "email", "password" }`.
3. Set `Bootstrap:Enabled` to `false` after the admin exists.

## Run API

```bash
cd backend/AquaSmart.Api
dotnet run
```

Default URL (from launch settings): `http://localhost:5119`

Swagger UI: `http://localhost:5119/swagger`

## Endpoints

- `POST /api/sensorreadings`  
  Add new sensor reading from ESP device.
- `GET /api/sensorreadings/{id}`  
  Get one reading by ID.
- `GET /api/sensorreadings/history?deviceId=esp32-01&sensorType=ph&fromUtc=2026-03-20T00:00:00Z&toUtc=2026-03-23T23:59:59Z&page=1&pageSize=100`  
  Query historical readings with filters and pagination.
- `GET /api/sensorreadings/latest/{deviceId}`  
  Get latest reading per sensor type for one device.
- `GET /api/dashboard/{deviceId}`  
  Dashboard summary data for `DashboardScreen`.
- `GET /api/quality/{deviceId}`  
  Overall + detailed quality metrics for `QualityScreen`.
- `GET /api/quality/{deviceId}/history?sensorType=ph&page=1&pageSize=100`  
  Sensor-wise quality history.
- `GET /api/settings/{deviceId}`  
  Get latest app settings for `SettingsScreen`.
- `PUT /api/settings/{deviceId}`  
  Save app settings and keep settings history.
- `GET /api/settings/{deviceId}/history?page=1&pageSize=100`  
  Settings change history.
- `POST /api/controlactions`  
  Add manual control action (Start Pump / Stop Pump / Purify).
- `GET /api/controlactions/history?deviceId=esp32-01&page=1&pageSize=100`  
  Manual control action history.
- `POST /api/auth/register`  
  Register new user for login screen.
- `POST /api/auth/login`  
  Login with email/password.
- `GET /api/auth/me/{id}`  
  Get current user by id.
- `GET /api/users?page=1&pageSize=20`  
  List users (**requires** `Authorization: Bearer` with role **Admin** or **SuperAdmin**).
- `GET /api/users/{id}`  
  Get user by id (**requires** admin JWT).

### Mobile (logged-in user)

- `GET /api/me/filters` — list this user’s water filters (Bearer token).
- `GET /api/me/filter-alert` — overall status: **Ok**, **ExpiringSoon** (expires within 24h), **ExpiredNeedChange** (past expiry).

### Admin portal APIs (Bearer: **Admin** or **SuperAdmin**)

- `GET /api/admin/dashboard` — user counts, filter counts, expiring/expired table.
- `GET /api/admin/users?role=User&isActive=true&page=1&pageSize=50`
- `POST /api/admin/users` — create app user (default role `User`).
- `PUT /api/admin/users/{id}` — update user (active flag, role, password, name).
- `GET /api/admin/filters` — list filters (optional `userId`, `activeOnly`).
- `POST /api/admin/filters` — assign filter to an **active** app user (`Role=User`); writes **filter history**.
- `PUT /api/admin/filters/{id}` — edit filter; appends history.
- `GET /api/admin/filters/{id}/history` — change history.

## Sample POST Payload

```json
{
  "deviceId": "esp32-01",
  "sensorType": "ph",
  "value": 7.2,
  "unit": "pH",
  "status": "Normal",
  "metadata": {
    "location": "Tank-A"
  },
  "recordedAtUtc": "2026-03-23T14:00:00Z"
}
```

## History Handling

Every incoming reading is inserted as a new MongoDB document with:

- `recordedAtUtc`: timestamp sent from device (or server time if omitted)
- `receivedAtUtc`: server receive time

This guarantees complete timeline/history of all readings.
