/**
 * Laravel v2 API response shape (ApiResponse trait).
 */

export interface ApiResponse<T = unknown> {
  status: 0 | 1 | 2;
  message: string;
  data: T;
}

export interface ApiError extends ApiResponse {
  status: 0;
  data: Record<string, string[]> | unknown;
}

export function isApiSuccess<T>(res: ApiResponse<T>): res is ApiResponse<T> & { status: 1 } {
  return res.status === 1;
}
