// Mock data for ShadiBazar marketplace

export const cities = [
  'Karachi',
  'Lahore',
  'Islamabad',
  'Rawalpindi',
  'Faisalabad',
  'Multan',
  'Peshawar',
  'Quetta',
  'Sialkot',
  'Gujranwala',
];

export const categories = [
  'Bridal Dresses',
  'Groom Dresses',
  'Jewelry',
  'Photography',
  'Makeup Artist',
  'Venue',
  'Catering',
  'Decoration',
];

export interface Ad {
  id: string;
  title: string;
  price: number;
  city: string;
  type: 'Sale' | 'Rent' | 'Service';
  condition: 'New' | 'Excellent' | 'Good' | 'Used';
  category: string;
  image: string;
  views: number;
  isFavorite: boolean;
  description: string;
  seller: {
    id: string;
    name: string;
    rating: number;
    memberSince: string;
    phone: string;
    whatsapp: string;
    avatar: string;
  };
  status?: 'Active' | 'Pending' | 'Inactive';
  createdAt: string;
}

export const featuredAds: Ad[] = [
  {
    id: '1',
    title: 'Elegant Pink Bridal Lehenga',
    price: 85000,
    city: 'Lahore',
    type: 'Sale',
    condition: 'New',
    category: 'Bridal Dresses',
    image: 'https://images.unsplash.com/photo-1761571259874-bb4871c44340?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkYWwlMjBkcmVzcyUyMHBpbmslMjBlbGVnYW50fGVufDF8fHx8MTc3MDc2NTEwNXww&ixlib=rb-4.1.0&q=80&w=1080',
    views: 245,
    isFavorite: false,
    description: 'Stunning pink bridal lehenga with intricate embroidery and stone work. Perfect for your special day.',
    seller: {
      id: 's1',
      name: 'Ayesha Boutique',
      rating: 4.8,
      memberSince: '2022-01-15',
      phone: '+92 300 1234567',
      whatsapp: '+92 300 1234567',
      avatar: 'https://images.unsplash.com/photo-1677691257237-3294c7fd18a5?w=100',
    },
    status: 'Active',
    createdAt: '2026-02-05',
  },
  {
    id: '2',
    title: 'Royal Sherwani - Maroon',
    price: 45000,
    city: 'Karachi',
    type: 'Rent',
    condition: 'Excellent',
    category: 'Groom Dresses',
    image: 'https://images.unsplash.com/photo-1762709413447-15781dbc08f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm9vbSUyMHNoZXJ3YW5pJTIwdHJhZGl0aW9uYWx8ZW58MXx8fHwxNzcwNzY1MTA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 189,
    isFavorite: true,
    description: 'Premium quality sherwani in royal maroon color. Available for rent with complete accessories.',
    seller: {
      id: 's2',
      name: 'Groom Collection',
      rating: 4.9,
      memberSince: '2021-06-20',
      phone: '+92 301 9876543',
      whatsapp: '+92 301 9876543',
      avatar: 'https://images.unsplash.com/photo-1677691257237-3294c7fd18a5?w=100',
    },
    status: 'Active',
    createdAt: '2026-02-03',
  },
  {
    id: '3',
    title: 'Gold Bridal Jewelry Set',
    price: 125000,
    city: 'Islamabad',
    type: 'Sale',
    condition: 'New',
    category: 'Jewelry',
    image: 'https://images.unsplash.com/photo-1758995115857-2de1eb6283d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwamV3ZWxyeSUyMGdvbGQlMjBvcm5hdGV8ZW58MXx8fHwxNzcwNzY1MTA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 312,
    isFavorite: false,
    description: 'Exquisite gold bridal jewelry set including necklace, earrings, and tikka with precious stones.',
    seller: {
      id: 's3',
      name: 'Zahra Jewelers',
      rating: 4.7,
      memberSince: '2020-03-10',
      phone: '+92 333 5555555',
      whatsapp: '+92 333 5555555',
      avatar: 'https://images.unsplash.com/photo-1677691257237-3294c7fd18a5?w=100',
    },
    status: 'Active',
    createdAt: '2026-02-01',
  },
  {
    id: '4',
    title: 'Professional Wedding Photography',
    price: 75000,
    city: 'Lahore',
    type: 'Service',
    condition: 'New',
    category: 'Photography',
    image: 'https://images.unsplash.com/photo-1698082386199-fc60bc5b3e42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcGhvdG9ncmFwaHklMjBjb3VwbGV8ZW58MXx8fHwxNzcwNzM1OTE1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 156,
    isFavorite: true,
    description: 'Complete wedding photography and videography package with drone coverage and album.',
    seller: {
      id: 's4',
      name: 'Moments Studio',
      rating: 5.0,
      memberSince: '2019-11-05',
      phone: '+92 321 7777777',
      whatsapp: '+92 321 7777777',
      avatar: 'https://images.unsplash.com/photo-1677691257237-3294c7fd18a5?w=100',
    },
    status: 'Active',
    createdAt: '2026-01-30',
  },
  {
    id: '5',
    title: 'Red Bridal Dress - Heavy Work',
    price: 95000,
    city: 'Rawalpindi',
    type: 'Sale',
    condition: 'New',
    category: 'Bridal Dresses',
    image: 'https://images.unsplash.com/photo-1761571259874-bb4871c44340?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQYWtpc3RhbmklMjB3ZWRkaW5nJTIwYnJpZGUlMjBlbGVnYW50fGVufDF8fHx8MTc3MDc2NTEwNHww&ixlib=rb-4.1.0&q=80&w=1080',
    views: 278,
    isFavorite: false,
    description: 'Beautiful red bridal dress with heavy embroidery and kundan work. Designer collection.',
    seller: {
      id: 's5',
      name: 'Noor Bridal',
      rating: 4.6,
      memberSince: '2021-08-12',
      phone: '+92 300 8888888',
      whatsapp: '+92 300 8888888',
      avatar: 'https://images.unsplash.com/photo-1677691257237-3294c7fd18a5?w=100',
    },
    status: 'Active',
    createdAt: '2026-01-28',
  },
  {
    id: '6',
    title: 'Cream Sherwani with Turban',
    price: 38000,
    city: 'Faisalabad',
    type: 'Rent',
    condition: 'Good',
    category: 'Groom Dresses',
    image: 'https://images.unsplash.com/photo-1762709413447-15781dbc08f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm9vbSUyMHNoZXJ3YW5pJTIwdHJhZGl0aW9uYWx8ZW58MXx8fHwxNzcwNzY1MTA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 134,
    isFavorite: false,
    description: 'Classic cream sherwani with matching turban and shoes. Perfect for mehndi or barat.',
    seller: {
      id: 's6',
      name: 'Prince Collection',
      rating: 4.5,
      memberSince: '2022-02-18',
      phone: '+92 333 9999999',
      whatsapp: '+92 333 9999999',
      avatar: 'https://images.unsplash.com/photo-1677691257237-3294c7fd18a5?w=100',
    },
    status: 'Active',
    createdAt: '2026-01-25',
  },
  {
    id: '7',
    title: 'Kundan Jewelry - Full Set',
    price: 55000,
    city: 'Multan',
    type: 'Rent',
    condition: 'Excellent',
    category: 'Jewelry',
    image: 'https://images.unsplash.com/photo-1758995115857-2de1eb6283d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwamV3ZWxyeSUyMGdvbGQlMjBvcm5hdGV8ZW58MXx8fHwxNzcwNzY1MTA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 201,
    isFavorite: true,
    description: 'Complete kundan jewelry set for rent. Includes necklace, earrings, maang tikka, and bangles.',
    seller: {
      id: 's7',
      name: 'Regal Jewels',
      rating: 4.8,
      memberSince: '2020-09-22',
      phone: '+92 300 4444444',
      whatsapp: '+92 300 4444444',
      avatar: 'https://images.unsplash.com/photo-1677691257237-3294c7fd18a5?w=100',
    },
    status: 'Active',
    createdAt: '2026-01-22',
  },
  {
    id: '8',
    title: 'Bridal Makeup Service',
    price: 25000,
    city: 'Karachi',
    type: 'Service',
    condition: 'New',
    category: 'Makeup Artist',
    image: 'https://images.unsplash.com/photo-1677691257237-3294c7fd18a5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkYWwlMjBtYWtldXAlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzA3NjUxMDZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    views: 167,
    isFavorite: false,
    description: 'Professional bridal makeup with premium products. Includes trial session and touch-ups.',
    seller: {
      id: 's8',
      name: 'Glam Studio',
      rating: 4.9,
      memberSince: '2021-04-30',
      phone: '+92 321 3333333',
      whatsapp: '+92 321 3333333',
      avatar: 'https://images.unsplash.com/photo-1677691257237-3294c7fd18a5?w=100',
    },
    status: 'Active',
    createdAt: '2026-01-20',
  },
];

export const blogPosts = [
  {
    id: 'b1',
    title: 'Top 10 Bridal Trends for 2026',
    image: 'https://images.unsplash.com/photo-1761571259874-bb4871c44340?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxQYWtpc3RhbmklMjB3ZWRkaW5nJTIwYnJpZGUlMjBlbGVnYW50fGVufDF8fHx8MTc3MDc2NTEwNHww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Discover the latest bridal fashion trends dominating Pakistani weddings this year.',
    date: '2026-02-01',
  },
  {
    id: 'b2',
    title: 'How to Choose the Perfect Wedding Venue',
    image: 'https://images.unsplash.com/photo-1698082386199-fc60bc5b3e42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcGhvdG9ncmFwaHklMjBjb3VwbGV8ZW58MXx8fHwxNzcwNzM1OTE1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Essential tips for selecting a wedding venue that matches your style and budget.',
    date: '2026-01-28',
  },
  {
    id: 'b3',
    title: 'Budget-Friendly Wedding Planning Guide',
    image: 'https://images.unsplash.com/photo-1762709413447-15781dbc08f7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncm9vbSUyMHNoZXJ3YW5pJTIwdHJhZGl0aW9uYWx8ZW58MXx8fHwxNzcwNzY1MTA1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Learn how to plan your dream wedding without breaking the bank.',
    date: '2026-01-25',
  },
];

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  adId: string;
  adTitle: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export const conversations: Conversation[] = [
  {
    id: 'c1',
    userId: 's1',
    userName: 'Ayesha Boutique',
    userAvatar: 'https://images.unsplash.com/photo-1677691257237-3294c7fd18a5?w=100',
    adId: '1',
    adTitle: 'Elegant Pink Bridal Lehenga',
    lastMessage: 'Yes, the dress is still available!',
    lastMessageTime: '2026-02-10T10:30:00',
    unreadCount: 2,
    messages: [
      {
        id: 'm1',
        senderId: 'current-user',
        text: 'Is this dress still available?',
        timestamp: '2026-02-10T10:25:00',
        isRead: true,
      },
      {
        id: 'm2',
        senderId: 's1',
        text: 'Yes, the dress is still available!',
        timestamp: '2026-02-10T10:30:00',
        isRead: false,
      },
    ],
  },
  {
    id: 'c2',
    userId: 's4',
    userName: 'Moments Studio',
    userAvatar: 'https://images.unsplash.com/photo-1677691257237-3294c7fd18a5?w=100',
    adId: '4',
    adTitle: 'Professional Wedding Photography',
    lastMessage: 'We can discuss the package details tomorrow.',
    lastMessageTime: '2026-02-09T15:45:00',
    unreadCount: 0,
    messages: [
      {
        id: 'm3',
        senderId: 'current-user',
        text: 'Can we schedule a meeting to discuss the photography package?',
        timestamp: '2026-02-09T15:40:00',
        isRead: true,
      },
      {
        id: 'm4',
        senderId: 's4',
        text: 'We can discuss the package details tomorrow.',
        timestamp: '2026-02-09T15:45:00',
        isRead: true,
      },
    ],
  },
];

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: string;
  }>;
  isLiked: boolean;
}

export const feedPosts: FeedPost[] = [
  {
    id: 'f1',
    userId: 's1',
    userName: 'Ayesha Boutique',
    userAvatar: 'https://images.unsplash.com/photo-1677691257237-3294c7fd18a5?w=100',
    content: 'Just launched our new bridal collection! Check out these stunning pieces 💕',
    image: 'https://images.unsplash.com/photo-1761571259874-bb4871c44340?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkYWwlMjBkcmVzcyUyMHBpbmslMjBlbGVnYW50fGVufDF8fHx8MTc3MDc2NTEwNXww&ixlib=rb-4.1.0&q=80&w=1080',
    timestamp: '2026-02-10T09:00:00',
    likes: 45,
    comments: [
      {
        id: 'c1',
        userId: 'u1',
        userName: 'Sara Khan',
        text: 'Absolutely gorgeous! 😍',
        timestamp: '2026-02-10T09:15:00',
      },
    ],
    isLiked: false,
  },
  {
    id: 'f2',
    userId: 's4',
    userName: 'Moments Studio',
    userAvatar: 'https://images.unsplash.com/photo-1677691257237-3294c7fd18a5?w=100',
    content: 'Another beautiful wedding captured! Congratulations to the lovely couple 🎉',
    image: 'https://images.unsplash.com/photo-1698082386199-fc60bc5b3e42?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwcGhvdG9ncmFwaHklMjBjb3VwbGV8ZW58MXx8fHwxNzcwNzM1OTE1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    timestamp: '2026-02-09T14:30:00',
    likes: 78,
    comments: [
      {
        id: 'c2',
        userId: 'u2',
        userName: 'Ali Ahmed',
        text: 'Beautiful work!',
        timestamp: '2026-02-09T15:00:00',
      },
      {
        id: 'c3',
        userId: 'u3',
        userName: 'Fatima Malik',
        text: 'Can you share your contact details?',
        timestamp: '2026-02-09T16:20:00',
      },
    ],
    isLiked: true,
  },
];
