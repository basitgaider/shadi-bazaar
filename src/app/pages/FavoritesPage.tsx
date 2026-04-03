import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';
import { AdListItem } from '../components/AdListItem';
import { Skeleton } from '../components/ui/skeleton';
import type { Ad } from '../data/mockData';
import { getStoredToken } from '@/core/api/client';
import { getFavourites, removeFavourite } from '@/core/api/services/favourites';
import { mapFavouriteToAd } from '../utils/marketplace';

function FavoriteListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row">
            <Skeleton className="aspect-video sm:w-64 sm:aspect-square rounded-none" />
            <div className="flex-1 space-y-4 p-6">
              <Skeleton className="h-6 w-3/5" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <div className="flex gap-3">
                <Skeleton className="h-8 w-20 rounded-full" />
                <Skeleton className="h-8 w-24 rounded-full" />
              </div>
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-28" />
                <Skeleton className="h-10 w-28 rounded-lg" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function FavoritesPage() {
  const [favorites, setFavorites] = useState<Ad[]>([]);
  const [favouriteIds, setFavouriteIds] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadFavorites() {
      if (!getStoredToken()) {
        setFavorites([]);
        setFavouriteIds({});
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const records = await getFavourites();
        if (!active) return;

        const mappedAds = records
          .map((record) => mapFavouriteToAd(record))
          .filter((ad): ad is Ad => ad !== null);

        setFavorites(mappedAds);
        setFavouriteIds(
          records.reduce<Record<string, number>>((acc, record) => {
            const postId = record.post_id ?? (record.post && 'id' in record.post ? Number(record.post.id) : undefined);
            if (postId) acc[String(postId)] = record.id;
            return acc;
          }, {})
        );
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load favourites.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadFavorites();

    return () => {
      active = false;
    };
  }, []);

  async function toggleFavorite(id: string) {
    const favouriteId = favouriteIds[id];
    if (!favouriteId) return;

    const previousFavorites = favorites;
    setRemovingId(id);
    setFavorites((current) => current.filter((ad) => ad.id !== id));

    try {
      await removeFavourite(favouriteId);
      setFavouriteIds((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
      toast.success('Removed from favourites.');
    } catch (removeError) {
      setFavorites(previousFavorites);
      toast.error(removeError instanceof Error ? removeError.message : 'Failed to remove favourite.');
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
                <p className="text-gray-600">{favorites.length} saved items</p>
              </div>
            </div>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6 mb-6">{error}</div>
          ) : null}

          {loading ? (
            <FavoriteListSkeleton />
          ) : favorites.length > 0 ? (
            <div className="space-y-4">
              {favorites.map((ad) => (
                <AdListItem key={ad.id} ad={ad} onToggleFavorite={toggleFavorite} disabled={removingId === ad.id} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h3>
              <p className="text-gray-600 mb-6">
                {getStoredToken()
                  ? 'Start adding items to your favorites by clicking the heart icon on any listing.'
                  : 'Log in to sync and manage your saved listings.'}
              </p>
              <Link
                to="/"
                className="inline-block bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
              >
                Browse Ads
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
