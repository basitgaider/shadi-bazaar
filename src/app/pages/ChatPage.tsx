import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Search, Send, ArrowLeft, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Skeleton } from '../components/ui/skeleton';
import { getStoredToken } from '@/core/api/client';
import { ROUTES } from '@/core/constants';
import { addChat, getChats, getChatThread, type ChatMessageRecord, type ChatThreadRecord } from '@/core/api/services/chat';
import { resolveApiAssetUrl } from '../utils/marketplace';

interface ConversationViewModel {
  id: string;
  memberId: number;
  postId: number;
  userName: string;
  userAvatar: string;
  adTitle: string;
  adImage?: string;
  lastMessage: string;
  lastMessageTime?: string;
  unreadCount: number;
}

interface MessageViewModel {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

function ChatSidebarSkeleton() {
  return (
    <div className="flex-1 space-y-2 overflow-y-auto p-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChatDetailSkeleton() {
  return (
    <div className="flex-1 space-y-4 overflow-y-auto p-6 bg-gray-50">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
          <Skeleton className="h-14 w-56 rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

function mapConversation(thread: ChatThreadRecord): ConversationViewModel {
  return {
    id: thread.thread_key,
    memberId: thread.member_id,
    postId: thread.post_id,
    userName: thread.user?.name || 'Member',
    userAvatar: resolveApiAssetUrl(thread.user?.image),
    adTitle: thread.post?.title || 'Listing',
    adImage: resolveApiAssetUrl(thread.post?.image),
    lastMessage: thread.last_message || 'No messages yet',
    lastMessageTime: thread.last_message_time || thread.updated_at,
    unreadCount: thread.unread_count ?? 0,
  };
}

function mapMessage(message: ChatMessageRecord): MessageViewModel {
  return {
    id: String(message.id),
    senderId: String(message.sender_id),
    text: message.message,
    timestamp: message.created_at || new Date().toISOString(),
  };
}

export function ChatPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [threads, setThreads] = useState<ConversationViewModel[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageViewModel[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userIdParam = Number(searchParams.get('userId') ?? 0) || null;
  const adIdParam = Number(searchParams.get('adId') ?? 0) || null;

  useEffect(() => {
    if (!getStoredToken()) {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let active = true;

    async function loadThreads() {
      setLoadingThreads(true);
      setError(null);

      try {
        const records = await getChats();
        if (!active) return;

        const mappedThreads = records.map(mapConversation);
        setThreads(mappedThreads);

        if (userIdParam && adIdParam) {
          const matchedThread = mappedThreads.find((thread) => thread.memberId === userIdParam && thread.postId === adIdParam);
          setSelectedChat(matchedThread ? matchedThread.id : `${userIdParam}:${adIdParam}`);
          return;
        }

        if (userIdParam && !adIdParam) {
          const matchedThread = mappedThreads.find((thread) => thread.memberId === userIdParam);
          setSelectedChat(matchedThread?.id ?? null);
          return;
        }

        setSelectedChat((current) => current ?? mappedThreads[0]?.id ?? null);
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load chats.');
      } finally {
        if (active) setLoadingThreads(false);
      }
    }

    void loadThreads();

    return () => {
      active = false;
    };
  }, [adIdParam, userIdParam]);

  const selectedConversation = useMemo(
    () => threads.find((thread) => thread.id === selectedChat) ?? null,
    [selectedChat, threads]
  );

  useEffect(() => {
    let active = true;

    async function loadMessages() {
      if (!selectedChat) {
        setMessages([]);
        return;
      }

      const [memberIdRaw, postIdRaw] = selectedChat.split(':');
      const memberId = Number(memberIdRaw);
      const postId = Number(postIdRaw);

      if (!memberId || !postId) {
        setMessages([]);
        return;
      }

      setLoadingMessages(true);

      try {
        const detail = await getChatThread(memberId, postId);
        if (!active) return;

        setMessages((detail.records ?? []).map(mapMessage));

        const threadExists = threads.some((thread) => thread.id === selectedChat);
        if (!threadExists && detail.thread?.user) {
          const injectedThread: ConversationViewModel = {
            id: detail.thread.thread_key,
            memberId: detail.thread.member_id,
            postId: detail.thread.post_id,
            userName: detail.thread.user.name,
            userAvatar: resolveApiAssetUrl(detail.thread.user.image),
            adTitle: detail.thread.post?.title || 'Listing',
            adImage: resolveApiAssetUrl(detail.thread.post?.image),
            lastMessage: '',
            lastMessageTime: undefined,
            unreadCount: 0,
          };

          setThreads((current) => [injectedThread, ...current]);
        } else {
          setThreads((current) =>
            current.map((thread) => (thread.id === selectedChat ? { ...thread, unreadCount: 0 } : thread))
          );
        }
      } catch (loadError) {
        if (!active) return;
        setError(loadError instanceof Error ? loadError.message : 'Failed to load conversation.');
      } finally {
        if (active) setLoadingMessages(false);
      }
    }

    void loadMessages();

    return () => {
      active = false;
    };
  }, [selectedChat, threads]);

  const filteredThreads = useMemo(() => {
    if (!searchTerm.trim()) return threads;
    const normalized = searchTerm.trim().toLowerCase();
    return threads.filter(
      (thread) =>
        thread.userName.toLowerCase().includes(normalized) ||
        thread.adTitle.toLowerCase().includes(normalized) ||
        thread.lastMessage.toLowerCase().includes(normalized)
    );
  }, [searchTerm, threads]);

  async function handleSendMessage(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedChat || !messageInput.trim()) return;

    const [memberIdRaw, postIdRaw] = selectedChat.split(':');
    const memberId = Number(memberIdRaw);
    const postId = Number(postIdRaw);
    if (!memberId || !postId) return;

    setSending(true);

    try {
      const res = await addChat({ member_id: memberId, post_id: postId, message: messageInput.trim() });
      if (res.status !== 1 || !res.data) throw new Error(res.message || 'Failed to send message.');

      const nextMessage = mapMessage(res.data);
      setMessages((current) => [...current, nextMessage]);
      setThreads((current) => {
        const existing = current.find((thread) => thread.id === selectedChat);
        const updatedThread: ConversationViewModel = existing
          ? {
              ...existing,
              lastMessage: nextMessage.text,
              lastMessageTime: nextMessage.timestamp,
            }
          : {
              id: selectedChat,
              memberId,
              postId,
              userName: 'Member',
              userAvatar: resolveApiAssetUrl(undefined),
              adTitle: 'Listing',
              lastMessage: nextMessage.text,
              lastMessageTime: nextMessage.timestamp,
              unreadCount: 0,
            };

        return [updatedThread, ...current.filter((thread) => thread.id !== selectedChat)];
      });
      setMessageInput('');
      toast.success('Message sent.');
    } catch (sendError) {
      toast.error(sendError instanceof Error ? sendError.message : 'Failed to send message.');
    } finally {
      setSending(false);
    }
  }

  function openConversation(threadId: string) {
    setSelectedChat(threadId);
    const [memberIdRaw, postIdRaw] = threadId.split(':');
    const nextParams = new URLSearchParams();
    nextParams.set('userId', memberIdRaw);
    nextParams.set('adId', postIdRaw);
    setSearchParams(nextParams, { replace: true });
  }

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Messages</h1>

          {error ? <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{error}</div> : null}

          <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 250px)', minHeight: '600px' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 h-full">
              <div className={`border-r border-gray-200 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-200 flex-shrink-0">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search conversations..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    />
                  </div>
                </div>

                {loadingThreads ? (
                  <ChatSidebarSkeleton />
                ) : (
                  <div className="flex-1 overflow-y-auto">
                    {filteredThreads.length > 0 ? (
                      filteredThreads.map((conversation) => (
                        <button
                          key={conversation.id}
                          onClick={() => openConversation(conversation.id)}
                          className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 ${
                            selectedChat === conversation.id ? 'bg-pink-50' : ''
                          }`}
                        >
                          <ImageWithFallback
                            src={conversation.userAvatar}
                            alt={conversation.userName}
                            className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 text-left min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-bold text-gray-900 truncate">{conversation.userName}</h3>
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {conversation.lastMessageTime
                                  ? new Date(conversation.lastMessageTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                                  : ''}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-1 mb-1">{conversation.adTitle}</p>
                            <p className="text-sm text-gray-500 line-clamp-1">{conversation.lastMessage || 'Start the conversation'}</p>
                          </div>
                          {conversation.unreadCount > 0 && (
                            <span className="w-6 h-6 bg-pink-600 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="flex h-full items-center justify-center p-6 text-center text-gray-500">
                        No conversations found.
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={`md:col-span-2 flex flex-col ${selectedChat ? 'flex' : 'hidden md:flex'}`}>
                {selectedConversation ? (
                  <>
                    <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <button onClick={() => setSelectedChat(null)} className="md:hidden text-gray-600 hover:text-pink-600 flex-shrink-0">
                          <ArrowLeft className="w-6 h-6" />
                        </button>
                        <ImageWithFallback
                          src={selectedConversation.userAvatar}
                          alt={selectedConversation.userName}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 truncate">{selectedConversation.userName}</h3>
                          <p className="text-sm text-gray-600 truncate">{selectedConversation.adTitle}</p>
                        </div>
                      </div>
                      {selectedConversation.postId ? (
                        <Link
                          to={ROUTES.POST(String(selectedConversation.postId))}
                          className="text-sm font-medium text-pink-600 hover:underline flex-shrink-0"
                        >
                          View Ad
                        </Link>
                      ) : null}
                    </div>

                    {loadingMessages ? (
                      <ChatDetailSkeleton />
                    ) : (
                      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                        {messages.length === 0 ? (
                          <div className="flex h-full items-center justify-center text-center text-gray-500">
                            Start the conversation with your first message.
                          </div>
                        ) : (
                          messages.map((message) => (
                            <div key={message.id} className={`flex ${message.senderId === String(selectedConversation.memberId) ? 'justify-start' : 'justify-end'}`}>
                              <div
                                className={`max-w-md px-4 py-2 rounded-2xl ${
                                  message.senderId === String(selectedConversation.memberId)
                                    ? 'bg-white text-gray-900 shadow-sm'
                                    : 'bg-gradient-to-r from-pink-600 to-rose-600 text-white'
                                }`}
                              >
                                <p>{message.text}</p>
                                <p
                                  className={`text-xs mt-1 ${
                                    message.senderId === String(selectedConversation.memberId) ? 'text-gray-500' : 'text-pink-100'
                                  }`}
                                >
                                  {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                      <form onSubmit={handleSendMessage} className="flex gap-3">
                        <input
                          type="text"
                          value={messageInput}
                          onChange={(e) => setMessageInput(e.target.value)}
                          placeholder="Type a message..."
                          className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                        <button
                          type="submit"
                          disabled={sending}
                          className="px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:shadow-lg transition-shadow flex items-center gap-2 flex-shrink-0 disabled:opacity-60"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">Select a conversation</p>
                      <p className="text-sm">Choose a chat to start messaging</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
