import { apiRequest } from '../client';
import type { ApiResponse } from '../types';

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export function submitContact(payload: ContactPayload): Promise<ApiResponse<ContactPayload>> {
  return apiRequest('contacts/addContact', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
