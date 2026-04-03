import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { AdCardFeatured } from '../components/AdCardFeatured';
import { Skeleton } from '../components/ui/skeleton';
import type { Ad } from '../data/mockData';
import { mapPostToAd } from '../utils/marketplace';
import { SearchBox } from '@/shared/components';
import { ROUTES } from '@/core/constants';
import { getCategories, getCities, getItemTypes } from '@/core/api/services/meta';
import { getPostsList, type PostRecord } from '@/core/api/services/posts';

function ListingCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-7 w-28" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cityOptions, setCityOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [categoryOptions, setCategoryOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [typeOptions, setTypeOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [posts, setPosts] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const query = searchParams.get('q') ?? '';
  const city = searchParams.get('city') ?? '';
  const type = searchParams.get('type') ?? '';
  const category = searchParams.get('category') ?? '';
  const minPrice = searchParams.get('minPrice') ?? '';
  const maxPrice = searchParams.get('maxPrice') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';
  const page = Number(searchParams.get('page') ?? '1') || 1;

  useEffect(() => {
    let active = true;

    async function loadFilters() {
      setFiltersLoading(true);
      try {
        const [cities, categories, itemTypes] = await Promise.all([getCities(), getCategories(), getItemTypes()]);
        if (!active) return;

        setCityOptions(cities.map((record) => ({ value: String(record.id), label: record.title })));
        setCategoryOptions(categories.map((record) => ({ value: String(record.id), label: record.title })));
        setTypeOptions(itemTypes.map((record) => ({ value: String(record.id), label: record.title })));
      } catch {
        if (!active) return;
        setCityOptions([]);
        setCategoryOptions([]);
        setTypeOptions([]);
      } finally {
        if (active) setFiltersLoading(false);
      }
    }

    void loadFilters();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadPosts() {
      setLoading(true);
      setError(null);

      try {
        const res = await getPostsList({
          ...(query ? { title: query } : {}),
          ...(city ? { city_id: city } : {}),
          ...(type ? { item_type_id: type } : {}),
          ...(category ? { category_id: category } : {}),
          ...(minPrice ? { min_price: minPrice } : {}),
          ...(maxPrice ? { max_price: maxPrice } : {}),
          sort: sort as 'newest' | 'oldest' | 'price_low' | 'price_high' | 'popular',
          page,
        });

        if (!active) return;

        const records = res.data.records;
        const list = Array.isArray(records) ? records : records.data;
        const nextCurrentPage = Array.isArray(records) ? 1 : records.current_page;
        const nextLastPage = Array.isArray(records) ? 1 : records.last_page;
        const nextTotal = Array.isArray(records) ? records.length : records.total ?? records.data.length;

        setPosts(list.map((post: PostRecord) => mapPostToAd(post)));
        setCurrentPage(nextCurrentPage);
        setLastPage(nextLastPage);
        setTotal(nextTotal);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load listings.');
        setPosts([]);
        setCurrentPage(1);
        setLastPage(1);
        setTotal(0);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadPosts();

    return () => {
      active = false;
    };
  }, [category, city, maxPrice, minPrice, page, query, sort, type]);

  const activeFilterSummary = useMemo(() => {
    const parts: string[] = [];
    if (query) parts.push(`"${query}"`);
    if (type) parts.push(typeOptions.find((option) => option.value === type)?.label ?? 'selected type');
    if (city) parts.push(cityOptions.find((option) => option.value === city)?.label ?? 'selected city');
    if (category) parts.push(categoryOptions.find((option) => option.value === category)?.label ?? 'selected category');
    if (minPrice || maxPrice) parts.push(`PKR ${minPrice || '0'}-${maxPrice || 'Any'}`);
    if (sort !== 'newest') parts.push(sort.replace('_', ' '));
    return parts;
  }, [category, categoryOptions, city, cityOptions, maxPrice, minPrice, query, sort, type, typeOptions]);

  function handleSearch(params: { query: string; type: string; city: string }) {
    const nextParams = new URLSearchParams();
    if (params.query.trim()) nextParams.set('q', params.query.trim());
    if (params.type) nextParams.set('type', params.type);
    if (params.city) nextParams.set('city', params.city);
    if (category) nextParams.set('category', category);
    if (minPrice) nextParams.set('minPrice', minPrice);
    if (maxPrice) nextParams.set('maxPrice', maxPrice);
    if (sort && sort !== 'newest') nextParams.set('sort', sort);
    setSearchParams(nextParams);
  }

  function updateParam(key: string, value: string) {
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) nextParams.set(key, value.trim());
    else nextParams.delete(key);
    nextParams.delete('page');
    setSearchParams(nextParams);
  }

  function handlePageChange(nextPage: number) {
    const nextParams = new URLSearchParams(searchParams);
    if (nextPage <= 1) nextParams.delete('page');
    else nextParams.set('page', String(nextPage));
    setSearchParams(nextParams);
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 space-y-8">
        <section className="rounded-[2rem] bg-gradient-to-r from-pink-100 via-rose-50 to-white p-6 md:p-8 shadow-sm">
          <div className="max-w-4xl space-y-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Search Listings</h1>
              <p className="text-gray-600 mt-2">
                Find bridal dresses, groom wear, jewelry, and wedding services from the website inventory.
              </p>
            </div>

            <SearchBox
              key={`${query}-${type}-${city}-${typeOptions.length}-${cityOptions.length}`}
              searchPlaceholder="Search dresses, jewelry, makeup artists, venues..."
              typeOptions={typeOptions}
              cityOptions={cityOptions}
              initialQuery={query}
              initialType={type}
              initialCity={city}
              submitLabel="Apply Search"
              onSearch={handleSearch}
            />

            <div className="grid gap-4 border-t border-pink-100 pt-5 md:grid-cols-4">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-gray-700">Category</span>
                <select
                  value={category}
                  onChange={(event) => updateParam('category', event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="">All categories</option>
                  {categoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-gray-700">Min Price</span>
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(event) => updateParam('minPrice', event.target.value)}
                  placeholder="0"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-gray-700">Max Price</span>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(event) => updateParam('maxPrice', event.target.value)}
                  placeholder="500000"
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-gray-700">Sort By</span>
                <select
                  value={sort}
                  onChange={(event) => updateParam('sort', event.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="popular">Most Popular</option>
                </select>
              </label>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {loading ? 'Loading listings...' : `${total} listing${total === 1 ? '' : 's'} found`}
            </h2>
            <p className="text-gray-600 mt-1">
              {activeFilterSummary.length > 0
                ? `Filtered by ${activeFilterSummary.join(', ')}`
                : 'Showing the latest active listings.'}
            </p>
          </div>

          <Link to={ROUTES.CREATE_AD} className="inline-flex items-center gap-2 text-pink-600 hover:underline font-medium">
            <SlidersHorizontal className="h-4 w-4" />
            Post Your Ad
          </Link>
        </section>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 9 }).map((_, index) => (
              <ListingCardSkeleton key={index} />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((ad) => (
              <AdCardFeatured key={ad.id} ad={ad} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-8 py-16 text-center shadow-sm">
            <h3 className="text-xl font-semibold text-gray-900">No listings matched your search</h3>
            <p className="mt-2 text-gray-600">
              Try a different keyword, remove a filter, or browse all active listings.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setSearchParams(new URLSearchParams())}
                className="inline-flex rounded-lg bg-pink-600 px-5 py-3 text-white font-medium hover:bg-pink-700 transition-colors"
              >
                Clear Filters
              </button>
              <Link
                to={ROUTES.CREATE_AD}
                className="inline-flex items-center gap-2 rounded-lg border border-pink-200 bg-white px-5 py-3 font-medium text-pink-600 hover:bg-pink-50"
              >
                Post Listing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && lastPage > 1 ? (
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {lastPage}
            </span>
            <button
              type="button"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= lastPage}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
            </button>
          </div>
        ) : null}

        {filtersLoading && !loading ? (
          <div className="text-sm text-gray-500">Loading filter metadata...</div>
        ) : null}
      </div>
    </div>
  );
}
