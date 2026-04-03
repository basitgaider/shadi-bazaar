/**
 * Feed API – social feed (Laravel feed/posts).
 */

import { apiData, apiRequest, getStoredToken, getApiUrl } from '../client';
import type { ApiResponse } from '../types';

const PREFIX = 'feed/posts';

export interface FeedPostRecord {
  id: number;
  user_id: number;
  title: string;
  created_at?: string;
  images?: { id: number; feed_id: number; images: string }[];
  user?: { id: number; name: string; image?: string };
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  comments?: FeedComment[];
  [key: string]: unknown;
}

export function getFeedWithoutAuth(): Promise<FeedPostRecord[]> {
  return apiData<{ records: FeedPostRecord[] | { data: FeedPostRecord[] } }>(`${PREFIX}/getPostsWithoutToken`).then((r) =>
    Array.isArray(r?.records) ? r.records : r?.records?.data ?? []
  );
}

export function getFeed(): Promise<FeedPostRecord[]> {
  return apiData<{ records: FeedPostRecord[] | { data: FeedPostRecord[] } }>(`${PREFIX}/getPosts`).then((r) =>
    Array.isArray(r?.records) ? r.records : r?.records?.data ?? []
  );
}

export function getMyFeedPosts(): Promise<FeedPostRecord[]> {
  return apiData<{ records: FeedPostRecord[] | { data: FeedPostRecord[] } }>(`${PREFIX}/getMyPosts`).then((r) =>
    Array.isArray(r?.records) ? r.records : r?.records?.data ?? []
  );
}

export function getFeedPostDetail(postId: number): Promise<FeedPostRecord> {
  return apiData<FeedPostRecord>(`${PREFIX}/getPostDetail?post_id=${postId}`);
}

export function createFeedPost(payload: { title: string; images?: File[] }): Promise<ApiResponse<FeedPostRecord>> {
  const form = new FormData();
  form.set('title', payload.title);
  payload.images?.forEach((f) => form.append('images[]', f));
  const token = getStoredToken();
  const headers: HeadersInit = { Accept: 'application/json' };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  return fetch(getApiUrl(`${PREFIX}/addPost`), { method: 'POST', body: form, headers }).then((r) =>
    r.json() as Promise<ApiResponse<FeedPostRecord>>
  );
}

export function likeFeedPost(postId: number): Promise<ApiResponse<unknown>> {
  return apiRequest(`${PREFIX}/postLikeRemove`, {
    method: 'POST',
    body: JSON.stringify({ post_id: postId }),
  });
}

export interface FeedComment {
  id: number;
  feed_id: number;
  user_id: number;
  comment: string;
  created_at?: string;
  user?: { id: number; name: string; image?: string };
}

export function getFeedComments(postId: number): Promise<FeedComment[]> {
  return apiData<FeedComment[] | { records: FeedComment[] }>(`${PREFIX}/getCommentsByPost?post_id=${postId}`).then(
    (r) => (Array.isArray(r) ? r : r?.records ?? [])
  );
}

export function addFeedComment(postId: number, comment: string): Promise<ApiResponse<FeedComment>> {
  return apiRequest<FeedComment>(`${PREFIX}/addPostComment`, {
    method: 'POST',
    body: JSON.stringify({ post_id: postId, comment }),
  });
}

export function deleteFeedComment(commentId: number): Promise<ApiResponse<unknown>> {
  return apiRequest(`${PREFIX}/deletePostComment`, {
    method: 'POST',
    body: JSON.stringify({ comment_id: commentId }),
  });
}
