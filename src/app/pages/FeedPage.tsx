import { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, Send, Upload, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { getStoredToken } from '@/core/api/client';
import {
  addFeedComment,
  createFeedPost,
  getFeed,
  getFeedWithoutAuth,
  likeFeedPost,
} from '@/core/api/services/feed';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Skeleton } from '../components/ui/skeleton';
import type { FeedPostViewModel } from '../utils/marketplace';
import { formatDisplayDate, mapFeedComment, mapFeedPost } from '../utils/marketplace';

function FeedComposerSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg">
      <div className="flex items-start gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-10 w-28 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
        </div>
      </div>
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="space-y-4 p-6">
        <div className="flex gap-6">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-20" />
        </div>
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function FeedPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [posts, setPosts] = useState<FeedPostViewModel[]>([]);
  const [newPost, setNewPost] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoggedIn = Boolean(getStoredToken());

  useEffect(() => {
    let active = true;

    async function loadFeed() {
      setLoading(true);
      setError(null);

      try {
        const records = isLoggedIn ? await getFeed() : await getFeedWithoutAuth();
        if (!active) return;
        setPosts(records.map((post) => mapFeedPost(post)));
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load feed.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadFeed();

    return () => {
      active = false;
    };
  }, [isLoggedIn]);

  async function handleLike(postId: string) {
    if (!isLoggedIn) {
      toast.message('Log in to like posts.');
      return;
    }

    const previousPosts = posts;
    setPosts((currentPosts) =>
      currentPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? Math.max(0, post.likes - 1) : post.likes + 1,
            }
          : post
      )
    );

    try {
      await likeFeedPost(Number(postId));
    } catch (likeError) {
      setPosts(previousPosts);
      toast.error(likeError instanceof Error ? likeError.message : 'Failed to update like.');
    }
  }

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.message('Log in to create a feed post.');
      return;
    }

    if (!newPost.trim()) return;

    setSubmitting(true);
    try {
      const res = await createFeedPost({ title: newPost.trim(), images: selectedFiles });
      if (res.status !== 1 || !res.data) throw new Error(res.message || 'Failed to create post.');

      setPosts((currentPosts) => [{ ...mapFeedPost(res.data), comments: [] }, ...currentPosts]);
      setNewPost('');
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Post shared successfully.');
    } catch (createError) {
      toast.error(createError instanceof Error ? createError.message : 'Failed to create post.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComment(postId: string) {
    if (!isLoggedIn) {
      toast.message('Log in to comment on posts.');
      return;
    }

    const comment = commentInputs[postId]?.trim();
    if (!comment) return;

    try {
      const res = await addFeedComment(Number(postId), comment);
      if (res.status !== 1 || !res.data) throw new Error(res.message || 'Failed to add comment.');

      setPosts((currentPosts) =>
        currentPosts.map((post) =>
          post.id === postId
            ? { ...post, comments: [...post.comments, mapFeedComment(res.data)] }
            : post
        )
      );
      setCommentInputs((current) => ({ ...current, [postId]: '' }));
    } catch (commentError) {
      toast.error(commentError instanceof Error ? commentError.message : 'Failed to add comment.');
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Feed</h1>
            <p className="text-gray-600">Share your wedding moments and connect with others</p>
          </div>

          {loading ? (
            <FeedComposerSkeleton />
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600">
                    <UserRound className="h-6 w-6" />
                  </div>
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="Share something with the community..."
                    rows={3}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 resize-none"
                  />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(e) => setSelectedFiles(Array.from(e.target.files ?? []))}
                />
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-pink-600 transition-colors"
                  >
                    <Upload className="w-5 h-5" />
                    <span>{selectedFiles.length > 0 ? `${selectedFiles.length} photo(s)` : 'Add Photo'}</span>
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg font-semibold hover:shadow-lg transition-shadow flex items-center gap-2 disabled:opacity-60"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Posting...' : 'Post'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-2xl p-6">{error}</div>
          ) : null}

          {loading ? (
            Array.from({ length: 3 }).map((_, index) => <FeedCardSkeleton key={index} />)
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="p-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ImageWithFallback src={post.userAvatar} alt={post.userName} className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <h3 className="font-bold text-gray-900">{post.userName}</h3>
                      <p className="text-sm text-gray-500">
                        {formatDisplayDate(post.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 pb-4">
                  <p className="text-gray-900">{post.content}</p>
                </div>

                {post.image ? (
                  <div className="aspect-video">
                    <ImageWithFallback src={post.image} alt="Post" className="w-full h-full object-cover" />
                  </div>
                ) : null}

                <div className="p-6 border-t border-gray-100">
                  <div className="flex items-center gap-6 mb-4">
                    <button
                      type="button"
                      onClick={() => void handleLike(post.id)}
                      className={`flex items-center gap-2 ${
                        post.isLiked ? 'text-pink-600' : 'text-gray-600'
                      } hover:text-pink-600 transition-colors`}
                    >
                      <Heart className={`w-6 h-6 ${post.isLiked ? 'fill-pink-600' : ''}`} />
                      <span className="font-medium">{post.likes}</span>
                    </button>
                    <button type="button" className="flex items-center gap-2 text-gray-600">
                      <MessageCircle className="w-6 h-6" />
                      <span className="font-medium">{post.comments.length}</span>
                    </button>
                  </div>

                  {post.comments.length > 0 ? (
                    <div className="space-y-3 mt-4 pt-4 border-t border-gray-100">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold text-pink-600">{comment.userName[0]}</span>
                          </div>
                          <div className="flex-1">
                            <div className="bg-gray-50 rounded-lg px-4 py-2">
                              <h4 className="font-bold text-sm text-gray-900 mb-1">{comment.userName}</h4>
                              <p className="text-sm text-gray-700">{comment.text}</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatDisplayDate(comment.timestamp)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-4 flex gap-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] ?? ''}
                      onChange={(e) => setCommentInputs((current) => ({ ...current, [post.id]: e.target.value }))}
                      placeholder="Write a comment..."
                      className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                    <button
                      type="button"
                      onClick={() => void handleComment(post.id)}
                      className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
