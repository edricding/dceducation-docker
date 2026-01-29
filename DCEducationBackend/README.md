# DCEducation Backend API (Current Endpoints)

> Updated: 2026-01-29
> Source: `backend/internal/server/router.go` + module handler/dto files.

---

## 1. Basics

### 1.1 Base URLs

- Direct (Go service): `http://127.0.0.1:8080`
- Nginx proxy (per your deployment): `http(s)://<your-domain>/api/...`
  - Example: `/api/health` proxies to Go `/health`

### 1.2 Unified Response Format (Most Endpoints)

All business APIs except `/health` use a unified wrapper:

```json
{
  "code": 0,
  "message": "ok",
  "data": {}
}
```

- `code = 0`: success
- `code = 400/401/403/404/423/500...`: error (`message` explains)

---

## 2. Health

### GET `/health`

**Description**: Service health check (no unified wrapper)

**Request params**: none

**Response example**:

```json
{"status":"ok"}
```

---

## 3. Universities

Prefix: `/api/v1/universities`

### 3.1 GET `/api/v1/universities`

**Description**: Paged university list, filter by country code and keyword.

**Query params**

- `country_code` *(string, optional)*: e.g. `US`
- `q` *(string, optional)*: keyword
- `page` *(int, optional, default 1)*
- `size` *(int, optional, default 20)*

**Response data**: `PagedResult<UniversityListItemDTO>`

`items[]` fields:

- `id` *(uint64)*
- `country_code` *(string)*
- `country` *(string)*
- `name_en` *(string)*
- `name_en_short` *(string)*
- `name_cn` *(string)*

---

### 3.2 POST `/api/v1/universities/search`

**Description**: Paged search via POST.

**Body (JSON)**

- `country_code` *(string, optional)*
- `q` *(string, optional)*
- `page` *(int, optional, default 1)*
- `size` *(int, optional, default 20)*

**Response**: same as GET `/api/v1/universities`

---

### 3.3 GET `/api/v1/universities/:id`

**Description**: University detail by ID.

**Path params**

- `id` *(uint64, required)*

**Response data**

- `id` *(uint64)*
- `country_code` *(string)*
- `country` *(string)*
- `name_en` *(string)*
- `name_en_short` *(string)*
- `name_cn` *(string)*
- `domains_json` *(string, JSON string)*

---

### 3.4 GET `/api/v1/universities/u-name-cn`

**Description**: Returns all university Chinese names.

**Response data**: `string[]`

---

### 3.5 GET `/api/v1/universities/options-u-name-cn`

**Description**: University options (Chinese names), paged + fuzzy search.

**Query params**

- `q` *(string, optional)*: keyword
- `country_id` *(uint64, optional)*: filter by country ID
- `page` *(int, optional, default 1)*
- `size` *(int, optional, default 20)*

**Response data**: `PagedResult<UniversityOptionCNDTO>`

`items[]` fields:

- `id` *(uint64)*
- `name_cn` *(string)*

---

## 4. Countries

Prefix: `/api/v1/countries`

### 4.1 GET `/api/v1/countries/options`

**Description**: Country options, paged + fuzzy search.

**Query params**

- `q` *(string, optional)*
- `page` *(int, optional, default 1)*
- `size` *(int, optional, default 20)*

**Response data**: `PagedResult<CountryOptionDTO>`

`items[]` fields:

- `id` *(uint64)*
- `name_cn` *(string)*
- `iso2` *(string, optional)*

---

## 5. Programs

Prefix: `/api/v1/programs`

### 5.1 POST `/api/v1/programs/search`

**Description**: Search programs/majors by universities and degree level (paged).

**Body (JSON)**

- `university_ids` *(uint64[], optional)*
- `degree_level` *(string, optional, default "all")*: one of `all`, `bachelor`, `master`
- `q` *(string, optional)*
- `page` *(int, optional, default 1)*
- `size` *(int, optional, default 20)*

**Response data**: `PagedResult<ProgramSearchItemDTO>`

`items[]` fields:

- `match_view` *(object)*
  - `program_id` *(uint64)*
  - `university_id` *(uint64)*
  - `country_code` *(string)*
  - `country` *(string)*
  - `university_name_en` *(string)*
  - `university_name_cn` *(string)*
  - `major_name_en` *(string)*
  - `major_name_cn` *(string)*
  - `degree_level` *(string)*
  - `tier` *(string)*
  - `is_active` *(bool)*
  - `program_tags_set_or_not` *(bool)*
  - `weights_json` *(object)*
    - `academics` *(number | null)*
    - `language` *(number | null)*
    - `curriculum` *(number | null)*
    - `profile` *(number | null)*
  - `requirements_json` *(object)*
    - `gpaMin` *(number | null)*
    - `ieltsOverallMin` *(number | null)*
    - `ieltsEachMin` *(number | null)*
    - `toeflMin` *(number | null)*
    - `pteMin` *(number | null)*
    - `duolingoMin` *(number | null)*

---

## 6. Users

Route: `POST /api/v1/users`

### 6.1 POST `/api/v1/users`

**Description**: Create user.

**Body (JSON)**

- `username` *(string, required, 3-50)*
- `email` *(string, required, email format)*
- `password` *(string, required, 8-72)*
- `role` *(string, optional)*
- `permission_level` *(int, optional)*

**Response data**

- `id` *(uint64)*
- `username` *(string)*
- `email` *(string)*
- `role` *(string)*
- `permission_level` *(int)*
- `status` *(string)*
- `created_at` *(time string)*

---

## 7. Auth

Prefix: `/api/v1/auth`

### 7.1 POST `/api/v1/auth/login`

**Description**: Login using username or email as `identifier`.

**Body (JSON)**

- `identifier` *(string, required)*
- `password` *(string, required)*

**Response data**

- `token` *(string)*
- `expires_at` *(time string)*
- `user` *(object)*
  - `id` *(uint64)*
  - `username` *(string)*
  - `email` *(string)*
  - `role` *(string)*
  - `permission_level` *(int)*

---

### 7.2 GET `/api/v1/auth/me`

**Description**: Get current user (requires bearer token).

**Header**

- `Authorization: Bearer <TOKEN>` *(required)*

**Response data**

- `id` *(uint64)*
- `username` *(string)*
- `role` *(string)*
- `permission_level` *(int)*

---

## 8. Common Status Codes

- `200`: success (`code=0`)
- `400`: bad request / validation error
- `401`: unauthorized / invalid token
- `403`: forbidden / inactive account
- `404`: not found
- `423`: account locked
- `500`: server error
