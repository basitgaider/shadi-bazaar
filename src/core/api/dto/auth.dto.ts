/**
 * Auth DTOs – request/response shapes for auth API.
 */

/** Login request (API: phone + password). */
export interface LoginRequestDto {
  phone: string;
  password: string;
  device_type?: 'android' | 'ios';
  device_token?: string;
}

/** Register request (API: country_code, phone, verified_by). */
export interface RegisterRequestDto {
  name: string;
  email: string;
  country_code: string;
  phone: string;
  password: string;
  password_confirmation: string;
  verified_by: 'phone';
}

/** Forgot password request (API: country_code + phone). */
export interface ForgotPasswordRequestDto {
  country_code: string;
  phone: string;
}

/** Reset password request (after OTP). */
export interface ResetPasswordRequestDto {
  country_code: string;
  phone: string;
  password: string;
  password_confirmation: string;
}

/** Verify OTP request (after register or forgot). */
export interface VerifyOtpRequestDto {
  country_code: string;
  phone: string;
  otp: string;
}

/** User as returned by API (login/register/getProfile). */
export interface AuthUserDto {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  country_code?: string;
  image?: string;
  address?: string;
  city_id?: number;
  whatsapp_number?: string;
  access_token?: string;
  token?: string;
}

/** Login/register success response data. */
export interface AuthResponseDto {
  status: number;
  message: string;
  data: AuthUserDto;
}
