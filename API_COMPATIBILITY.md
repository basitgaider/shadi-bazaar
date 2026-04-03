# Laravel v2 API → React Integration

This document maps **shadi-bazaar-v2** (Laravel) APIs to the React app and how to use them.

## Base URL & Auth

- **Base URL**: Set in `.env` as `VITE_API_BASE_URL` (e.g. `http://localhost:8000/api/v1`).
- **Auth**: Laravel Passport. After login/register, the API returns an **access token**. Send it on protected routes as:
  ```http
  Authorization: Bearer <access_token>
  ```
- **Response format** (all endpoints):
  ```json
  { "status": 0|1, "message": "string", "data": ... }
  ```
  - `status === 1`: success; use `data`.
  - `status === 0` or HTTP 4xx: error; show `message` (and `data` for validation errors).

---

## 1. Customer Auth (`/customer/...`)

| React need        | Method | Endpoint                    | Body / params | Notes |
|-------------------|--------|-----------------------------|---------------|--------|
| Login             | POST   | `customer/login`            | `phone`, `password`, `device_type?` (android\|ios), `device_token?` | Returns user + token in `data`. |
| Register          | POST   | `customer/register`         | `name`, `email`, `country_code`, `phone`, `password`, `password_confirmation`, `verified_by: "phone"` | Sends OTP; may return verification payload. |
| Verify OTP        | POST   | `customer/verify-otp`       | `country_code`, `phone`, `otp` (4 digits) | After register or forgot. Use `redirectToPassword` for reset flow. |
| Resend OTP        | POST   | `customer/resend-otp`       | `country_code`, `phone` | |
| Forgot password   | POST   | `customer/forgot-password`  | `country_code`, `phone` | Sends OTP to email. |
| Reset password    | POST   | `customer/reset-password`   | `country_code`, `phone`, `password`, `password_confirmation` | After OTP verified. |
| Get profile       | GET    | `customer/getProfile`       | — (auth) | |
| Update profile    | POST   | `customer/update-profile`   | (auth) form/data: `name`, `country_code`, `phone`, `email`, `whatsapp_number`, `address`, `city_id`, `image` (file), etc. | |
| Change password   | POST   | `customer/change-password`  | (auth) `old_password`, `new_password` (and confirmation if validated) | |
| Sign out          | GET    | `customer/sign-out`         | — (auth) | |
| Social login      | POST   | `customer/social/google` or `/facebook` or `/apple` | Provider-specific payload | |

---

## 2. Meta / Reference Data (no auth)

Use these for dropdowns and filters in the React app.

| React need     | Method | Endpoint           | Response (in `data`) |
|----------------|--------|--------------------|----------------------|
| Categories     | GET    | `categories/`      | `records` (list)     |
| Cities         | GET    | `cities/`          | `records`            |
| Conditions     | GET    | `conditions/`      | `records`            |
| Item types     | GET    | `itemTypes/`       | `records`            |
| Static content | GET    | `contents/`        | `records`            |

---

## 3. Posts (Marketplace listings – “Ads”)

**Prefix**: `posts/`

| React need           | Method | Endpoint                  | Query / body | Auth |
|----------------------|--------|---------------------------|--------------|------|
| List posts           | GET    | `posts/`                  | Pagination   | No   |
| Post detail          | GET    | `posts/detail`            | `id` (or similar) | No   |
| Featured             | GET    | `posts/getFeaturedPost`   | —            | No   |
| New arrival          | GET    | `posts/getNewArrivalPost` | —            | No   |
| By category          | GET    | `posts/getPostsByCategory`| `category_id`| No   |
| By item type         | GET    | `posts/getPostsByItemType` | `item_type_id` | No  |
| Search by title      | POST   | `posts/search`            | `title`      | No   |
| Search/filters       | POST   | `posts/searchFilters`     | Filters (category, city, etc.) | No   |
| Best photographer    | GET    | `posts/getBestPhotographerPosts` | —     | No   |
| Best banquet/salon/boutique | GET | `posts/getBestBanquetPosts` etc. | —   | No   |
| My posts             | GET    | `posts/myPosts`           | —            | Yes  |
| Create post          | POST   | `posts/addPost`           | See below    | Yes  |
| Update post          | POST   | `posts/updatePost`        | `post_id` + same as create | Yes |
| Delete post          | POST   | `posts/deletePost`        | `post_id`    | Yes  |
| Delete post image    | POST   | `posts/deletePostImage`   | `post_id`, `post_image_id` | Yes |

**Create/update post body**: `category_id`, `item_type_id`, `condition_id`, `city_id`, `title`, `description`, `price` (or for rent: `deposit`, `rent_per_day`), `images` (array of files or base64 per backend).

---

## 4. Feed (social feed – separate from Posts)

**Prefix**: `feed/posts/`

| React need     | Method | Endpoint                        | Auth |
|----------------|--------|----------------------------------|------|
| List (no auth) | GET    | `feed/posts/getPostsWithoutToken` | No   |
| List (auth)    | GET    | `feed/posts/getPosts`           | Yes  |
| My feed posts  | GET    | `feed/posts/getMyPosts`         | Yes  |
| Feed detail    | GET    | `feed/posts/getPostDetail`      | Yes  (query: post id) |
| Create         | POST   | `feed/posts/addPost`            | Yes  (`title`, `images[]`) |
| Update         | POST   | `feed/posts/updatePost`         | Yes  |
| Delete         | POST   | `feed/posts/deletePost`         | Yes  |
| Like/unlike    | POST   | `feed/posts/postLikeRemove`     | Yes  (`post_id`) |
| Comments       | GET    | `feed/posts/getCommentsByPost`  | Yes  (`post_id`) |
| Add comment    | POST   | `feed/posts/addPostComment`    | Yes  (`post_id`, `comment`) |
| Delete comment | POST   | `feed/posts/deletePostComment`  | Yes  (`comment_id`) |

---

## 5. Favourites (auth)

**Prefix**: `favourites/`

| React need   | Method | Endpoint           | Body       |
|--------------|--------|--------------------|------------|
| List         | GET    | `favourites/`      | —          |
| Add          | POST   | `favourites/addFavourite` | `post_id` |
| Remove       | POST   | `favourites/deleteFavourite` | `favourite_id` |

---

## 6. Other

| React need       | Method | Endpoint                    | Auth |
|------------------|--------|-----------------------------|------|
| Contact form     | POST   | `contacts/addContact`       | No   |
| Blogs list       | GET    | `blogs/`                    | No   |
| Blog detail      | GET    | `blogs/detail`              | No   |
| Ads list         | GET    | `ads/`                      | No   |
| Other user profile | GET  | `getOtherUserProfile`       | No   (query: user id) |
| Statistics       | GET    | `getStatistics`             | No   |
| Chats            | GET    | `getChats`                  | Yes  |
| Chat by ID       | GET    | `getChatsByID`              | Yes  |
| Send chat        | POST   | `addChat`                   | Yes  |
| Notifications    | GET    | `notifications/`            | Yes  |
| Review           | POST   | `addReview`                 | Yes  |

---

## React ↔ Laravel mapping

| React page/feature   | Laravel APIs to use |
|----------------------|----------------------|
| Home (listings)      | `posts/getFeaturedPost`, `posts/getNewArrivalPost`, `posts/getPostsByCategory`, search/filters |
| Post detail          | `posts/detail` |
| Create ad            | `categories/`, `cities/`, `conditions/`, `itemTypes/`, `posts/addPost` |
| My ads               | `posts/myPosts`, `posts/updatePost`, `posts/deletePost` |
| Favorites            | `favourites/`, `favourites/addFavourite`, `favourites/deleteFavourite` |
| Feed                 | `feed/posts/getPostsWithoutToken` or `getPosts`, like, comments |
| Login / Sign up      | `customer/login`, `customer/register`, `customer/verify-otp`, etc. |
| My profile           | `customer/getProfile`, `customer/update-profile`, `customer/change-password` |
| Public profile       | `getOtherUserProfile` |
| Contact              | `contacts/addContact` |

---

## CORS

Ensure Laravel v2 allows the React origin. Check `config/cors.php` and `.env` (e.g. `FRONTEND_URL`). For local dev, allow `http://localhost:5173` (or your Vite port).
