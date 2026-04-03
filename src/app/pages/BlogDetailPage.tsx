import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { getBlogDetail, getBlogs, type BlogRecord } from '@/core/api/services/blogs';
import { ROUTES } from '@/core/constants';
import { formatDisplayDate, resolveApiAssetUrl, stripHtml, truncateText } from '../utils/marketplace';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Skeleton } from '../components/ui/skeleton';

function ArticleSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-4/5" />
        <Skeleton className="h-6 w-48" />
      </div>
      <Skeleton className="aspect-[16/8] w-full rounded-[2rem]" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className={`h-4 ${index === 7 ? 'w-2/3' : 'w-full'}`} />
        ))}
      </div>
    </div>
  );
}

export function BlogDetailPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState<BlogRecord | null>(null);
  const [recentBlogs, setRecentBlogs] = useState<BlogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadBlog() {
      if (!id) {
        setError('Blog not found.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [detail, allBlogs] = await Promise.all([getBlogDetail(id), getBlogs().catch(() => [])]);
        if (!active) return;

        setBlog(detail);
        setRecentBlogs(allBlogs.filter((record) => String(record.id) !== String(detail.id)).slice(0, 3));
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load blog article.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadBlog();

    return () => {
      active = false;
    };
  }, [id]);

  const articleHtml = useMemo(() => {
    if (!blog?.description) return '';
    return blog.description
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/\son\w+="[^"]*"/gi, '')
      .replace(/\son\w+='[^']*'/gi, '');
  }, [blog?.description]);

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto max-w-6xl px-4">
          <ArticleSkeleton />
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="bg-gray-50 min-h-screen py-12">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">{error ?? 'Blog not found.'}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className="rounded-[2rem] bg-white p-6 shadow-lg md:p-10">
            <Link
              to={ROUTES.HOME}
              className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-pink-600 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to home
            </Link>

            <p className="text-sm font-medium uppercase tracking-[0.2em] text-pink-600">ShadiBazar Blog</p>
            <h1 className="mt-3 text-3xl font-bold leading-tight text-gray-900 md:text-5xl">{blog.title}</h1>
            <p className="mt-4 text-gray-500">{formatDisplayDate(blog.created_at)}</p>

            <div className="mt-8 overflow-hidden rounded-[1.75rem] bg-gray-100">
              <ImageWithFallback
                src={resolveApiAssetUrl(blog.image)}
                alt={blog.title}
                className="aspect-[16/8] w-full object-cover"
              />
            </div>

            <div
              className="prose prose-lg mt-10 max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-strong:text-gray-900"
              dangerouslySetInnerHTML={{ __html: articleHtml }}
            />
          </article>

          <aside className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900">More from the blog</h2>
              <p className="mt-2 text-sm text-gray-600">Recent wedding tips and marketplace guides.</p>

              <div className="mt-6 space-y-5">
                {recentBlogs.length > 0 ? (
                  recentBlogs.map((record) => (
                    <Link
                      key={record.id}
                      to={ROUTES.BLOG(String(record.id))}
                      className="block rounded-2xl border border-gray-100 p-4 transition-colors hover:border-pink-200 hover:bg-pink-50/40"
                    >
                      <div className="mb-3 overflow-hidden rounded-xl bg-gray-100">
                        <ImageWithFallback
                          src={resolveApiAssetUrl(record.image)}
                          alt={record.title}
                          className="aspect-[16/9] w-full object-cover"
                        />
                      </div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-pink-600">
                        {formatDisplayDate(record.created_at)}
                      </p>
                      <h3 className="mt-2 font-bold text-gray-900">{record.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {truncateText(stripHtml(record.description), 110)}
                      </p>
                    </Link>
                  ))
                ) : (
                  <p className="rounded-xl bg-gray-50 px-4 py-5 text-sm text-gray-600">
                    No other blog articles are available right now.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
