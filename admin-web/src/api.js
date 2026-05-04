const TOKEN_KEY = 'aquasmart_admin_token';
const ROLE_KEY = 'aquasmart_admin_role';

/**
 * Absolute API origin (no trailing slash).
 * - `VITE_API_BASE_URL` wins (use in production builds).
 * - Else `VITE_API_PROXY_TARGET` so the browser calls your real API host (Network tab
 *   shows that URL, not localhost). Same value as in vite proxy config.
 * - If neither is set, requests stay relative `/api...` (Vite dev proxy only).
 */
function apiBaseUrl() {
  const base = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/$/, '');
  if (base) return base;
  const target = (import.meta.env.VITE_API_PROXY_TARGET || '').trim().replace(/\/$/, '');
  return target;
}

function resolveApiUrl(path) {
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const base = apiBaseUrl();
  if (!base) return path;
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

/** Role from last login (`SuperAdmin` | `Admin`). Cleared with logout. */
export function getPortalRole() {
  return localStorage.getItem(ROLE_KEY) || '';
}

export function setPortalRole(role) {
  if (role) localStorage.setItem(ROLE_KEY, role);
  else localStorage.removeItem(ROLE_KEY);
}

export async function api(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  const t = getToken();
  if (t) headers.Authorization = `Bearer ${t}`;

  const res = await fetch(resolveApiUrl(path), { ...options, headers });
  const text = await res.text();
  let body = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }
  if (!res.ok) {
    const err = new Error(body?.message || res.statusText || 'Request failed');
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}
