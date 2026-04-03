/**
 * Website auth API.
 */

import { apiRequest, getApiUrl, getStoredToken, setStoredToken } from '../client';
import type { ApiResponse } from '../types';

const PREFIX = 'auth';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface VerifyOtpPayload {
  email: string;
  otp: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  otp: string;
  password: string;
  password_confirmation: string;
}

export interface AuthUser {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  country_code?: string;
  image?: string;
  whatsapp_number?: string;
  address?: string;
  city_id?: number | string;
  show_my_phone_number_in_ads?: boolean | number | string;
  send_me_sms_in_ads?: boolean | number | string;
  send_me_whatsapp_in_ads?: boolean | number | string;
  access_token?: string;
  token?: string;
}

function persistTokenFromResponse(res: ApiResponse<AuthUser>) {
  if (res.status !== 1 || !res.data) return;

  const raw = (res.data as AuthUser & { access_token?: string }).access_token
    ?? (res.data as AuthUser & { token?: string }).token;
  const token = typeof raw === 'string' ? raw.replace(/^\s*Bearer\s+/i, '') : '';

  if (token) {
    setStoredToken(token);
  }
}

export async function login(payload: LoginPayload): Promise<ApiResponse<AuthUser>> {
  const res = await apiRequest<AuthUser>(`${PREFIX}/login`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  persistTokenFromResponse(res);
  return res;
}

export async function register(payload: RegisterPayload): Promise<ApiResponse<AuthUser>> {
  return apiRequest<AuthUser>(`${PREFIX}/register`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function verifyOtp(payload: VerifyOtpPayload): Promise<ApiResponse<AuthUser>> {
  return apiRequest<AuthUser>(`${PREFIX}/verify-otp`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function resendOtp(payload: { email: string }): Promise<ApiResponse<unknown>> {
  return apiRequest(`${PREFIX}/resend-otp`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function forgotPassword(payload: ForgotPasswordPayload): Promise<ApiResponse<unknown>> {
  return apiRequest(`${PREFIX}/forgot-password`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<ApiResponse<unknown>> {
  return apiRequest(`${PREFIX}/reset-password`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export interface ProfileResponse {
  records: AuthUser;
}

export async function getProfile(): Promise<ApiResponse<ProfileResponse>> {
  return apiRequest(`${PREFIX}/profile`);
}

export async function updateProfile(formData: FormData): Promise<ApiResponse<unknown>> {
  const token = getStoredToken();
  const headers: HeadersInit = { Accept: 'application/json' };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;

  const res = await fetch(getApiUrl(`${PREFIX}/update-profile`), {
    method: 'POST',
    body: formData,
    headers,
  });

  return res.json() as Promise<ApiResponse<unknown>>;
}

export async function changePassword(payload: {
  old_password: string;
  password: string;
  password_confirmation: string;
}): Promise<ApiResponse<unknown>> {
  return apiRequest(`${PREFIX}/change-password`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function signOut(): Promise<ApiResponse<unknown>> {
  try {
    return await apiRequest<unknown>(`${PREFIX}/logout`, { method: 'GET' });
  } finally {
    setStoredToken(null);
  }
}
