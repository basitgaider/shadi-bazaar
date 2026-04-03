/**
 * Favourites API – saved posts (auth required).
 */

import { apiData, apiRequest } from '../client';
import type { ApiResponse } from '../types';

const PREFIX = 'favourites';

export interface FavouriteRecord {
  id: number;
  user_id: number;
  post_id?: number;
  post?: { id?: number } & Record<string, unknown>;
  [key: string]: unknown;
}

export function getFavourites(): Promise<FavouriteRecord[]> {
  return apiData<{ records: FavouriteRecord[] }>(`${PREFIX}/`).then((r) => r?.records ?? []);
}

export function addFavourite(postId: number): Promise<ApiResponse<FavouriteRecord>> {
  return apiRequest<FavouriteRecord>(`${PREFIX}/addFavourite`, {
    method: 'POST',
    body: JSON.stringify({ post_id: postId }),
  });
}

export function removeFavourite(favouriteId: number): Promise<ApiResponse<unknown>> {
  return apiRequest(`${PREFIX}/deleteFavourite`, {
    method: 'POST',
    body: JSON.stringify({ favourite_id: favouriteId }),
  });
}
