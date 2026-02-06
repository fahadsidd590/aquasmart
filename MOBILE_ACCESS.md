# Opening AquaSmart Web on Your Phone

If the app works on your laptop but shows **"Something went wrong"** on your phone (same Wi‑Fi), follow these steps.

## 1. Start the server for LAN access

From the project folder run:

```bash
npm run web:lan
```

Or:

```bash
npm run web
```

(The project is configured so the dev server is reachable from your network.)

## 2. Get your PC’s IP address

- **Windows:** Open Command Prompt or PowerShell and run:
  ```bash
  ipconfig
  ```
  Find **IPv4 Address** under your Wi‑Fi adapter (e.g. `192.168.1.100`).

- **Mac:** System Settings → Network → Wi‑Fi → Details, or run `ifconfig` in Terminal.

## 3. Open the app on your phone

1. Ensure your phone is on the **same Wi‑Fi** as your laptop.
2. On your phone’s browser, go to:
   ```
   http://YOUR_PC_IP:19006
   ```
   Example: `http://192.168.1.100:19006`

   (Use the port number shown in the terminal when you run `npm run web` or `npm run web:lan` if it’s different.)

## 4. If it still doesn’t load

- **Windows Firewall:** When you first run the dev server, Windows may ask to allow Node/JavaScript. Click **Allow access** so your phone can connect.
- **Wrong URL:** Do **not** use `localhost` or `127.0.0.1` on your phone. Use the PC’s IP (e.g. `192.168.1.100`) as above.
- **QR code:** If you use a QR code, make sure it points to `http://YOUR_PC_IP:19006`, not to `http://localhost:19006`.
