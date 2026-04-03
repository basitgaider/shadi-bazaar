/**
 * App-wide constants.
 * Centralize config and magic strings for easier maintenance.
 */

export const APP_NAME = 'ShadiBazar' as const;
export const APP_TAGLINE = 'Your Wedding Marketplace' as const;

/** Base URL for Laravel API (set in env). */
export const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? '';

/** Route paths – use these for <Link to={ROUTES.HOME} /> to avoid typos. */
export const ROUTES = {
  HOME: '/',
  SEARCH: '/search',
  BLOG: (id: string) => `/blog/${id}`,
  FEED: '/feed',
  LOGIN: '/login',
  SIGNUP: '/signup',
  VERIFY_OTP: '/verify',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  MY_PROFILE: '/my-profile',
  FAVORITES: '/favorites',
  CHAT: '/chat',
  CREATE_AD: '/create-ad',
  EDIT_AD: (id: string) => `/create-ad/${id}`,
  MY_ADS: '/my-ads',
  MY_AD_DETAIL: (id: string) => `/my-ads/${id}`,
  POST: (id: string) => `/post/${id}`,
  PROFILE: (id: string) => `/profile/${id}`,
} as const;
