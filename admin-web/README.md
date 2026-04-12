# AquaSmart Admin Web

React + Vite portal for **SuperAdmin** and **Admin** users.

## Prerequisites

1. Run the API (`backend/AquaSmart.Api`) so it listens on `http://localhost:5119`.
2. Create the first **SuperAdmin** once using the bootstrap endpoint (see `backend/README.md`), then log in here.

## Install and run

```bash
cd admin-web
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

The Vite dev server proxies `/api` to `http://localhost:5119` (see `vite.config.js`).

## Features

- **Dashboard**: app user counts, filter counts, expiring/expired table.
- **Users**: create app users (`Role=User`) and toggle active.
- **Filters**: assign a water filter to an **active** app user with install + expiry dates; view change history.

## Production build

```bash
npm run build
```

Serve the `dist` folder behind HTTPS and point it at your production API URL (update `api.js` or use env-based base URL if you extend the app).
