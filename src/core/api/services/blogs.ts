import { apiData } from '../client';

export interface BlogRecord {
  id: number;
  title: string;
  slug?: string;
  image?: string;
  description?: string;
  created_at?: string;
}

export async function getBlogs(): Promise<BlogRecord[]> {
  const res = await apiData<{ records: BlogRecord[] }>('blogs/');
  return res?.records ?? [];
}

export function getBlogDetail(id: string | number): Promise<BlogRecord> {
  return apiData<BlogRecord>(`blogs/detail?id=${id}`);
}
