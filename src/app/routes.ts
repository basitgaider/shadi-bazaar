import { createBrowserRouter } from 'react-router';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { SignUpPage } from './pages/SignUpPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { VerifyOtpPage } from './pages/VerifyOtpPage';
import { MyProfilePage } from './pages/MyProfilePage';
import { CreateAdPage } from './pages/CreateAdPage';
import { MyAdsPage } from './pages/MyAdsPage';
import { PostDetailPage } from './pages/PostDetailPage';
import { ChatPage } from './pages/ChatPage';
import { FeedPage } from './pages/FeedPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { PublicProfilePage } from './pages/PublicProfilePage';
import { BlogDetailPage } from './pages/BlogDetailPage';
import { SearchResultsPage } from './pages/SearchResultsPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: MainLayout,
    children: [
      { index: true, Component: HomePage },
      { path: 'blog/:id', Component: BlogDetailPage },
      { path: 'search', Component: SearchResultsPage },
      { path: 'feed', Component: FeedPage },
      { path: 'my-profile', Component: MyProfilePage },
      { path: 'favorites', Component: FavoritesPage },
      { path: 'chat', Component: ChatPage },
      { path: 'create-ad', Component: CreateAdPage },
      { path: 'create-ad/:id', Component: CreateAdPage },
      { path: 'my-ads', Component: MyAdsPage },
      { path: 'my-ads/:id', Component: PostDetailPage },
      { path: 'post/:id', Component: PostDetailPage },
      { path: 'profile/:id', Component: PublicProfilePage },
      { path: '*', Component: NotFoundPage },
    ],
  },
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/signup',
    Component: SignUpPage,
  },
  {
    path: '/forgot-password',
    Component: ForgotPasswordPage,
  },
  {
    path: '/reset-password',
    Component: ResetPasswordPage,
  },
  {
    path: '/verify',
    Component: VerifyOtpPage,
  },
]);
