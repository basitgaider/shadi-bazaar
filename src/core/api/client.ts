/**
 * API client for Laravel backend (shadi-bazaar-v2).
 * Uses VITE_API_BASE_URL; auth via Bearer token from getStoredToken().
 */

import { API_BASE_URL } from '../constants';
import type { ApiResponse } from './types';
import { isApiSuccess } from './types';

const defaultHeaders: HeadersInit = {
  Accept: 'application/json',
};

/** Token storage key for Laravel Passport access token. */
export const AUTH_TOKEN_KEY = 'shadi_bazaar_access_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token == null) localStorage.removeItem(AUTH_TOKEN_KEY);
    else localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch {
    // ignore
  }
}

export function getApiUrl(path: string): string {
  const base = getApiBaseUrl();
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

function getApiBaseUrl(): string {
  const base = API_BASE_URL.replace(/\/$/, '');

  if (!base) return '';

  // Route API calls through the local Vite proxy during development so the
  // browser does not perform a cross-origin preflight against the remote API.
  if (import.meta.env.DEV) {
    try {
      const parsed = new URL(base);
      return `/__api_proxy${parsed.pathname}`;
    } catch {
      return base;
    }
  }

  return base;
}

/** Strip "Bearer " prefix so we never send "Bearer Bearer ...". */
function getRawToken(token: string | null): string | null {
  if (!token) return null;
  const raw = token.replace(/^\s*Bearer\s+/i, '');
  return raw || null;
}

function buildHeaders(options: RequestInit, token: string | null): HeadersInit {
  const headers: Record<string, string> = { ...defaultHeaders } as Record<string, string>;
  const raw = getRawToken(token);
  if (raw) headers['Authorization'] = `Bearer ${raw}`;
  const method = String(options.method ?? 'GET').toUpperCase();
  const hasBody = options.body != null && method !== 'GET' && method !== 'HEAD';
  if (hasBody) headers['Content-Type'] = 'application/json';
  return { ...headers, ...(options.headers as Record<string, string>) };
}

/**
 * Request the API and return the parsed JSON. Throws on HTTP error or when response.status !== 1.
 */
export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const url = API_BASE_URL ? getApiUrl(path) : path;
  const token = getStoredToken();
  const res = await fetch(url, {
    ...options,
    headers: buildHeaders(options, token),
  });
  const json = (await res.json()) as ApiResponse<T>;
  if (!res.ok) {
    const msg = json?.message ?? `API error: ${res.status} ${res.statusText}`;
    const err = new Error(msg) as Error & { status: number; data?: unknown };
    err.status = res.status;
    err.data = json?.data;
    throw err;
  }
  return json;
}

/**
 * Same as apiRequest but returns only data when status === 1; otherwise throws with message.
 */
export async function apiData<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await apiRequest<T>(path, options);
  if (!isApiSuccess(res)) {
    const err = new Error(res.message ?? 'Request failed') as Error & { data?: unknown };
    err.data = res.data;
    throw err;
  }
  return res.data;
}
