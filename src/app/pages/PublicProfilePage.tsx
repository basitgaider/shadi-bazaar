import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { LoaderCircle, MapPin, MessageCircle, Phone, Star } from 'lucide-react';
import { toast } from 'sonner';
import { getStoredToken } from '@/core/api/client';
import { addFavourite, getFavourites, removeFavourite } from '@/core/api/services/favourites';
import { addReview, getPublicProfile, type PublicProfileRecord, type PublicProfileReviewRecord } from '@/core/api/services/profiles';
import { ROUTES } from '@/core/constants';
import { AdCard } from '../components/AdCard';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Skeleton } from '../components/ui/skeleton';
import type { Ad } from '../data/mockData';
import { formatDisplayDate, mapPostToAd, resolveApiAssetUrl } from '../utils/marketplace';

interface SellerViewModel {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  whatsapp: string;
  city: string;
  address: string;
  rating: number;
  memberSince: string;
  showPhone: boolean;
  allowWhatsapp: boolean;
}

function ProfileSkeleton() {
  return (
    <>
      <div className="mb-6 rounded-3xl bg-white p-8 shadow-lg">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          <Skeleton className="h-28 w-28 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-5 w-44" />
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-11 w-28 rounded-xl" />
              <Skeleton className="h-11 w-28 rounded-xl" />
              <Skeleton className="h-11 w-32 rounded-xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-2xl" />
        ))}
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
      </div>

      <Skeleton className="mb-6 h-72 rounded-3xl" />
      <Skeleton className="h-96 rounded-3xl" />
    </>
  );
}

export function PublicProfilePage() {
  const { id } = useParams();
  const [seller, setSeller] = useState<SellerViewModel | null>(null);
  const [sellerAds, setSellerAds] = useState<Ad[]>([]);
  const [reviews, setReviews] = useState<PublicProfileReviewRecord[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteMap, setFavoriteMap] = useState<Record<string, number>>({});
  const [stats, setStats] = useState({ total_ads: 0, total_reviews: 0, response_rate: 0 });
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComments, setReviewComments] = useState('');
  const [savingReview, setSavingReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = Boolean(getStoredToken());
  const chatHref = sellerAds[0] ? `${ROUTES.CHAT}?userId=${seller?.id ?? ''}&adId=${sellerAds[0].id}` : null;

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      if (!id) {
        setError('Profile not found.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [profileData, favourites] = await Promise.all([
          getPublicProfile(id),
          isLoggedIn ? getFavourites().catch(() => []) : Promise.resolve([]),
        ]);

        if (!active) return;

        const nextFavoriteIds = new Set(
          favourites
            .map((record) => String(record.post_id ?? (record.post && 'id' in record.post ? record.post.id : '')))
            .filter(Boolean)
        );

        const nextFavoriteMap = favourites.reduce<Record<string, number>>((acc, record) => {
          const postId = record.post_id ?? (record.post && 'id' in record.post ? Number(record.post.id) : undefined);
          if (postId) acc[String(postId)] = record.id;
          return acc;
        }, {});

        setFavoriteIds(nextFavoriteIds);
        setFavoriteMap(nextFavoriteMap);
        setSeller(mapProfileToSeller(profileData.profile));
        setStats(profileData.stats);
        setReviews(profileData.reviews);
        setSellerAds(profileData.posts.map((post) => mapPostToAd(post, { isFavorite: nextFavoriteIds.has(String(post.id)) })));
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load profile.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, [id, isLoggedIn]);

  const adsWithFavorites = useMemo(
    () =>
      sellerAds.map((ad) => ({
        ...ad,
        isFavorite: favoriteIds.has(ad.id),
      })),
    [favoriteIds, sellerAds]
  );

  const canSubmitReview = isLoggedIn && Boolean(id) && !savingReview;

  async function toggleFavorite(adId: string) {
    if (!isLoggedIn) {
      toast.error('Login is required to save favourites.');
      return;
    }

    const wasFavorite = favoriteIds.has(adId);

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFavorite) next.delete(adId);
      else next.add(adId);
      return next;
    });

    try {
      if (wasFavorite) {
        const favouriteId = favoriteMap[adId];
        if (!favouriteId) throw new Error('Favourite reference not found.');
        await removeFavourite(favouriteId);
        setFavoriteMap((prev) => {
          const next = { ...prev };
          delete next[adId];
          return next;
        });
        toast.success('Removed from favourites.');
      } else {
        const response = await addFavourite(Number(adId));
        setFavoriteMap((prev) => ({ ...prev, [adId]: response.data?.id ?? prev[adId] }));
        toast.success('Added to favourites.');
      }
    } catch (favoriteError) {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.add(adId);
        else next.delete(adId);
        return next;
      });
      toast.error(favoriteError instanceof Error ? favoriteError.message : 'Failed to update favourite.');
    }
  }

  async function handleSubmitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id || !isLoggedIn) {
      toast.error('Login is required to submit a review.');
      return;
    }

    setSavingReview(true);

    try {
      const response = await addReview({
        get_review: Number(id),
        rating: reviewRating,
        comments: reviewComments.trim(),
      });

      if (response.status !== 1 || !response.data) {
        throw new Error(response.message || 'Failed to submit review.');
      }

      const nextReviews = [response.data, ...reviews];
      const totalRating = nextReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0);
      const nextAverage = nextReviews.length ? totalRating / nextReviews.length : 0;

      setReviews(nextReviews);
      setStats((prev) => ({
        ...prev,
        total_reviews: nextReviews.length,
      }));
      setSeller((prev) => (prev ? { ...prev, rating: nextAverage } : prev));
      setReviewComments('');
      setReviewRating(5);
      toast.success('Review submitted successfully.');
    } catch (reviewError) {
      toast.error(reviewError instanceof Error ? reviewError.message : 'Failed to submit review.');
    } finally {
      setSavingReview(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-7xl">
            <ProfileSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (error || !seller) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-7xl rounded-3xl border border-red-200 bg-red-50 p-10 text-red-700 shadow-lg">
            {error ?? 'Profile not found.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-7xl">
          <section className="mb-6 rounded-3xl bg-white p-8 shadow-lg">
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <ImageWithFallback src={seller.avatar} alt={seller.name} className="h-28 w-28 rounded-full object-cover" />

              <div className="flex-1">
                <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{seller.name}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className={`h-4 w-4 ${star <= Math.round(seller.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                        ))}
                        <span className="ml-1 font-semibold text-gray-900">{seller.rating.toFixed(1)}</span>
                      </div>
                      <span>Member since {formatDisplayDate(seller.memberSince)}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    {seller.showPhone && seller.phone ? (
                      <a href={`tel:${seller.phone}`} className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-semibold text-white transition-colors hover:bg-green-700">
                        <Phone className="h-4 w-4" />
                        Call
                      </a>
                    ) : null}

                    {chatHref ? (
                      <Link
                        to={chatHref}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-5 py-3 font-semibold text-white transition-shadow hover:shadow-lg"
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat
                      </Link>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-gray-200 px-5 py-3 font-semibold text-gray-500"
                        title="Chat becomes available when the seller has an active listing."
                      >
                        <MessageCircle className="h-4 w-4" />
                        Chat Unavailable
                      </button>
                    )}

                    {seller.allowWhatsapp && seller.whatsapp ? (
                      <a
                        href={`https://wa.me/${seller.whatsapp.replace(/\s/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white transition-colors hover:bg-emerald-600"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-gray-600">
                  <div className="inline-flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <span>{seller.city || 'Pakistan'}</span>
                  </div>
                  {!seller.showPhone ? <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">Phone hidden by seller</span> : null}
                  {!chatHref ? <span className="rounded-full bg-amber-100 px-3 py-1 text-sm text-amber-800">No active listings available for new chat</span> : null}
                </div>
              </div>
            </div>
          </section>

          <section className="mb-6 grid gap-6 md:grid-cols-3">
            <StatCard label="Active Listings" value={stats.total_ads} tone="pink" />
            <StatCard label="Reviews" value={stats.total_reviews} tone="yellow" />
            <StatCard label="Response Rate" value={`${stats.response_rate}%`} tone="green" />
          </section>

          <section className="mb-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-3xl bg-white p-8 shadow-lg">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">About Seller</h2>
              <p className="mb-5 text-gray-700">
                {seller.address || 'This seller has not added a public address or bio yet.'}
              </p>
              <div className="grid gap-3 text-sm text-gray-600 sm:grid-cols-2">
                <InfoChip label="Location" value={seller.city || 'Not shared'} />
                <InfoChip label="Phone visibility" value={seller.showPhone ? 'Visible on ads' : 'Private'} />
                <InfoChip label="WhatsApp" value={seller.allowWhatsapp ? 'Available' : 'Private'} />
                <InfoChip label="Joined" value={formatDisplayDate(seller.memberSince)} />
              </div>
            </div>

            <form onSubmit={handleSubmitReview} className="rounded-3xl bg-white p-8 shadow-lg">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Leave a Review</h2>
              <p className="mb-5 text-sm text-gray-600">Use the web review API to rate your experience with this seller.</p>

              <div className="mb-5">
                <label className="mb-2 block text-sm font-medium text-gray-700">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setReviewRating(value)}
                      className="rounded-full p-1 transition-transform hover:scale-105"
                    >
                      <Star className={`h-7 w-7 ${value <= reviewRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <label className="mb-2 block text-sm font-medium text-gray-700">Comments</label>
              <textarea
                value={reviewComments}
                onChange={(event) => setReviewComments(event.target.value)}
                rows={5}
                maxLength={2000}
                placeholder="Share your experience with this seller."
                className="mb-4 w-full rounded-2xl border border-gray-200 px-4 py-3 outline-none transition focus:border-pink-500 focus:ring-2 focus:ring-pink-500/20"
              />

              <button
                type="submit"
                disabled={!canSubmitReview}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 px-5 py-3 font-semibold text-white transition-shadow hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingReview ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                Submit Review
              </button>

              {!isLoggedIn ? <p className="mt-3 text-sm text-gray-500">Login is required to submit a review.</p> : null}
            </form>
          </section>

          <section className="mb-6 rounded-3xl bg-white p-8 shadow-lg">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
                <p className="mt-1 text-sm text-gray-600">Recent feedback submitted through the web API.</p>
              </div>
              <span className="rounded-full bg-pink-50 px-4 py-2 text-sm font-semibold text-pink-700">
                {reviews.length} review{reviews.length === 1 ? '' : 's'}
              </span>
            </div>

            {reviews.length === 0 ? (
              <p className="text-gray-600">No reviews available yet.</p>
            ) : (
              <div className="space-y-5">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-2xl border border-gray-100 p-5">
                    <div className="mb-3 flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <ImageWithFallback
                          src={resolveApiAssetUrl(review.user?.image)}
                          alt={review.user?.name || 'Reviewer'}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <h3 className="truncate font-semibold text-gray-900">{review.user?.name || 'Customer'}</h3>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`h-4 w-4 ${star <= Math.round(review.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">{formatDisplayDate(review.created_at)}</span>
                    </div>
                    <p className="text-gray-700">{review.comments || 'No written review provided.'}</p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl bg-white p-8 shadow-lg">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Seller Listings</h2>
                <p className="mt-1 text-sm text-gray-600">Only active listings are shown on the public profile.</p>
              </div>
              <span className="rounded-full bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700">
                {adsWithFavorites.length} item{adsWithFavorites.length === 1 ? '' : 's'}
              </span>
            </div>

            {adsWithFavorites.length === 0 ? (
              <p className="text-gray-600">No active listings available for this seller.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
                {adsWithFavorites.map((ad) => (
                  <AdCard key={ad.id} ad={ad} onToggleFavorite={toggleFavorite} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function mapProfileToSeller(profile: PublicProfileRecord): SellerViewModel {
  const normalizedCountryCode = profile.country_code ? `+${String(profile.country_code).replace(/^\+/, '')}` : '';
  const phone = profile.phone ? `${normalizedCountryCode}${profile.phone}` : '';
  const whatsapp = profile.whatsapp_number ? `${normalizedCountryCode}${profile.whatsapp_number}` : phone;

  return {
    id: String(profile.id),
    name: profile.name,
    avatar: resolveApiAssetUrl(profile.image),
    phone,
    whatsapp,
    city: profile.city || '',
    address: profile.address || '',
    rating: Number(profile.rating ?? 0),
    memberSince: profile.member_since || new Date().toISOString(),
    showPhone: Boolean(profile.show_phone),
    allowWhatsapp: Boolean(profile.allow_whatsapp),
  };
}

function InfoChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-gray-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 font-medium text-gray-900">{value}</p>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: string | number; tone: 'pink' | 'yellow' | 'green' }) {
  const labelClass =
    tone === 'pink' ? 'text-pink-600' : tone === 'yellow' ? 'text-yellow-600' : 'text-green-600';
  const badgeClass =
    tone === 'pink' ? 'bg-pink-100 text-pink-600' : tone === 'yellow' ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600';

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{label}</p>
          <p className={`mt-2 text-3xl font-bold ${labelClass}`}>{value}</p>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl text-2xl ${badgeClass}`}>•</div>
      </div>
    </div>
  );
}
