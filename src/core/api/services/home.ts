import { apiData } from '../client';
import type { ItemTypeRecord } from './meta';
import type { CityRecord } from './meta';
import type { PostRecord } from './posts';

export interface HomeBlogRecord {
  id: number;
  title: string;
  image?: string;
  description?: string;
  created_at?: string;
}

export interface HomeResponse {
  featured_posts: PostRecord[];
  new_arrivals: PostRecord[];
  bridal_posts: PostRecord[];
  groom_posts: PostRecord[];
  jewelry_posts: PostRecord[];
  cities: CityRecord[];
  item_types: ItemTypeRecord[];
  blogs: HomeBlogRecord[];
  favourites: Array<{ id: number; post_id: number }>;
}

export function getHome(): Promise<HomeResponse> {
  return apiData<HomeResponse>('home');
}
