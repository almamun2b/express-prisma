# 👤 User Management Module

The **User Management Module** handles profile management, security adjustments, avatar media uploading via Cloudinary, and advanced administrative controls (such as filtering, sorting, role mapping, deactivation, and hard/soft deletion of user records).

---

## 🔐 Role-Based Access Control (RBAC)

The application enforces a tiered authorization hierarchy across all endpoints using the `checkAuth` middleware:

| Role          | Hierarchy Level | Capabilities & Access                                                                                                                         |
| ------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `USER`        | Level 1         | Access to their own profile, password changing, deactivation, and avatar management.                                                          |
| `ADMIN`       | Level 2         | All `USER` permissions, plus user search/filtering, retrieving profiles by ID, updating statuses, and soft-deleting users.                    |
| `SUPER_ADMIN` | Level 3         | Complete system control: all `ADMIN` permissions, plus manual user creation, role promotions/demotions, and permanent database hard-deletion. |

### Endpoint Permission Matrix

| Method   | Path                               | Description                                            | Access Requirement     |
| -------- | ---------------------------------- | ------------------------------------------------------ | ---------------------- |
| `POST`   | `/api/v1/users`                    | Manually seed/create a pre-verified user               | `ADMIN`, `SUPER_ADMIN` |
| `GET`    | `/api/v1/users`                    | List, search, filter, and paginate users               | `ADMIN`, `SUPER_ADMIN` |
| `GET`    | `/api/v1/users/me`                 | Fetch active user's own profile data                   | Any Authenticated User |
| `PATCH`  | `/api/v1/users/me`                 | Update text profile details (JSON format)              | Any Authenticated User |
| `PATCH`  | `/api/v1/users/me/profile`         | Update profile fields and/or upload avatar (Multipart) | Any Authenticated User |
| `PATCH`  | `/api/v1/users/me/avatar`          | Upload or replace user's profile avatar (Multipart)    | Any Authenticated User |
| `DELETE` | `/api/v1/users/me/avatar`          | Delete user's avatar image from database & Cloudinary  | Any Authenticated User |
| `PATCH`  | `/api/v1/users/me/change-password` | Update account password                                | Any Authenticated User |
| `PATCH`  | `/api/v1/users/me/deactivate`      | Deactivate account (sets status to `INACTIVE`)         | Any Authenticated User |
| `PATCH`  | `/api/v1/users/me/reactivate`      | Reactivate account (sets status to `ACTIVE`)           | Any Authenticated User |
| `GET`    | `/api/v1/users/:id`                | Fetch detailed user data by primary ID key             | `ADMIN`, `SUPER_ADMIN` |
| `PATCH`  | `/api/v1/users/:id/status`         | Adjust user status (e.g. suspend or ban)               | `ADMIN`, `SUPER_ADMIN` |
| `PATCH`  | `/api/v1/users/:id/role`           | Promote or demote user access tier                     | `SUPER_ADMIN`          |
| `DELETE` | `/api/v1/users/:id`                | Soft-delete user (sets `deletedAt` and status)         | `ADMIN`, `SUPER_ADMIN` |
| `DELETE` | `/api/v1/users/:id/hard`           | Permanently wipe user record from DB                   | `SUPER_ADMIN`          |

---

## 🔍 Filtering, Searching & Pagination

The `GET /api/v1/users` endpoint utilizes an advanced, type-safe `QueryBuilder` engine supporting dynamic query parameters:

### Core Pagination & Sorting

- `page`: Page index (default: `1`).
- `limit`: Items per response payload (default: `10`, max: `100`).
- `sortBy`: Database schema field key to sort by (default: `createdAt`).
- `sortOrder`: Sorting direction, either `asc` or `desc` (default: `desc`).

### Search Parameters

- `searchTerm`: Matches substrings in `email`, `username`, `firstName`, `lastName`, and `phone` using case-insensitive partial searches.

### Strict Equality Filters

- `role`: Filter by exact role value (`USER` \| `ADMIN` \| `SUPER_ADMIN`).
- `status`: Filter by status (`PENDING` \| `ACTIVE` \| `INACTIVE` \| `SUSPENDED` \| `BANNED` \| `DELETED`).
- `gender`: Filter by user gender (`MALE` \| `FEMALE` \| `OTHER` \| `PREFER_NOT_TO_SAY`).
- `isVerified`: Filter by boolean email verification status (`true` \| `false`).

### Range Filters

Query parameters support min/max range boundaries in format `<Param>From` and `<Param>To`:

- **Dates**: `createdAtFrom` / `createdAtTo`, `lastLoginAtFrom` / `lastLoginAtTo`, `dateOfBirthFrom` / `dateOfBirthTo` (Must match ISO 8601 strings, e.g. `2026-06-21`).
- **Avatar File Size**: `avatarSizeMin` / `avatarSizeMax` (Integer value matching bytes).

---

## 📡 API Endpoint Reference

### 1. Get Own Profile

Retrieves the logged-in user's profile and relational data.

- **Endpoint**: `GET /api/v1/users/me`
- **Headers**: `Authorization: Bearer <accessToken>`

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User profile fetched successfully",
  "data": {
    "id": "e229e470-8b1c-4bba-9b4b-ea0e12345678",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "role": "USER",
    "status": "ACTIVE",
    "isVerified": true,
    "firstName": "John",
    "lastName": "Doe",
    "gender": "MALE",
    "phone": "+1234567890",
    "bio": "Lead Software Engineer",
    "address": "San Francisco, CA",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "timezone": "America/Los_Angeles",
    "locale": "en-US",
    "lastLoginAt": "2026-06-21T10:00:00.000Z",
    "deletedAt": null,
    "createdAt": "2026-06-20T12:00:00.000Z",
    "updatedAt": "2026-06-21T10:00:00.000Z",
    "avatar": {
      "id": "d1e2f3a4-b5c6-7d8e-9f0a-1b2c3d4e5f6g",
      "url": "https://res.cloudinary.com/your-cloud-name/image/upload/v1234567890/avatars/user-avatar.png",
      "width": 400,
      "height": 400,
      "size": 25420,
      "createdAt": "2026-06-20T12:30:00.000Z",
      "updatedAt": "2026-06-20T12:30:00.000Z"
    }
  }
}
```

---

### 2. Update Own Profile (JSON)

Updates textual profile parameters. Nullable fields can be explicitly cleared.

- **Endpoint**: `PATCH /api/v1/users/me`
- **Headers**: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`

**Request Body**:

```json
{
  "firstName": "Jonathan",
  "bio": "Staff Engineer & Tech Lead",
  "address": "Seattle, WA",
  "dateOfBirth": "1989-11-23"
}
```

**Response (200 OK)**: Returns the updated user profile JSON object.

---

### 3. Upload / Replace Own Avatar

Uploads an image file to Cloudinary and registers it in the database.

- **Endpoint**: `PATCH /api/v1/users/me/avatar`
- **Headers**: `Authorization: Bearer <accessToken>`, `Content-Type: multipart/form-data`
- **Body Form-Data**:
  - `avatar`: `<Binary File>` (Supported types: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`)

> [!TIP]
> If the user has an existing avatar, the system automatically calls the Cloudinary SDK to destroy the old asset from their CDN storage and deletes the historical avatar entry from the database before completing the new upload.

---

### 4. Change Own Password

Updates user credentials with validation checks.

- **Endpoint**: `PATCH /api/v1/users/me/change-password`
- **Headers**: `Authorization: Bearer <accessToken>`, `Content-Type: application/json`

**Request Body**:

```json
{
  "oldPassword": "SecurePassword123!",
  "newPassword": "BrandNewSecurePassword456!"
}
```

**Validation Details**:

- `oldPassword` must match the stored password hash.
- `newPassword` must be a strong password.
- `newPassword` cannot be identical to the `oldPassword`.

---

### 5. Deactivate Account

Sets the active user's status to `INACTIVE`. Subsequent attempts to log in will be rejected until reactivated.

- **Endpoint**: `PATCH /api/v1/users/me/deactivate`
- **Headers**: `Authorization: Bearer <accessToken>`

---

## 🗑️ Deletion Mechanics (Soft vs Hard)

### Soft Delete (`DELETE /api/v1/users/:id`)

- Initiated by an `ADMIN` or `SUPER_ADMIN`.
- Sets the user's `deletedAt` field to the current timestamp.
- Updates the user's status to `DELETED`.
- Retains database records for auditing, but the user is excluded from normal queries and index views.

### Hard Delete (`DELETE /api/v1/users/:id/hard`)

- Restricted strictly to `SUPER_ADMIN`.
- Retrieves user relation keys.
- Deletes files associated with the user from Cloudinary's media servers.
- Executes cascade deletes to clean up auth records, avatars, tokens, and verification files.
- Permanently purges the user row from the database.
