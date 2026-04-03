/**
 * Single API entry point. All services must use this instance only.
 */

export {
  getApiUrl,
  getStoredToken,
  setStoredToken,
  AUTH_TOKEN_KEY,
  apiRequest,
  apiData,
} from './client';

export type { ApiResponse, ApiError } from './types';
export { isApiSuccess } from './types';

export * from './services';
