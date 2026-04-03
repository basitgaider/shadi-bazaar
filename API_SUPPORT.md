# Full API Support for React Project

**Short answer: Almost full support.** The Laravel v2 API covers almost all React features. A few UI fields need to be aligned with the API (login identifier and optional flows).

---

## ✅ Fully supported (API exists and matches React)

| React feature | Laravel API | Notes |
|---------------|-------------|--------|
| **Home** – Featured / new arrival listings | `posts/getFeaturedPost`, `posts/getNewArrivalPost` | Use `data.records` |
| **Home** – Listings by category (Bridal, Groom, Jewelry, etc.) | `posts/getPostsByCategory?category_id=` | Categories from `categories/` |
| **Home** – Search + filters (query, type, city) | `posts/searchFilters` (POST) | Send `title`, `city_id`, `category_id`, `item_type_id`, etc. |
| **Home** – Blog section | `blogs/`, `blogs/detail` | |
| **Home** – Contact form | `contacts/addContact` | |
| **Post detail** – Single listing | `posts/detail?id=` | |
| **Create ad** – Categories, cities, conditions, types | `categories/`, `cities/`, `conditions/`, `itemTypes/` | Use IDs in form |
| **Create ad** – Submit (title, description, images, type, condition, price, city) | `posts/addPost` (auth, FormData) | Map “type” (Sale/Rent/Service) to `item_type_id` |
| **My ads** – List | `posts/myPosts` (auth) | |
| **My ads** – Edit / delete | `posts/updatePost`, `posts/deletePost` (auth) | |
| **Favorites** – List, add, remove | `favourites/`, `favourites/addFavourite`, `favourites/deleteFavourite` (auth) | Uses `post_id` / `favourite_id` |
| **Feed** – List (guest + logged in) | `feed/posts/getPostsWithoutToken`, `feed/posts/getPosts` (auth) | |
| **Feed** – Create post, like, comments | `feed/posts/addPost`, `postLikeRemove`, `getCommentsByPost`, `addPostComment`, `deletePostComment` (auth) | |
| **Login** | `customer/login` | ⚠️ API uses **phone + password**, not email (see below) |
| **Sign up** | `customer/register` | Needs `country_code` + `phone`; React has “mobile” – map and add country code |
| **Verify OTP** | `customer/verify-otp` | After register / forgot |
| **Forgot / reset password** | `customer/forgot-password`, `customer/reset-password` | Phone-based OTP |
| **My profile** – Get / update | `customer/getProfile`, `customer/update-profile` (auth) | |
| **Change password** | `customer/change-password` (auth) | |
| **Public profile** | `getOtherUserProfile` | Query by user id |
| **Chat** – List, open thread, send | `getChats`, `getChatsByID`, `addChat` (auth) | |
| **Sign out** | `customer/sign-out` (auth) | |

So for **listings, search, filters, create/edit/delete ad, favorites, feed, profile, chat, auth (with one change below), contact, and blog**, there is full API support.

---

## ⚠️ Gaps / differences (need small changes)

### 1. Login: **phone** vs **email**

- **Laravel API** expects: `phone` + `password` (and optionally `device_type`, `device_token`).
- **React** LoginPage currently has: **email** + password.

**Options:**

- **A (recommended):** Change React login form to **phone + password** (and optionally country code) so it matches the API.
- **B:** Add an optional “login by email” endpoint in Laravel that finds user by email and then checks password (no change in React UI, but backend change required).

So: **full API support for login exists**, but the React form must send **phone** (and optionally country code), not email, unless you add B.

### 2. Sign up: **country_code** + **phone**

- **Laravel** expects: `name`, `email`, `country_code`, `phone`, `password`, `password_confirmation`, `verified_by: 'phone'`.
- **React** has: name, email, mobile, password, confirm password.

**Gap:** React does not have **country_code**. Fix: add a country/region dropdown (e.g. +92 for Pakistan) or default `country_code` (e.g. `"92"`) and send **phone** = mobile value. Then full API support.

### 3. Forgot password

- **Laravel** expects: `country_code` + `phone` (sends OTP to email in code).
- **React** ForgotPasswordPage uses **email**.

So either:

- Change React to **phone + country code** for forgot password, or  
- Add a Laravel endpoint that accepts **email** and sends OTP/reset link to that email.

Until one of these is done, forgot password is only **partially** supported (API exists but for phone, not email).

### 4. Image URLs

- Laravel returns paths like `/images/posts/xyz.png`. The React app must prefix them with the Laravel app URL (e.g. `VITE_API_BASE_URL`’s origin or a dedicated `VITE_IMAGE_BASE_URL`) so images load. This is a **front-end configuration**, not a missing API.

---

## ❌ Not in API (optional / future)

- **Notifications list** – API: `notifications/` (auth). If React has a notifications UI, it’s supported.
- **Reviews** – API: `addReview` (auth). If React shows reviews on public profile, you may need an endpoint to **list** reviews for a user (if not already present).
- **Promotional “ads”** (banners) – Laravel has `ads/` (list). If React only uses “posts” as listings, no gap. If you have separate banner ads, the list endpoint exists.

---

## Summary

| Area | Full API support? |
|------|-------------------|
| Listings (home, featured, category, search/filters) | ✅ Yes |
| Post detail, create, edit, delete, my ads | ✅ Yes |
| Favorites | ✅ Yes |
| Feed (list, create, like, comments) | ✅ Yes |
| Auth (register, verify OTP, profile, change password, sign out) | ✅ Yes |
| **Login** | ⚠️ Yes if React uses **phone + password** |
| **Sign up** | ⚠️ Yes if React sends **country_code** + **phone** |
| **Forgot / reset password** | ⚠️ Yes if React uses **phone**; or add email endpoint in Laravel |
| Contact, blog, public profile, chat | ✅ Yes |

So: **there is effectively full API support for the React project** provided you:

1. Use **phone + password** (and optionally country code) for **login** in the React app.  
2. Add **country_code** and send **phone** for **sign up** (and optionally for forgot password).  
3. Use the existing **posts** and **feed** endpoints for listings and social feed, and **customer/** and **favourites/** for auth and favorites.

No new endpoints are strictly required for the current React screens; only the login/signup/forgot UI and request payloads need to align with the existing API.
