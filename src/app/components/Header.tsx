import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Bell, CheckCheck, Facebook, Heart, House, Instagram, LayoutGrid, LogOut, MessageCircle, Newspaper, Trash2, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { getStoredToken } from '../../core/api/client';
import { ROUTES } from '../../core/constants';
import * as authApi from '../../core/api/services/auth';
import {
  deleteAllNotifications,
  deleteNotification,
  getNotifications,
  markNotificationsRead,
  type NotificationRecord,
} from '../../core/api/services/notifications';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Skeleton } from './ui/skeleton';
import { formatDisplayDate, resolveApiAssetUrl } from '../utils/marketplace';

function NotificationListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-gray-100 p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function getNotificationTarget(record: NotificationRecord): string | null {
  switch (record.trigger_type) {
    case 'post_approved':
      return record.trigger_id ? ROUTES.POST(String(record.trigger_id)) : ROUTES.MY_ADS;
    case 'someone_chat':
      return ROUTES.CHAT;
    case 'feed_post_deleted':
      return ROUTES.FEED;
    default:
      return null;
  }
}

export function Header() {
  const navigate = useNavigate();
  const isLoggedIn = Boolean(getStoredToken());
  const notificationPanelRef = useRef<HTMLDivElement | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [mutatingNotificationId, setMutatingNotificationId] = useState<number | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  useEffect(() => {
    if (!panelOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (!notificationPanelRef.current?.contains(event.target as Node)) {
        setPanelOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [panelOpen]);

  useEffect(() => {
    if (!isLoggedIn || !panelOpen) return;

    let active = true;

    async function loadNotifications() {
      setLoadingNotifications(true);

      try {
        const response = await getNotifications();
        if (!active) return;
        setNotifications(response.records);
        setUnreadCount(response.unread_count);
      } catch (error) {
        if (!active) return;
        toast.error(error instanceof Error ? error.message : 'Failed to load notifications.');
      } finally {
        if (active) setLoadingNotifications(false);
      }
    }

    void loadNotifications();

    return () => {
      active = false;
    };
  }, [isLoggedIn, panelOpen]);

  useEffect(() => {
    if (!isLoggedIn) {
      setPanelOpen(false);
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  const handleLogout = async () => {
    await authApi.signOut().catch(() => {});
    setPanelOpen(false);
    navigate(ROUTES.HOME);
  };

  async function handleMarkAllRead() {
    if (!notifications.some((record) => !record.is_read)) return;

    try {
      await markNotificationsRead();
      setNotifications((current) => current.map((record) => ({ ...record, is_read: true })));
      setUnreadCount(0);
      toast.success('Notifications marked as read.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to mark notifications as read.');
    }
  }

  async function handleDeleteNotification(notificationId: number) {
    setMutatingNotificationId(notificationId);

    try {
      await deleteNotification(notificationId);
      setNotifications((current) => current.filter((record) => record.id !== notificationId));
      setUnreadCount((current) => {
        const deleted = notifications.find((record) => record.id === notificationId);
        return deleted && !deleted.is_read ? Math.max(0, current - 1) : current;
      });
      toast.success('Notification removed.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete notification.');
    } finally {
      setMutatingNotificationId(null);
    }
  }

  async function handleDeleteAllNotifications() {
    if (!notifications.length) return;

    setClearingAll(true);

    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
      toast.success('All notifications removed.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to clear notifications.');
    } finally {
      setClearingAll(false);
    }
  }

  async function handleOpenNotification(record: NotificationRecord) {
    const target = getNotificationTarget(record);

    if (!record.is_read) {
      try {
        await markNotificationsRead(record.id);
        setNotifications((current) =>
          current.map((notification) =>
            notification.id === record.id ? { ...notification, is_read: true } : notification
          )
        );
        setUnreadCount((current) => Math.max(0, current - 1));
      } catch {
        // keep navigation available even if marking read fails
      }
    }

    setPanelOpen(false);
    if (target) navigate(target);
  }

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="hidden items-center gap-4 text-sm text-gray-600 sm:flex">
              <span>Follow us:</span>
              <a href="/" className="transition-colors hover:text-pink-600" aria-label="Facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="/" className="transition-colors hover:text-pink-600" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="/" className="transition-colors hover:text-pink-600" aria-label="Message">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
            <div className="ml-auto text-xs text-gray-600 sm:text-sm">
              <span>+92 300 1234567</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-6">
          <Link to="/" className="flex min-w-0 flex-shrink-0 items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
              <Heart className="h-6 w-6 fill-white text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                ShadiBazar
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">Your Wedding Marketplace</p>
            </div>
          </Link>

          <nav className="hidden flex-1 items-center justify-center gap-8 md:flex">
            <Link to={ROUTES.HOME} className="font-medium text-gray-700 transition-colors hover:text-pink-600">
              Home
            </Link>
            <Link to={ROUTES.FEED} className="font-medium text-gray-700 transition-colors hover:text-pink-600">
              Feed
            </Link>
            <Link to={ROUTES.MY_PROFILE} className="font-medium text-gray-700 transition-colors hover:text-pink-600">
              My Profile
            </Link>
            <Link to={ROUTES.MY_ADS} className="font-medium text-gray-700 transition-colors hover:text-pink-600">
              My Ads
            </Link>
            <Link to={ROUTES.FAVORITES} className="font-medium text-gray-700 transition-colors hover:text-pink-600">
              Favorites
            </Link>
            <Link to={ROUTES.CHAT} className="font-medium text-gray-700 transition-colors hover:text-pink-600">
              Messages
            </Link>
          </nav>

          <div className="relative flex w-full flex-shrink-0 items-center justify-end gap-2 sm:w-auto sm:gap-3" ref={notificationPanelRef}>
            {isLoggedIn ? (
              <>
                <button
                  type="button"
                  onClick={() => setPanelOpen((current) => !current)}
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-pink-100 bg-pink-50 text-pink-600 transition-colors hover:bg-pink-100"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 ? (
                    <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1.5 text-xs font-semibold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  ) : null}
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-pink-600 px-4 py-2 text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50 sm:flex-none sm:px-6 sm:text-base"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.LOGIN}
                  className="flex-1 whitespace-nowrap rounded-lg border border-pink-600 px-4 py-2 text-center text-sm font-medium text-pink-600 transition-colors hover:bg-pink-50 sm:flex-none sm:px-6 sm:text-base"
                >
                  Login
                </Link>
                <Link
                  to={ROUTES.SIGNUP}
                  className="flex-1 whitespace-nowrap rounded-lg bg-gradient-to-r from-pink-600 to-rose-600 px-4 py-2 text-center text-sm font-medium text-white transition-shadow hover:shadow-lg sm:flex-none sm:px-6 sm:text-base"
                >
                  Sign Up
                </Link>
              </>
            )}

            {panelOpen && isLoggedIn ? (
              <div className="absolute right-0 top-[calc(100%+14px)] z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-pink-100 bg-white shadow-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                    <p className="text-sm text-gray-500">{unreadCount} unread</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void handleMarkAllRead()}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-pink-50 hover:text-pink-600"
                      title="Mark all as read"
                    >
                      <CheckCheck className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDeleteAllNotifications()}
                      disabled={clearingAll || notifications.length === 0}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Clear all notifications"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPanelOpen(false)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100"
                      title="Close notifications"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="max-h-[28rem] overflow-y-auto">
                  {loadingNotifications ? (
                    <NotificationListSkeleton />
                  ) : notifications.length === 0 ? (
                    <div className="px-5 py-10 text-center text-sm text-gray-500">No notifications yet.</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {notifications.map((record) => {
                        const target = getNotificationTarget(record);
                        return (
                          <div
                            key={record.id}
                            className={`group flex gap-3 px-5 py-4 transition-colors ${
                              record.is_read ? 'bg-white' : 'bg-pink-50/60'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => void handleOpenNotification(record)}
                              className="flex min-w-0 flex-1 items-start gap-3 text-left"
                            >
                              <ImageWithFallback
                                src={resolveApiAssetUrl(record.sender?.image || record.image)}
                                alt={record.sender?.name || 'Notification'}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="truncate font-semibold text-gray-900">
                                      {record.title || record.sender?.name || 'Notification'}
                                    </p>
                                    <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                                      {record.message || 'You have a new update.'}
                                    </p>
                                  </div>
                                  {!record.is_read ? <span className="mt-1 h-2.5 w-2.5 rounded-full bg-rose-500" /> : null}
                                </div>
                                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                                  <span>{formatDisplayDate(record.created_at)}</span>
                                  {target ? <span className="rounded-full bg-gray-100 px-2 py-1">Open</span> : null}
                                </div>
                              </div>
                            </button>

                            <button
                              type="button"
                              onClick={() => void handleDeleteNotification(record.id)}
                              disabled={mutatingNotificationId === record.id}
                              className="mt-1 inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Delete notification"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 md:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="grid grid-cols-6 items-center gap-2 text-xs">
            <Link to={ROUTES.HOME} className="flex flex-col items-center gap-1 text-gray-700">
              <House className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link to={ROUTES.FEED} className="flex flex-col items-center gap-1 text-gray-700">
              <Newspaper className="h-4 w-4" />
              <span>Feed</span>
            </Link>
            <Link to={ROUTES.MY_PROFILE} className="flex flex-col items-center gap-1 text-gray-700">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            <Link to={ROUTES.MY_ADS} className="flex flex-col items-center gap-1 text-gray-700">
              <LayoutGrid className="h-4 w-4" />
              <span>Ads</span>
            </Link>
            <Link to={ROUTES.FAVORITES} className="flex flex-col items-center gap-1 text-gray-700">
              <Heart className="h-4 w-4" />
              <span>Favorites</span>
            </Link>
            <Link to={ROUTES.CHAT} className="flex flex-col items-center gap-1 text-gray-700">
              <MessageCircle className="h-4 w-4" />
              <span>Messages</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
