import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { AdCardFeatured } from '../components/AdCardFeatured';
import { AdCardHorizontal } from '../components/AdCardHorizontal';
import { DressCarousel } from '../components/DressCarousel';
import { Skeleton } from '../components/ui/skeleton';
import type { Ad } from '../data/mockData';
import { ROUTES } from '@/core/constants';
import { SearchBox } from '@/shared/components';
import { addFavourite, removeFavourite } from '@/core/api/services/favourites';
import { submitContact } from '@/core/api/services/contact';
import { getHome, type HomeBlogRecord } from '@/core/api/services/home';
import { getStoredToken } from '@/core/api/client';
import { zodErrorsToFieldMap } from '../hooks/useAuth';
import { contactSchema, type ContactInput } from '@/core/validators';
import { formatDisplayDate, mapPostToAd, resolveApiAssetUrl, truncateText } from '../utils/marketplace';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';

interface HomeState {
  featuredAds: Ad[];
  bridalAds: Ad[];
  groomAds: Ad[];
  jewelryAds: Ad[];
  cityOptions: Array<{ value: string; label: string }>;
  typeOptions: Array<{ value: string; label: string }>;
  blogs: HomeBlogRecord[];
}

const initialState: HomeState = {
  featuredAds: [],
  bridalAds: [],
  groomAds: [],
  jewelryAds: [],
  cityOptions: [],
  typeOptions: [],
  blogs: [],
};

function FeaturedAdSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-5 w-3/5" />
        <Skeleton className="h-7 w-32" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-7 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

function HorizontalAdSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 h-full">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-6 w-24" />
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

function BlogCardSkeleton() {
  return (
    <article className="bg-white rounded-xl overflow-hidden shadow-lg">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-11/12" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-24" />
      </div>
    </article>
  );
}

function ContactFormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-12 w-full rounded-lg" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
    </div>
  );
}

interface SectionEmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

function SectionEmptyState({ title, description, actionLabel, actionTo }: SectionEmptyStateProps) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-gray-300 bg-white px-8 py-14 text-center shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      <p className="mx-auto mt-3 max-w-2xl text-gray-600">{description}</p>
      {actionLabel && actionTo ? (
        <div className="mt-6">
          <Link
            to={actionTo}
            className="inline-flex rounded-lg bg-pink-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-pink-700"
          >
            {actionLabel}
          </Link>
        </div>
      ) : null}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

function SectionHeader({ title, description, actionLabel, actionTo }: SectionHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-gray-600">{description}</p>
      </div>
      {actionLabel && actionTo ? (
        <Link to={actionTo} className="inline-flex items-center gap-2 font-medium text-pink-600 hover:underline">
          {actionLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}

export function HomePage() {
  const navigate = useNavigate();
  const [state, setState] = useState<HomeState>(initialState);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favoriteMap, setFavoriteMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [contactErrors, setContactErrors] = useState<Record<string, string>>({});
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadHome() {
      setLoading(true);
      setError(null);

      try {
        const data = await getHome();
        if (!active) return;

        const nextFavoriteIds = new Set(data.favourites.map((record) => String(record.post_id)));
        const nextFavoriteMap = data.favourites.reduce<Record<string, number>>((acc, record) => {
          acc[String(record.post_id)] = record.id;
          return acc;
        }, {});

        setFavoriteIds(nextFavoriteIds);
        setFavoriteMap(nextFavoriteMap);
        setState({
          featuredAds: data.featured_posts.map((post) => mapPostToAd(post, { isFavorite: nextFavoriteIds.has(String(post.id)) })),
          bridalAds: data.bridal_posts.map((post) => mapPostToAd(post, { isFavorite: nextFavoriteIds.has(String(post.id)) })),
          groomAds: data.groom_posts.map((post) => mapPostToAd(post, { isFavorite: nextFavoriteIds.has(String(post.id)) })),
          jewelryAds: data.jewelry_posts.map((post) => mapPostToAd(post, { isFavorite: nextFavoriteIds.has(String(post.id)) })),
          cityOptions: data.cities.map((city) => ({ value: String(city.id), label: city.title })),
          typeOptions: data.item_types.map((itemType) => ({ value: String(itemType.id), label: itemType.title })),
          blogs: data.blogs,
        });
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load home data.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadHome();

    return () => {
      active = false;
    };
  }, []);

  const syncFavorites = (ads: Ad[]) =>
    ads.map((ad) => ({
      ...ad,
      isFavorite: favoriteIds.has(ad.id),
    }));

  const featuredAds = useMemo(() => syncFavorites(state.featuredAds), [state.featuredAds, favoriteIds]);
  const bridalAds = useMemo(() => syncFavorites(state.bridalAds), [state.bridalAds, favoriteIds]);
  const groomAds = useMemo(() => syncFavorites(state.groomAds), [state.groomAds, favoriteIds]);
  const jewelryAds = useMemo(() => syncFavorites(state.jewelryAds), [state.jewelryAds, favoriteIds]);

  function handleSearch(params: { query: string; type: string; city: string }) {
    const nextParams = new URLSearchParams();
    const query = params.query.trim();
    if (query) nextParams.set('q', query);
    if (params.type) nextParams.set('type', params.type);
    if (params.city) nextParams.set('city', params.city);
    navigate({
      pathname: ROUTES.SEARCH,
      search: nextParams.toString() ? `?${nextParams.toString()}` : '',
    });
  }

  async function toggleFavorite(id: string) {
    if (!getStoredToken()) {
      toast.error('Login is required to save favourites.');
      return;
    }

    const wasFavorite = favoriteIds.has(id);

    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFavorite) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      if (wasFavorite) {
        const favouriteId = favoriteMap[id];
        if (!favouriteId) throw new Error('Favourite reference not found.');
        await removeFavourite(favouriteId);
        setFavoriteMap((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
        toast.success('Removed from favourites.');
      } else {
        const res = await addFavourite(Number(id));
        setFavoriteMap((prev) => ({ ...prev, [id]: res.data?.id ?? prev[id] }));
        toast.success('Added to favourites.');
      }
    } catch (favoriteError) {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.add(id);
        else next.delete(id);
        return next;
      });
      toast.error(favoriteError instanceof Error ? favoriteError.message : 'Failed to update favourite.');
    }
  }

  async function handleContactSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const parsed = contactSchema.safeParse(contactForm);

    if (!parsed.success) {
      setContactErrors(zodErrorsToFieldMap(parsed.error));
      return;
    }

    const payload: ContactInput = parsed.data;
    setContactErrors({});

    setContactLoading(true);
    try {
      const res = await submitContact(payload);
      toast.success(res.message || 'Message sent successfully.');
      setContactForm({ name: '', email: '', phone: '', message: '' });
      setContactErrors({});
    } catch (submitError) {
      toast.error(submitError instanceof Error ? submitError.message : 'Failed to send message.');
    } finally {
      setContactLoading(false);
    }
  }

  function updateContactField(field: keyof typeof contactForm, value: string) {
    setContactForm((prev) => ({ ...prev, [field]: value }));
    setContactErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function validateContactField(field: keyof typeof contactForm) {
    const result = contactSchema.safeParse(contactForm);

    if (result.success) {
      setContactErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
      return;
    }

    const nextErrors = zodErrorsToFieldMap(result.error);
    setContactErrors((prev) => {
      const next = { ...prev };
      if (nextErrors[field]) next[field] = nextErrors[field];
      else delete next[field];
      return next;
    });
  }

  return (
    <div className="bg-gray-50">
      <section className="relative bg-gradient-to-br from-pink-100 via-rose-50 to-white py-20">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1761571259874-bb4871c44340?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQYWtpc3RhbmklMjB3ZWRkaW5nJTIwYnJpZGUlMjBlbGVnYW50fGVufDF8fHx8MTc3MDc2NTEwNHww&ixlib=rb-4.1.0&q=80&w=1080)',
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                Find Your Perfect
                <br />
                <span className="bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                  Wedding Match
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Discover the best bridal wear, groom attire, and wedding services in Pakistan
              </p>

              <SearchBox
                typeOptions={state.typeOptions}
                cityOptions={state.cityOptions}
                onSearch={handleSearch}
              />
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="rounded-xl border border-red-200 bg-red-50 px-6 py-4 text-red-700">{error}</div>
          </div>
        </section>
      ) : null}

      <section className="py-16">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Featured Ads"
            description="Premium listings from verified sellers"
            actionLabel="Post Your Ad"
            actionTo={ROUTES.CREATE_AD}
          />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, index) => (
                <FeaturedAdSkeleton key={index} />
              ))}
            </div>
          ) : featuredAds.length === 0 ? (
            <SectionEmptyState
              title="No featured ads yet"
              description="Featured listings will appear here once sellers promote their bridal wear, jewelry, or wedding services."
              actionLabel="Post Your Ad"
              actionTo={ROUTES.CREATE_AD}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredAds.slice(0, 6).map((ad) => (
                <AdCardFeatured key={ad.id} ad={ad} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="container mx-auto px-4">
          <SectionHeader title="Best Dresses" description="Sponsored premium collection" />
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Array.from({ length: 2 }).map((_, index) => (
                <HorizontalAdSkeleton key={index} />
              ))}
            </div>
          ) : featuredAds.length === 0 ? (
            <SectionEmptyState
              title="No sponsored dresses available"
              description="This carousel will show promoted and premium listings once there are featured dresses in the marketplace."
            />
          ) : (
            <DressCarousel ads={featuredAds.slice(0, 8)} onToggleFavorite={toggleFavorite} />
          )}
        </div>
      </section>

      <section className="py-8 bg-gradient-to-r from-rose-600 to-pink-600">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-white">
            <div>
              <h3 className="text-2xl font-bold mb-2">Advertise Your Brand Here</h3>
              <p className="text-pink-100">Reach thousands of wedding shoppers every day</p>
            </div>
            <a
              href="#contact"
              className="bg-white text-pink-600 px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Bridal Dresses"
            description="Trending bridal wear for barat, walima, and nikkah events."
            actionLabel="Browse Listings"
            actionTo={ROUTES.SEARCH}
          />
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <HorizontalAdSkeleton key={index} />
              ))}
            </div>
          ) : bridalAds.length === 0 ? (
            <SectionEmptyState
              title="No bridal dresses available"
              description="Bridal listings will appear here once active bridal posts are published on the marketplace."
              actionLabel="Browse All Listings"
              actionTo={ROUTES.SEARCH}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {bridalAds.map((ad) => (
                <AdCardHorizontal key={ad.id} ad={ad} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Groom Dresses"
            description="Sherwanis, suits, and formal wear selected for groom styling."
            actionLabel="Browse Listings"
            actionTo={ROUTES.SEARCH}
          />
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <HorizontalAdSkeleton key={index} />
              ))}
            </div>
          ) : groomAds.length === 0 ? (
            <SectionEmptyState
              title="No groom dresses available"
              description="Groom wear and sherwani listings will appear here once sellers publish active posts in that section."
              actionLabel="Browse All Listings"
              actionTo={ROUTES.SEARCH}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {groomAds.map((ad) => (
                <AdCardHorizontal key={ad.id} ad={ad} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Jewelry"
            description="Bridal sets, accessories, and statement pieces from active sellers."
            actionLabel="Browse Listings"
            actionTo={ROUTES.SEARCH}
          />
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <HorizontalAdSkeleton key={index} />
              ))}
            </div>
          ) : jewelryAds.length === 0 ? (
            <SectionEmptyState
              title="No jewelry listings available"
              description="Jewelry sets, bridal accessories, and related items will appear here when active marketplace listings are available."
              actionLabel="Browse All Listings"
              actionTo={ROUTES.SEARCH}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {jewelryAds.map((ad) => (
                <AdCardHorizontal key={ad.id} ad={ad} onToggleFavorite={toggleFavorite} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="container mx-auto px-4">
          <SectionHeader
            title="Latest from Our Blog"
            description="Wedding tips, marketplace advice, and practical buying guides."
          />
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <BlogCardSkeleton key={index} />
              ))}
            </div>
          ) : state.blogs.length === 0 ? (
            <SectionEmptyState
              title="No blog articles published yet"
              description="Wedding tips, seller guides, and marketplace updates will appear here once blog content is published."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {state.blogs.map((post) => (
                <article
                  key={post.id}
                  className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="aspect-video overflow-hidden">
                    <ImageWithFallback
                      src={resolveApiAssetUrl(post.image)}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-gray-500 mb-2">{formatDisplayDate(post.created_at)}</p>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-4">{truncateText(post.description, 180)}</p>
                    <Link
                      to={ROUTES.BLOG(String(post.id))}
                      className="inline-flex items-center gap-2 text-pink-600 font-semibold hover:underline"
                    >
                      Read More
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="contact" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Get In Touch</h2>
              <p className="text-gray-600">Have questions? We&apos;d love to hear from you!</p>
            </div>
            {loading ? (
              <ContactFormSkeleton />
            ) : (
              <form className="space-y-6" onSubmit={handleContactSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Your name"
                      value={contactForm.name}
                      onChange={(event) => updateContactField('name', event.target.value)}
                      onBlur={() => validateContactField('name')}
                      aria-invalid={Boolean(contactErrors.name)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                        contactErrors.name
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-200 focus:ring-pink-500'
                      }`}
                    />
                    {contactErrors.name ? <p className="mt-2 text-sm text-red-600">{contactErrors.name}</p> : null}
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="your@email.com"
                      value={contactForm.email}
                      onChange={(event) => updateContactField('email', event.target.value)}
                      onBlur={() => validateContactField('email')}
                      aria-invalid={Boolean(contactErrors.email)}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                        contactErrors.email
                          ? 'border-red-300 focus:ring-red-200'
                          : 'border-gray-200 focus:ring-pink-500'
                      }`}
                    />
                    {contactErrors.email ? <p className="mt-2 text-sm text-red-600">{contactErrors.email}</p> : null}
                  </div>
                </div>
                <div>
                  <label htmlFor="contact-phone" className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    id="contact-phone"
                    type="tel"
                    placeholder="+92 300 1234567"
                    value={contactForm.phone}
                    onChange={(event) => updateContactField('phone', event.target.value)}
                    onBlur={() => validateContactField('phone')}
                    aria-invalid={Boolean(contactErrors.phone)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      contactErrors.phone
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-200 focus:ring-pink-500'
                    }`}
                  />
                  {contactErrors.phone ? <p className="mt-2 text-sm text-red-600">{contactErrors.phone}</p> : null}
                </div>
                <div>
                  <label htmlFor="contact-message" className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Your message..."
                    value={contactForm.message}
                    onChange={(event) => updateContactField('message', event.target.value)}
                    onBlur={() => validateContactField('message')}
                    aria-invalid={Boolean(contactErrors.message)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      contactErrors.message
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-200 focus:ring-pink-500'
                    }`}
                  />
                  <div className="mt-2 flex items-center justify-between gap-3">
                    {contactErrors.message ? <p className="text-sm text-red-600">{contactErrors.message}</p> : <span />}
                    <p className="text-xs text-gray-500">{contactForm.message.trim().length}/1000</p>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={contactLoading}
                  className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {contactLoading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
