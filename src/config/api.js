import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * PC LAN IP (same Wi‑Fi as the phone). Change if your router assigns a different IP.
 * Android emulator uses 10.0.2.2 instead (see devApiBaseUrl).
 */
const DEV_API_PORT = 5119;
const DEV_PC_LAN_HOST = '192.168.100.49';

function devApiBaseUrl() {
  if (Platform.OS === 'web') {
    return `http://localhost:${DEV_API_PORT}`;
  }
  if (Platform.OS === 'ios' && !Constants.isDevice) {
    return `http://localhost:${DEV_API_PORT}`;
  }
  if (Platform.OS === 'android' && !Constants.isDevice) {
    return `http://10.0.2.2:${DEV_API_PORT}`;
  }
  return `http://${DEV_PC_LAN_HOST}:${DEV_API_PORT}`;
}

/**
 * Base URL for the .NET API (see backend/AquaSmart.Api).
 */
export const API_BASE_URL = __DEV__ ? devApiBaseUrl() : 'https://your-production-api.example';

export async function apiRequest(path, { token, method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }
  if (!res.ok) {
    const msg = typeof data === 'object' && data?.message ? data.message : res.statusText;
    const err = new Error(msg || 'Request failed');
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}
