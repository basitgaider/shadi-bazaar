import { apiData, apiRequest } from '../client';
import type { PostRecord } from './posts';

export interface PublicProfileRecord {
  id: number;
  name: string;
  image?: string | null;
  phone?: string | null;
  country_code?: string | null;
  whatsapp_number?: string | null;
  city?: string | null;
  address?: string | null;
  rating?: number;
  member_since?: string;
  show_phone?: boolean;
  allow_whatsapp?: boolean;
}

export interface PublicProfileReviewRecord {
  id: number;
  rating: number;
  comments?: string | null;
  created_at?: string;
  user?: {
    id: number;
    name: string;
    image?: string | null;
  } | null;
}

export interface PublicProfileResponse {
  profile: PublicProfileRecord;
  stats: {
    total_ads: number;
    total_reviews: number;
    response_rate: number;
  };
  posts: PostRecord[];
  reviews: PublicProfileReviewRecord[];
}

export function getPublicProfile(userId: string | number): Promise<PublicProfileResponse> {
  return apiData<PublicProfileResponse>(`profiles/detail?user_id=${userId}`);
}

export interface CreateReviewPayload {
  get_review: number;
  rating: number;
  comments?: string;
}

export function addReview(payload: CreateReviewPayload) {
  return apiRequest<PublicProfileReviewRecord>('reviews/addReview', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
