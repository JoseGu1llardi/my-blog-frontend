# my-blog — Front-end Development Guide

This document contains all the information needed to build the front-end that consumes this API.
It is intended to be copied (or symlinked) into the root of the separate front-end project.

---

## Backend overview

- **Stack:** Java 17 + Spring Boot 3 + Spring Security + JWT
- **Default port:** `8080`
- **API prefix:** `/api/v1`
- **Auth mechanism:** Stateless JWT (Bearer token in `Authorization` header)
- **CORS allowed origin:** `http://localhost:3000` — run the front-end dev server on port 3000

---

## Running the backend locally

```bash
# copy .env.example → .env and fill in the required vars, then:
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

Swagger UI (dev profile only): `http://localhost:8080/swagger-ui/index.html`

---

## Authentication

### Flow

1. `POST /api/v1/auth/login` → receive `{ token, username, fullName }`
2. Store the token (e.g. `localStorage` or an in-memory store)
3. Send it on every protected request: `Authorization: Bearer <token>`
4. `POST /api/v1/auth/logout` (with the token) → invalidates it server-side
5. On 401, clear the token and redirect to `/login`

### Token details

- **Expiration:** 1 hour (3 600 000 ms)
- **Invalidation:** The server increments a `tokenVersion` on logout; old tokens are rejected even before they expire.
- There is **no refresh token** — after expiry the user must log in again.

### Login rate limiting

`POST /api/v1/auth/login` is rate-limited per IP. On `429 Too Many Requests`, show a "Too many attempts, try again later" message and disable the form temporarily.

---

## Response envelope

Every successful response is wrapped in `ApiResponse<T>`:

```ts
interface ApiResponse<T> {
  success: boolean;
  message?: string;       // present on create/update actions or errors
  data: T;
  timestamp: string;      // ISO-8601 LocalDateTime
}
```

Paginated responses use `PageResponse<T>` as the `data` value:

```ts
interface PageResponse<T> {
  content: T[];
  page: number;           // 0-based
  size: number;
  totalElements: number;  // items on this page (not the grand total — see note)
  totalPages: number;
  first: boolean;
  last: boolean;
}
```

> **Note:** `totalElements` in `PageResponse` maps to Spring's `Page.getNumberOfElements()`,
> which is the count of items on the current page, not the grand total across all pages.
> Use `totalPages` to determine whether there are more pages.

---

## Error response

All errors return an `ErrorResponse` (not wrapped in `ApiResponse`):

```ts
interface ErrorResponse {
  status: number;
  error: string;          // one of the ApiErrorType values below
  message: string;
  path: string;
  timestamp: string;
  errors?: FieldError[];  // only present on validation errors (400)
}

interface FieldError {
  field: string;
  message: string;
}
```

### Error types (`error` field values)

| Value | HTTP status | When |
|-------|-------------|------|
| `RESOURCE_NOT_FOUND` | 404 | Entity not found by id/slug |
| `VALIDATION_ERROR` | 400 | Bean validation failed — check `errors[]` |
| `INVALID_EMAIL` | 400 | Malformed email |
| `INVALID_SLUG` | 400 | Malformed slug |
| `DUPLICATED_RESOURCE` | 409 | Slug or name already exists |
| `STATE_CONFLICT` | 409 | Invalid post state transition |
| `UNAUTHORIZED` | 401 | Bad credentials / missing token |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many login attempts |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### Unauthenticated access to a protected route

Returns a raw JSON (not `ErrorResponse` shape) with status 401:

```json
{ "status": 401, "error": "UNAUTHORIZED", "message": "Authentication required" }
```

---

## TypeScript types

Paste these into `src/types/` and import as needed.

### `src/types/api.ts`

```ts
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ErrorResponse {
  status: number;
  error: string;
  message: string;
  path: string;
  timestamp: string;
  errors?: FieldError[];
}

export interface FieldError {
  field: string;
  message: string;
}
```

### `src/types/auth.ts`

```ts
export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  fullName: string;
}
```

### `src/types/author.ts`

```ts
export interface AuthorSummaryResponse {
  id: number;
  fullName: string;
  slug: string;
  avatarUrl: string;
}

export interface AuthorResponse {
  username: string;
  fullName: string;
  slug: string;
  bio: string;
  avatarUrl: string;
  website: string;
  github: string;
  x: string;
  linkedin: string;
  postCount: number;
}
```

### `src/types/category.ts`

```ts
export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon: string;           // emoji or icon identifier, max 50 chars
  postCount: number;
}

export interface CategoryCreateRequest {
  name: string;           // required, max 100 chars
  slug?: string;          // auto-generated if omitted
  description?: string;   // max 1000 chars
  icon?: string;          // max 50 chars
}
```

### `src/types/post.ts`

```ts
import type { AuthorSummaryResponse } from './author';
import type { CategoryResponse } from './category';

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'ARCHIVED';

export interface PostSummaryResponse {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  featuredImage: string;
  publishedAt: string;        // ISO-8601 LocalDateTime
  readingTimeMinutes: number;
  author: AuthorSummaryResponse;
}

export interface PostResponse {
  id: number;
  slug: string;
  title: string;
  content: string;            // HTML or Markdown — render accordingly
  excerpt: string;
  featuredImage: string;
  status: PostStatus;
  publishedAt: string;
  viewCount: number;
  readingTimeMinutes: number;
  author: AuthorSummaryResponse;
  categories: CategoryResponse[];
  metaDescription: string;
  metaKeywords: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostCreateRequest {
  title: string;              // required, max 500 chars
  slug?: string;              // auto-generated from title if omitted
  content: string;            // required
  excerpt?: string;           // max 1000 chars
  featuredImage?: string;
  status?: PostStatus;        // defaults to 'DRAFT'
  categoryIds?: number[];
  metaDescription?: string;   // max 500 chars
  metaKeywords?: string;      // max 500 chars
}

export interface PostUpdateRequest {
  title: string;              // required, max 500 chars
  slug?: string;
  content: string;            // required
  excerpt?: string;           // max 1000 chars
  featuredImage?: string;
  categoryIds?: number[];
  metaDescription?: string;
  metaKeywords?: string;
}
```

---

## API endpoints

### Auth — `/api/v1/auth`

#### `POST /api/v1/auth/login`
Public. Rate-limited per IP.

**Request body:**
```json
{ "username": "string", "password": "string" }
```

**Response `200`:** `ApiResponse<AuthResponse>`

---

#### `POST /api/v1/auth/logout`
Requires authentication. Returns `204 No Content`.

---

### Posts — `/api/v1/posts`

All `GET` routes are public. Write routes require a Bearer token.

#### `GET /api/v1/posts`
List all published posts (paginated, default page size 10).

**Query params:** `page` (0-based), `size`, `sort`

**Response `200`:** `ApiResponse<PageResponse<PostSummaryResponse>>`

---

#### `GET /api/v1/posts/{slug}`
Get a single published post by slug. **Side-effect:** increments view count (rate-limited by IP to avoid abuse).

**Response `200`:** `ApiResponse<PostResponse>`
**Response `404`:** `ErrorResponse` — post not found

---

#### `GET /api/v1/posts/search?query={query}`
Full-text search across published posts (paginated, default page size 10).

**Constraints:** `query` must be 1–200 characters.

**Response `200`:** `ApiResponse<PageResponse<PostSummaryResponse>>`
**Response `400`:** `ErrorResponse` — query out of range

---

#### `GET /api/v1/posts/years`
Returns the list of years that have at least one published post. Use this to build an archive sidebar.

**Response `200`:** `ApiResponse<number[]>`

---

#### `GET /api/v1/posts/year/{year}`
All published posts for a given year (not paginated).

**Response `200`:** `ApiResponse<PostSummaryResponse[]>`

---

#### `GET /api/v1/posts/category/{slug}`
Published posts for a category (paginated, default page size 10).

**Response `200`:** `ApiResponse<PageResponse<PostSummaryResponse>>`
**Response `404`:** `ErrorResponse` — category not found

---

#### `GET /api/v1/posts/author/{slug}`
Published posts for an author (paginated, default page size 10, sorted by `publishedAt`).

**Response `200`:** `ApiResponse<PageResponse<PostSummaryResponse>>`
**Response `404`:** `ErrorResponse` — author not found

---

#### `POST /api/v1/posts`
Create a post. Requires authentication. The post belongs to the authenticated author.

**Request body:** `PostCreateRequest`

**Response `201`:** `ApiResponse<PostResponse>`
Location header: `/api/v1/posts/{slug}`

**Response `400`:** `ErrorResponse` with `errors[]` for validation failures
**Response `409`:** `ErrorResponse` — slug already exists (`DUPLICATED_RESOURCE`)

---

#### `PUT /api/v1/posts/{id}`
Update a post. Requires authentication. Only the post's own author can update it.

**Request body:** `PostUpdateRequest`

**Response `200`:** `ApiResponse<PostResponse>`
**Response `403/404`:** author mismatch or post not found

---

#### `PATCH /api/v1/posts/{id}/publish`
Publish a draft post. Requires authentication. Only the post's own author can publish it.

**Response `204`:** No Content
**Response `409`:** `ErrorResponse` — post is already published (`STATE_CONFLICT`)

---

#### `PATCH /api/v1/posts/{id}/unpublish`
Revert a published post to draft. Requires authentication. Only the post's own author.

**Response `204`:** No Content
**Response `409`:** `ErrorResponse` — post is already a draft (`STATE_CONFLICT`)

---

#### `DELETE /api/v1/posts/{id}`
Delete a post. Requires authentication. Only the post's own author.

**Response `204`:** No Content

---

### Categories — `/api/v1/categories`

All `GET` routes are public. `POST` requires authentication **and** the `ADMIN` role.

#### `GET /api/v1/categories`
All categories (including empty ones).

**Response `200`:** `ApiResponse<CategoryResponse[]>`

---

#### `GET /api/v1/categories/with-posts`
Only categories that have at least one published post. Useful for nav/sidebar.

**Response `200`:** `ApiResponse<CategoryResponse[]>`

---

#### `GET /api/v1/categories/{slug}`
Single category by slug.

**Response `200`:** `ApiResponse<CategoryResponse>`
**Response `404`:** `ErrorResponse`

---

#### `POST /api/v1/categories`
Create a category. Requires authentication + `ADMIN` role.

**Request body:** `CategoryCreateRequest`

**Response `201`:** `ApiResponse<CategoryResponse>`
Location header: `/api/v1/categories/{id}`

**Response `400`:** `ErrorResponse` with `errors[]`
**Response `409`:** `ErrorResponse` — name or slug already exists

---

### Authors — `/api/v1/authors`

All routes are public.

#### `GET /api/v1/authors`
All active authors.

**Response `200`:** `ApiResponse<AuthorSummaryResponse[]>`

---

#### `GET /api/v1/authors/with-posts`
Only authors that have at least one published post.

**Response `200`:** `ApiResponse<AuthorSummaryResponse[]>`

---

#### `GET /api/v1/authors/{slug}`
Full author profile by slug.

**Response `200`:** `ApiResponse<AuthorResponse>`
**Response `404`:** `ErrorResponse`

---

## Suggested project structure

```
src/
├── api/
│   ├── client.ts          # axios/fetch instance — attaches Bearer token, handles 401
│   ├── auth.ts            # login(), logout()
│   ├── posts.ts           # getPosts(), getPost(), searchPosts(), createPost(), …
│   ├── categories.ts      # getCategories(), getCategoriesWithPosts(), createCategory()
│   └── authors.ts         # getAuthors(), getAuthor()
│
├── types/
│   ├── api.ts
│   ├── auth.ts
│   ├── post.ts
│   ├── category.ts
│   └── author.ts
│
├── context/
│   └── AuthContext.tsx    # stores token + user info; exposes login/logout helpers
│
├── hooks/
│   ├── useAuth.ts
│   ├── usePosts.ts        # wraps paginated post fetching
│   ├── usePost.ts
│   ├── useCategories.ts
│   └── useAuthors.ts
│
├── pages/
│   ├── Home.tsx           # paginated post list
│   ├── PostDetail.tsx     # /posts/:slug
│   ├── CategoryPage.tsx   # /categories/:slug
│   ├── AuthorPage.tsx     # /authors/:slug
│   ├── SearchPage.tsx     # /search?query=
│   ├── ArchivePage.tsx    # /archive/:year
│   ├── LoginPage.tsx
│   └── admin/             # protected — redirect to /login if no token
│       ├── Dashboard.tsx
│       ├── CreatePost.tsx
│       └── EditPost.tsx
│
└── components/
    ├── PostCard.tsx        # renders PostSummaryResponse
    ├── Pagination.tsx      # driven by PageResponse metadata
    ├── CategoryList.tsx
    ├── AuthorCard.tsx
    └── ProtectedRoute.tsx  # checks auth before rendering children
```

---

## Pagination conventions

The API uses 0-based page indexes. Default page size is 10 for all paginated endpoints.

Send page params as query strings:
```
GET /api/v1/posts?page=0&size=10
GET /api/v1/posts?page=1&size=10
```

Use `PageResponse.first` / `PageResponse.last` to disable prev/next buttons.
Use `PageResponse.totalPages` to render a page number list.

---

## Behavioral notes

- **View count:** `GET /api/v1/posts/{slug}` increments the post's view counter. It is rate-limited per IP so refreshing the page does not inflate the count. No action needed on the front-end.
- **Slug generation:** Both posts and categories auto-generate a slug from the title/name if you omit the `slug` field on create. You can pass a custom slug but it must be unique; a 409 is returned otherwise.
- **Post status lifecycle:** `DRAFT` → publish (`PATCH /publish`) → `PUBLISHED` → unpublish (`PATCH /unpublish`) → `DRAFT`. Attempting to publish an already-published post, or unpublish a draft, returns 409 `STATE_CONFLICT`.
- **Dates:** All `LocalDateTime` fields are serialised as ISO-8601 strings without a timezone offset (e.g. `"2025-10-01T14:30:00"`). Treat them as the server's local time (UTC in production).
- **`featuredImage`:** Stored as a URL string. The backend does not handle file uploads — store the image elsewhere and pass the URL.
- **`content` field:** The API stores and returns the content as-is (plain string). If you write Markdown, render it client-side. If you write HTML, sanitise before rendering.
