/**
 * Posts API – marketplace listings (Laravel posts).
 */

import { apiRequest, apiData, getStoredToken, getApiUrl } from '../client';
import type { ApiResponse } from '../types';

const PREFIX = 'posts';

export interface PostRecord {
  id: number;
  title: string;
  price?: number;
  deposit?: number;
  rent_per_day?: number;
  description?: string;
  slug?: string;
  status?: number;
  views?: number;
  created_at?: string;
  featured_image?: string;
  images?: { id: number; post_id: number; images: string }[];
  post_images?: { id: number; post_id: number; images: string }[];
  user?: { id: number; name: string; email?: string; image?: string; phone?: string; created_at?: string };
  category?: { id: number; title: string; image?: string };
  item_type?: { id: number; title: string };
  condition?: { id: number; title: string };
  city?: { id: number; title: string };
  favourites_count?: number;
  [key: string]: unknown;
}

export interface PostsListResponse {
  records:
    | PostRecord[]
    | {
        data: PostRecord[];
        current_page: number;
        last_page: number;
        total?: number;
        per_page?: number;
      };
}

export interface PaginatedRecords<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total?: number;
  per_page?: number;
}

export interface MyPostsSummary {
  total_ads: number;
  active_ads: number;
  inactive_ads: number;
  total_views: number;
  total_favourites: number;
  monthly_free_limit: number;
  posts_this_month: number;
  remaining_free_posts: number | null;
  has_premium_subscription: boolean;
}

export interface MyPostsResponse {
  records: PaginatedRecords<PostRecord>;
  summary: MyPostsSummary;
}

export interface PostsListParams {
  title?: string;
  city_id?: string | number;
  item_type_id?: string | number;
  category_id?: string | number;
  min_price?: string | number;
  max_price?: string | number;
  sort?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'popular';
  page?: string | number;
  per_page?: string | number;
  featured?: string | number | boolean;
}

export function getPostsList(params?: PostsListParams): Promise<ApiResponse<PostsListResponse>> {
  const q = new URLSearchParams();
  if (params) Object.entries(params).forEach(([k, v]) => q.set(k, String(v)));
  const query = q.toString();
  return apiRequest<PostsListResponse>(`${PREFIX}/${query ? `?${query}` : ''}`);
}

export function getPostDetail(id: string | number): Promise<ApiResponse<PostRecord>> {
  return apiRequest<PostRecord>(`${PREFIX}/detail?id=${id}`);
}

export function getMyPostDetail(id: string | number): Promise<ApiResponse<PostRecord>> {
  return apiRequest<PostRecord>(`${PREFIX}/myPostDetail?id=${id}`);
}

export function getFeaturedPosts(): Promise<PostRecord[]> {
  return apiData<{ records: PostRecord[] }>(`${PREFIX}/getFeaturedPost`).then((r) => r?.records ?? []);
}

export function getNewArrivalPosts(): Promise<PostRecord[]> {
  return apiData<{ records: PostRecord[] }>(`${PREFIX}/getNewArrivalPost`).then((r) => r?.records ?? []);
}

export interface RelatedPostsParams {
  exclude_post_id?: number;
  per_page?: number;
}

export function getPostsByCategory(categoryId: number, params?: RelatedPostsParams): Promise<PostRecord[]> {
  const q = new URLSearchParams({ category_id: String(categoryId) });
  if (params?.exclude_post_id) q.set('exclude_post_id', String(params.exclude_post_id));
  if (params?.per_page) q.set('per_page', String(params.per_page));
  return apiData<{ data?: PostRecord[]; records?: PostRecord[] }>(
    `${PREFIX}/getPostsByCategory?${q.toString()}`
  ).then((r) => r?.data ?? r?.records ?? []);
}

export function getPostsByItemType(itemTypeId: number, params?: RelatedPostsParams): Promise<PostRecord[]> {
  const q = new URLSearchParams({ item_type_id: String(itemTypeId) });
  if (params?.exclude_post_id) q.set('exclude_post_id', String(params.exclude_post_id));
  if (params?.per_page) q.set('per_page', String(params.per_page));
  return apiData<{ data?: PostRecord[]; records?: PostRecord[] }>(
    `${PREFIX}/getPostsByItemType?${q.toString()}`
  ).then((r) => r?.data ?? r?.records ?? []);
}

export function searchPosts(title: string): Promise<PostRecord[]> {
  return apiData<{ data?: PostRecord[]; records?: PostRecord[] }>(`${PREFIX}/search`, {
    method: 'POST',
    body: JSON.stringify({ title }),
  }).then((r) => (Array.isArray(r) ? r : r?.data ?? r?.records ?? []));
}

export interface SearchFiltersPayload {
  category_id?: number;
  city_id?: number;
  condition_id?: number;
  item_type_id?: number;
  title?: string;
  min_price?: number;
  max_price?: number;
  [key: string]: unknown;
}

export function searchFilters(filters: SearchFiltersPayload): Promise<PostRecord[]> {
  return apiData<{ records: PostRecord[] }>(`${PREFIX}/searchFilters`, {
    method: 'POST',
    body: JSON.stringify(filters),
  }).then((r) => r?.records ?? []);
}

export function getMyPosts(params?: { page?: number; per_page?: number }): Promise<MyPostsResponse> {
  const q = new URLSearchParams();
  if (params?.page) q.set('page', String(params.page));
  if (params?.per_page) q.set('per_page', String(params.per_page));
  const query = q.toString();
  return apiData<MyPostsResponse>(`${PREFIX}/myPosts${query ? `?${query}` : ''}`);
}

export interface CreatePostPayload {
  category_id: number;
  item_type_id: number;
  condition_id: number;
  city_id: number;
  title: string;
  description: string;
  price?: number;
  deposit?: number;
  rent_per_day?: number;
  images: File[] | string[];
}

export interface DeletePostImagePayload {
  post_id: number;
  post_image_id: number;
}

export function createPost(payload: FormData): Promise<ApiResponse<PostRecord>> {
  const token = getStoredToken();
  const headers: HeadersInit = { Accept: 'application/json' };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  return fetch(getApiUrl(`${PREFIX}/addPost`), { method: 'POST', body: payload, headers }).then((r) =>
    r.json() as Promise<ApiResponse<PostRecord>>
  );
}

export function updatePost(postId: number, payload: FormData): Promise<ApiResponse<PostRecord>> {
  const token = getStoredToken();
  const headers: HeadersInit = { Accept: 'application/json' };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const body = new FormData();
  body.set('post_id', String(postId));
  payload.forEach((v, k) => body.append(k, v));
  return fetch(getApiUrl(`${PREFIX}/updatePost`), { method: 'POST', body, headers }).then((r) =>
    r.json() as Promise<ApiResponse<PostRecord>>
  );
}

export function deletePost(postId: number): Promise<ApiResponse<unknown>> {
  return apiRequest(`${PREFIX}/deletePost`, {
    method: 'POST',
    body: JSON.stringify({ post_id: postId }),
  });
}

export function deletePostImage(payload: DeletePostImagePayload): Promise<ApiResponse<unknown>> {
  return apiRequest(`${PREFIX}/deletePostImage`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
