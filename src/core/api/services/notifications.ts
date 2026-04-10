import { apiData, apiRequest } from '../client';
import type { ApiResponse } from '../types';

const PREFIX = 'notifications';

export interface NotificationRecord {
  id: number;
  title?: string | null;
  message?: string | null;
  trigger_id?: number | string | null;
  trigger_type?: string | null;
  image?: string | null;
  is_read: boolean;
  created_at?: string;
  sender?: {
    id: number;
    name: string;
    image?: string | null;
  } | null;
}

export interface NotificationsResponse {
  records: NotificationRecord[];
  unread_count: number;
}

export function getNotifications(): Promise<NotificationsResponse> {
  return apiData<NotificationsResponse>(PREFIX);
}

export function markNotificationsRead(notificationId?: number): Promise<ApiResponse<unknown>> {
  return apiRequest(`${PREFIX}/notificationRead`, {
    method: 'POST',
    body: JSON.stringify(notificationId ? { notification_id: notificationId } : {}),
  });
}

export function deleteNotification(notificationId: number): Promise<ApiResponse<unknown>> {
  return apiRequest(`${PREFIX}/notificationDelete`, {
    method: 'POST',
    body: JSON.stringify({ type: 'single', notification_id: notificationId }),
  });
}

export function deleteAllNotifications(): Promise<ApiResponse<unknown>> {
  return apiRequest(`${PREFIX}/notificationDelete`, {
    method: 'POST',
    body: JSON.stringify({ type: 'mass' }),
  });
}
