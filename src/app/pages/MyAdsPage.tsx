import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { CalendarDays, Edit, Eye, Heart, MapPin, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Skeleton } from '../components/ui/skeleton';
import { ROUTES } from '@/core/constants';
import { getStoredToken } from '@/core/api/client';
import { deletePost, getMyPosts, type MyPostsSummary, type PostRecord } from '@/core/api/services/posts';
import { formatDisplayDate, resolveApiAssetUrl } from '../utils/marketplace';

function MyAdsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl bg-white shadow-lg">
          <div className="flex flex-col md:flex-row">
            <Skeleton className="aspect-video rounded-none md:w-64 md:aspect-square" />
            <div className="flex-1 space-y-4 p-6">
              <Skeleton className="h-8 w-3/5" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-5 w-2/5" />
              <div className="flex gap-3">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function MyAdsPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<PostRecord[]>([]);
  const [summary, setSummary] = useState<MyPostsSummary | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadMyAds() {
      if (!getStoredToken()) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await getMyPosts({ page: currentPage, per_page: 12 });
        if (!active) return;
        setRecords(response.records.data ?? []);
        setSummary(response.summary);
        setLastPage(Math.max(1, response.records.last_page ?? 1));
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load your ads.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadMyAds();

    return () => {
      active = false;
    };
  }, [currentPage, navigate]);

  async function handleDelete(postId: number) {
    const confirmed = window.confirm('Delete this listing?');
    if (!confirmed) return;

    const previousRecords = records;
    const previousSummary = summary;
    setDeletingId(postId);
    setRecords((current) => current.filter((post) => post.id !== postId));
    setSummary((current) =>
      current
        ? {
            ...current,
            total_ads: Math.max(0, current.total_ads - 1),
            active_ads: Math.max(0, current.active_ads - 1),
          }
        : current
    );

    try {
      await deletePost(postId);
      toast.success('Listing deleted successfully.');
    } catch (deleteError) {
      setRecords(previousRecords);
      setSummary(previousSummary);
      toast.error(deleteError instanceof Error ? deleteError.message : 'Failed to delete ad.');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 rounded-2xl bg-white p-8 shadow-lg">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="mb-2 text-3xl font-bold text-gray-900">My Ads</h1>
                <p className="text-gray-600">Manage your active and pending listings.</p>
              </div>
              <Link
                to={ROUTES.CREATE_AD}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-3 font-semibold text-white transition-shadow hover:shadow-lg"
              >
                <Plus className="h-4 w-4" />
                Create New Ad
              </Link>
            </div>
          </div>

          {error ? <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">{error}</div> : null}

          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <p className="mb-1 text-sm text-gray-600">Active Ads</p>
              <p className="text-3xl font-bold text-green-600">{summary?.active_ads ?? 0}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <p className="mb-1 text-sm text-gray-600">Inactive</p>
              <p className="text-3xl font-bold text-yellow-600">{summary?.inactive_ads ?? 0}</p>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-lg">
              <p className="mb-1 text-sm text-gray-600">Total Views</p>
              <p className="text-3xl font-bold text-pink-600">{(summary?.total_views ?? 0).toLocaleString()}</p>
            </div>
          </div>

          {summary ? (
            <div className="mb-6 rounded-2xl border border-pink-100 bg-pink-50/70 p-5 shadow-sm">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-pink-700">Posting quota</p>
                  <p className="text-sm text-gray-700">
                    {summary.has_premium_subscription
                      ? 'Premium account with unlimited monthly posts.'
                      : `${summary.posts_this_month} of ${summary.monthly_free_limit} free posts used this month.`}
                  </p>
                </div>
                <div className="text-sm font-medium text-pink-700">
                  {summary.has_premium_subscription ? 'Unlimited posts available' : `${summary.remaining_free_posts ?? 0} free posts remaining`}
                </div>
              </div>
            </div>
          ) : null}

          {loading ? (
            <MyAdsSkeleton />
          ) : records.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center text-gray-600 shadow-lg">
              You have not posted any ads yet.
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((post) => {
                const primaryImage = post.post_images?.[0]?.images ?? post.images?.[0]?.images ?? post.featured_image;
                const displayPrice =
                  post.item_type?.title?.toLowerCase() === 'rent'
                    ? Number(post.rent_per_day ?? post.deposit ?? 0)
                    : Number(post.price ?? 0);
                const statusLabel = post.status === 1 ? 'Active' : 'Inactive';
                const detailRoute = post.status === 1 ? ROUTES.POST(String(post.id)) : ROUTES.MY_AD_DETAIL(String(post.id));

                return (
                <div key={post.id} className="overflow-hidden rounded-xl bg-white shadow-lg">
                  <div className="flex flex-col md:flex-row">
                    <div className="aspect-video md:w-64 md:aspect-square">
                      <ImageWithFallback
                        src={resolveApiAssetUrl(primaryImage)}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <div className="flex-1 p-6">
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-3">
                            <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${post.status === 1 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {statusLabel}
                            </span>
                          </div>
                          <p className="mb-3 text-2xl font-bold text-pink-600">PKR {displayPrice.toLocaleString()}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-pink-500" />
                              {post.city?.title ?? 'Pakistan'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              {Number(post.views ?? 0)} views
                            </span>
                            <span className="flex items-center gap-1">
                              <Heart className="h-4 w-4" />
                              {Number(post.favourites_count ?? 0)} favourites
                            </span>
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-4 w-4" />
                              {formatDisplayDate(post.created_at)}
                            </span>
                            <span>{post.item_type?.title ?? 'Sale'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Link
                          to={detailRoute}
                          className="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-700 transition-colors hover:bg-gray-200"
                        >
                          View
                        </Link>
                        <Link
                          to={ROUTES.EDIT_AD(String(post.id))}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-100 px-4 py-2 font-medium text-blue-700 transition-colors hover:bg-blue-200"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleDelete(post.id)}
                          disabled={deletingId === post.id}
                          className="inline-flex items-center gap-2 rounded-lg bg-red-100 px-4 py-2 font-medium text-red-700 transition-colors hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingId === post.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )})}

              {lastPage > 1 ? (
                <div className="flex items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-lg">
                  <p className="text-sm text-gray-600">
                    Page {currentPage} of {lastPage}
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.min(lastPage, page + 1))}
                      disabled={currentPage >= lastPage}
                      className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
