import { API_BASE_URL } from '@/core/constants';
import type { FeedComment, FeedPostRecord } from '@/core/api/services/feed';
import type { FavouriteRecord } from '@/core/api/services/favourites';
import type { PostRecord } from '@/core/api/services/posts';
import type { Ad } from '../data/mockData';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1761571259874-bb4871c44340?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080';

function getBaseOrigin(): string {
  if (!API_BASE_URL) return '';
  try {
    return new URL(API_BASE_URL).origin;
  } catch {
    return '';
  }
}

function normalizeApiAssetPath(path: string): string {
  const normalized = path.trim();

  if (!normalized) return normalized;

  if (/^https?:\/\//i.test(normalized)) {
    try {
      const url = new URL(normalized);
      url.pathname = url.pathname.replace(/^\/public(?=\/)/, '');
      return url.toString();
    } catch {
      return normalized;
    }
  }

  return normalized.replace(/^\/public(?=\/)/, '');
}

export function resolveApiAssetUrl(path?: string | null): string {
  if (!path) return FALLBACK_IMAGE;
  const normalizedPath = normalizeApiAssetPath(path);
  if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;
  const origin = getBaseOrigin();
  if (!origin) return normalizedPath;
  return `${origin}${normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`}`;
}

export function stripHtml(value?: string | null): string {
  if (!value) return '';
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function truncateText(value?: string | null, maxLength = 160): string {
  const normalized = stripHtml(value);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trimEnd()}...`;
}

export function formatDisplayDate(value?: string | null, fallback = 'Recently'): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function formatPhoneForDial(value?: string | null): string {
  return value?.replace(/[^\d+]/g, '') || '+92';
}

export function normalizePhoneInput(raw: string): { countryCode: string; phone: string; display: string } {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) {
    return { countryCode: '92', phone: '', display: '' };
  }

  if (trimmed.startsWith('+')) {
    const countryCode = digits.slice(0, 2) || '92';
    const phone = digits.slice(countryCode.length);
    return {
      countryCode,
      phone,
      display: `+${countryCode}${phone}`,
    };
  }

  if (digits.startsWith('92') && digits.length > 10) {
    return {
      countryCode: '92',
      phone: digits.slice(2),
      display: `+92${digits.slice(2)}`,
    };
  }

  return {
    countryCode: '92',
    phone: digits,
    display: `+92${digits}`,
  };
}

export function mapPostToAd(post: PostRecord, options?: { isFavorite?: boolean }): Ad {
  const primaryImage = post.post_images?.[0]?.images
    ?? post.images?.[0]?.images
    ?? post.featured_image;
  const sellerPhone = formatPhoneForDial(post.user?.phone);
  const sellerMemberSince = post.user?.created_at || post.created_at || '';

  return {
    id: String(post.id),
    title: post.title || 'Untitled listing',
    price: Number(post.price ?? post.rent_per_day ?? post.deposit ?? 0),
    city: post.city?.title || 'Pakistan',
    type: (post.item_type?.title as Ad['type']) || 'Sale',
    condition: (post.condition?.title as Ad['condition']) || 'Used',
    category: post.category?.title || 'Wedding Services',
    image: resolveApiAssetUrl(primaryImage),
    views: Number(post.views ?? 0),
    isFavorite: options?.isFavorite ?? false,
    description: post.description || 'No description provided.',
    seller: {
      id: String(post.user?.id ?? '0'),
      name: post.user?.name || 'ShadiBazar Seller',
      rating: 5,
      memberSince: sellerMemberSince,
      phone: sellerPhone,
      whatsapp: sellerPhone,
      avatar: resolveApiAssetUrl(post.user?.image),
    },
    status: post.status === 1 ? 'Active' : post.status === 0 ? 'Pending' : 'Active',
    createdAt: formatDisplayDate(post.created_at),
  };
}

export function mapFavouriteToAd(favourite: FavouriteRecord): Ad | null {
  const post = favourite.post as PostRecord | undefined;
  if (!post || typeof post !== 'object' || !('id' in post)) return null;
  return mapPostToAd(post, { isFavorite: true });
}

export interface FeedPostViewModel {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: string;
  }>;
  isLiked: boolean;
}

export function mapFeedPost(post: FeedPostRecord): FeedPostViewModel {
  const createdAt = post.created_at ?? post.createdAt ?? '';

  return {
    id: String(post.id),
    userId: String(post.user_id),
    userName: post.user?.name || 'Community member',
    userAvatar: resolveApiAssetUrl(post.user?.image),
    content: post.title,
    image: post.images?.[0]?.images ? resolveApiAssetUrl(post.images[0].images) : undefined,
    timestamp: createdAt,
    likes: Number(post.likes_count ?? 0),
    comments: (post.comments ?? []).map((comment) => mapFeedComment(comment)),
    isLiked: Boolean(post.is_liked),
  };
}

export function mapFeedComment(comment: FeedComment) {
  const createdAt = comment.created_at ?? comment.createdAt ?? '';

  return {
    id: String(comment.id),
    userId: String(comment.user_id),
    userName: comment.user?.name || 'User',
    text: comment.comment,
    timestamp: createdAt,
  };
}
