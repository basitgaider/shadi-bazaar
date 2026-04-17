import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router';
import { Calendar, Eye, Heart, Mail, MapPin, MessageCircle, Phone, Share2, Star } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import type { Ad } from '../data/mockData';
import { getApiUrl, getStoredToken } from '@/core/api/client';
import { ROUTES } from '@/core/constants';
import { addFavourite, getFavourites, removeFavourite } from '@/core/api/services/favourites';
import { getMyPostDetail, getPostDetail, getPostsByCategory } from '@/core/api/services/posts';
import { formatDisplayDate, mapPostToAd, resolveApiAssetUrl } from '../utils/marketplace';

export function PostDetailPage() {
  const { id } = useParams();
  const location = useLocation();
  const [ad, setAd] = useState<Ad | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [similarAds, setSimilarAds] = useState<Ad[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favouriteId, setFavouriteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOwnerPreview = location.pathname.startsWith('/my-ads/');

  useEffect(() => {
    let active = true;

    async function loadPost() {
      if (!id) {
        setError('Post not found.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let detailRes;

        try {
          detailRes = isOwnerPreview ? await getMyPostDetail(id) : await getPostDetail(id);
        } catch (publicError) {
          if (isOwnerPreview || !getStoredToken()) {
            throw publicError;
          }

          detailRes = await getMyPostDetail(id);
        }

        const post = detailRes.data;
        const mappedAd = mapPostToAd(post);
        const gallery =
          post.post_images?.map((image) => resolveApiAssetUrl(image.images)).filter(Boolean) ?? [];
        const nextImages = gallery.length > 0 ? gallery : [mappedAd.image];

        const [relatedPosts, favourites] = await Promise.all([
          !isOwnerPreview && post.status === 1 && post.category?.id
            ? getPostsByCategory(post.category.id, { exclude_post_id: post.id, per_page: 4 }).catch(() => [])
            : Promise.resolve([]),
          getStoredToken() ? getFavourites().catch(() => []) : Promise.resolve([]),
        ]);

        if (!active) return;

        const currentFavourite = favourites.find((record) => String(record.post_id) === String(post.id));

        setAd(mappedAd);
        setImages(nextImages);
        setSimilarAds(
          relatedPosts
            .filter((relatedPost) => relatedPost.id !== post.id)
            .slice(0, 3)
            .map((relatedPost) =>
              mapPostToAd(relatedPost, {
                isFavorite: favourites.some((record) => String(record.post_id) === String(relatedPost.id)),
              })
            )
        );
        setIsFavorite(Boolean(currentFavourite));
        setFavouriteId(currentFavourite?.id ?? null);
        setSelectedImage(0);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load listing.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPost();

    return () => {
      active = false;
    };
  }, [id, isOwnerPreview]);

  async function toggleFavorite() {
    if (!ad) return;

    const wasFavorite = isFavorite;
    setIsFavorite(!wasFavorite);

    if (!getStoredToken()) return;

    try {
      if (wasFavorite) {
        if (!favouriteId) throw new Error('Favourite reference not found.');
        await removeFavourite(favouriteId);
        setFavouriteId(null);
        toast.success('Removed from favourites.');
      } else {
        const res = await addFavourite(Number(ad.id));
        setFavouriteId(res.data?.id ?? null);
        toast.success('Added to favourites.');
      }
    } catch (favoriteError) {
      setIsFavorite(wasFavorite);
      toast.error(favoriteError instanceof Error ? favoriteError.message : 'Failed to update favourite.');
    }
  }

  async function handleShare() {
    if (!ad) return;
    const shareUrl = window.location.href || getApiUrl(`posts/detail?id=${ad.id}`);

    if (navigator.share) {
      try {
        await navigator.share({
          title: ad.title,
          text: ad.description,
          url: shareUrl,
        });
        return;
      } catch {
        // fallback below
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Listing link copied to clipboard.');
    } catch {
      toast.message(shareUrl);
    }
  }

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-7xl space-y-6">
            <Skeleton className="h-[420px] w-full rounded-3xl" />
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <Skeleton className="h-72 w-full rounded-3xl" />
                <Skeleton className="h-56 w-full rounded-3xl" />
              </div>
              <Skeleton className="h-96 w-full rounded-3xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !ad) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto rounded-2xl border border-red-200 bg-red-50 p-10 text-red-700 shadow-lg">
            {error ?? 'Listing not found.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="aspect-video relative">
                  <ImageWithFallback src={images[selectedImage]} alt={ad.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void toggleFavorite()}
                      className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    >
                      <Heart className={`w-6 h-6 ${isFavorite ? 'fill-pink-600 text-pink-600' : 'text-gray-600'}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleShare()}
                      className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    >
                      <Share2 className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="p-4 flex gap-2">
                  {images.map((image, index) => (
                    <button
                      type="button"
                      key={`${image}-${index}`}
                      onClick={() => setSelectedImage(index)}
                      className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-pink-600' : 'border-gray-200'
                      }`}
                    >
                      <ImageWithFallback src={image} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                {isOwnerPreview && ad.status !== 'Active' ? (
                  <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800">
                    This listing is not public yet. It is visible here only for your account until admin approval.
                  </div>
                ) : null}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{ad.title}</h1>
                    <div className="flex items-center gap-4 text-gray-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {ad.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {ad.views} views
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {ad.createdAt}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold text-pink-600">PKR {ad.price.toLocaleString()}</p>
                    <p className="mt-1 text-sm text-gray-500">{ad.status}</p>
                  </div>
                </div>

                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Type</p>
                    <p className="font-bold text-gray-900">{ad.type}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Condition</p>
                    <p className="font-bold text-gray-900">{ad.condition}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Category</p>
                    <p className="font-bold text-gray-900">{ad.category}</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{ad.description}</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Similar Ads</h3>
                {similarAds.length === 0 ? (
                  <p className="text-gray-600">No similar ads available right now.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {similarAds.map((similarAd) => (
                      <Link
                        key={similarAd.id}
                        to={ROUTES.POST(similarAd.id)}
                        className="group rounded-lg overflow-hidden border border-gray-200 hover:border-pink-600 transition-colors"
                      >
                        <div className="aspect-video">
                          <ImageWithFallback src={similarAd.image} alt={similarAd.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-4">
                          <h4 className="font-bold text-gray-900 mb-1 line-clamp-1">{similarAd.title}</h4>
                          <p className="text-pink-600 font-bold">PKR {similarAd.price.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Seller Information</h3>

                <Link
                  to={ROUTES.PROFILE(ad.seller.id)}
                  className="flex items-center gap-4 mb-6 hover:bg-gray-50 p-3 rounded-lg transition-colors"
                >
                  <ImageWithFallback src={ad.seller.avatar} alt={ad.seller.name} className="w-16 h-16 rounded-full object-cover" />
                  <div>
                    <h4 className="font-bold text-gray-900">{ad.seller.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{ad.seller.rating}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Member since {formatDisplayDate(ad.seller.memberSince, 'Date unavailable')}
                    </p>
                  </div>
                </Link>

                <div className="space-y-3">
                  <div className="grid grid-cols-4 gap-2">
                    <a
                      href={`tel:${ad.seller.phone}`}
                      className="bg-green-600 text-white px-3 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors flex flex-col items-center justify-center gap-1 text-xs"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Call</span>
                    </a>
                    <Link
                      to={`${ROUTES.CHAT}?userId=${ad.seller.id}&adId=${ad.id}`}
                      className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-3 py-2.5 rounded-lg font-medium hover:shadow-lg transition-shadow flex flex-col items-center justify-center gap-1 text-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>Chat</span>
                    </Link>
                    <a
                      href={`https://wa.me/${ad.seller.whatsapp.replace(/[^\d]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-green-500 text-white px-3 py-2.5 rounded-lg font-medium hover:bg-green-600 transition-colors flex flex-col items-center justify-center gap-1 text-xs"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                    <a
                      href={`sms:${ad.seller.phone}`}
                      className="bg-blue-600 text-white px-3 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors flex flex-col items-center justify-center gap-1 text-xs"
                    >
                      <Mail className="w-4 h-4" />
                      <span>SMS</span>
                    </a>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h4 className="font-bold text-gray-900 mb-3">Safety Tips</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">+</span>
                      <span>Meet the seller in a public place</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">+</span>
                      <span>Inspect the item before buying</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">+</span>
                      <span>Do not pay in advance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
