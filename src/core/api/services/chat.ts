import { apiData, apiRequest } from '../client';
import type { ApiResponse } from '../types';

export interface ChatUserRecord {
  id: number;
  name: string;
  image?: string | null;
}

export interface ChatPostRecord {
  id: number;
  title: string;
  image?: string | null;
}

export interface ChatThreadRecord {
  thread_key: string;
  post_id: number;
  member_id: number;
  last_message: string;
  last_message_time?: string;
  updated_at?: string;
  unread_count: number;
  post?: ChatPostRecord | null;
  user?: ChatUserRecord | null;
}

export interface ChatMessageRecord {
  id: number;
  post_id: number;
  sender_id: number;
  receiver_id: number;
  message: string;
  image?: string | null;
  is_read: number;
  created_at?: string;
  sender?: ChatUserRecord | null;
  receiver?: ChatUserRecord | null;
}

export interface ChatThreadDetailResponse {
  thread: {
    thread_key: string;
    post_id: number;
    member_id: number;
    post?: ChatPostRecord | null;
    user?: ChatUserRecord | null;
  };
  records: ChatMessageRecord[];
}

export function getChats(): Promise<ChatThreadRecord[]> {
  return apiData<{ records: ChatThreadRecord[] }>('chat/getChats').then((r) => r?.records ?? []);
}

export function getChatThread(memberId: number, postId: number): Promise<ChatThreadDetailResponse> {
  return apiData<ChatThreadDetailResponse>(`chat/getChatsByID?member_id=${memberId}&post_id=${postId}`);
}

export function addChat(payload: { member_id: number; post_id: number; message: string }): Promise<ApiResponse<ChatMessageRecord>> {
  return apiRequest<ChatMessageRecord>('chat/addChat', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
