# User Module API Documentation

This module manages user profiles, avatars, passwords, statuses, roles, and administrative lifecycle workflows. It incorporates advanced searching, filtering, range queries, sorting, pagination, and file uploads (Cloudinary).

---

## Roles & Access Control

| Role          | Description                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------- |
| `USER`        | Access to own profile, avatar management, and password change only.                          |
| `ADMIN`       | All USER permissions + list/search users, update status, deactivate/reactivate, soft delete. |
| `SUPER_ADMIN` | All ADMIN permissions + update roles, hard delete, and manual user creation.                 |

### Endpoint Permission Matrix

| Action                  | Method   | Path                        | Roles                          |
| ----------------------- | -------- | --------------------------- | ------------------------------ |
| Create user manually    | `POST`   | `/users`                    | `ADMIN`, `SUPER_ADMIN`         |
| List all users          | `GET`    | `/users`                    | `ADMIN`, `SUPER_ADMIN`         |
| Get own profile         | `GET`    | `/users/me`                 | `USER`, `ADMIN`, `SUPER_ADMIN` |
| Update own profile      | `PATCH`  | `/users/me/profile`         | `USER`, `ADMIN`, `SUPER_ADMIN` |
| Upload / replace avatar | `PATCH`  | `/users/me/avatar`          | `USER`, `ADMIN`, `SUPER_ADMIN` |
| Delete own avatar       | `DELETE` | `/users/me/avatar`          | `USER`, `ADMIN`, `SUPER_ADMIN` |
| Change own password     | `PATCH`  | `/users/me/change-password` | `USER`, `ADMIN`, `SUPER_ADMIN` |
| Get user by ID          | `GET`    | `/users/:id`                | `ADMIN`, `SUPER_ADMIN`         |
| Update user status      | `PATCH`  | `/users/:id/status`         | `ADMIN`, `SUPER_ADMIN`         |
| Update user role        | `PATCH`  | `/users/:id/role`           | `SUPER_ADMIN`                  |
| Deactivate user         | `PATCH`  | `/users/:id/deactivate`     | `ADMIN`, `SUPER_ADMIN`         |
| Reactivate user         | `PATCH`  | `/users/:id/reactivate`     | `ADMIN`, `SUPER_ADMIN`         |
| Soft delete user        | `DELETE` | `/users/:id`                | `ADMIN`, `SUPER_ADMIN`         |
| Hard delete user        | `DELETE` | `/users/:id/hard`           | `SUPER_ADMIN`                  |

---

## API Endpoints Reference

### 1. Create User (Admin / Super Admin)

- **Method**: `POST`
- **Path**: `/users`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "email": "jane@example.com",
  "password": "SecurePass1#",
  "username": "janedoe",
  "role": "USER",
  "status": "ACTIVE",
  "firstName": "Jane",
  "lastName": "Doe",
  "gender": "FEMALE",
  "phone": "+1234567890"
}
```

- **Response (201 Created)**: Returns the newly created user object (same shape as profile response).
- **Notes**: Defaults `role` to `USER` and `status` to `ACTIVE`. User is pre-verified (`isVerified: true`). A `CREDENTIAL` auth provider is seeded automatically.

---

### 2. List All Users (Admin / Super Admin)

- **Method**: `GET`
- **Path**: `/users`
- **Query Parameters**:

| Param             | Type    | Description                                                                 |
| ----------------- | ------- | --------------------------------------------------------------------------- |
| `page`            | integer | Page number (default: `1`)                                                  |
| `limit`           | integer | Records per page (default: `10`)                                            |
| `sortBy`          | string  | Field name to sort by (default: `createdAt`)                                |
| `sortOrder`       | enum    | `asc` \| `desc` (default: `desc`)                                           |
| `searchTerm`      | string  | Matches `email`, `username`, `firstName`, `lastName`, `phone`               |
| `role`            | enum    | `USER` \| `ADMIN` \| `SUPER_ADMIN`                                          |
| `status`          | enum    | `PENDING` \| `ACTIVE` \| `INACTIVE` \| `SUSPENDED` \| `BANNED` \| `DELETED` |
| `isVerified`      | boolean | `true` \| `false`                                                           |
| `gender`          | enum    | `MALE` \| `FEMALE` \| `OTHER` \| `PREFER_NOT_TO_SAY`                        |
| `createdAtFrom`   | string  | ISO datetime or date (range start)                                          |
| `createdAtTo`     | string  | ISO datetime or date (range end)                                            |
| `lastLoginAtFrom` | string  | ISO datetime or date (range start)                                          |
| `lastLoginAtTo`   | string  | ISO datetime or date (range end)                                            |
| `dateOfBirthFrom` | string  | ISO datetime or date (range start)                                          |
| `dateOfBirthTo`   | string  | ISO datetime or date (range end)                                            |
| `avatarSizeMin`   | number  | Minimum avatar size in bytes                                                |
| `avatarSizeMax`   | number  | Maximum avatar size in bytes                                                |

- **Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users fetched successfully",
  "meta": { "page": 1, "limit": 10, "total": 42, "totalPage": 5 },
  "data": [{ "id": "...", "email": "..." }]
}
```

---

### 3. Get Own Profile

- **Method**: `GET`
- **Path**: `/users/me`
- **Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User profile fetched successfully",
  "data": {
    "id": "e229e470-...",
    "email": "john@example.com",
    "username": "johndoe",
    "role": "USER",
    "status": "ACTIVE",
    "isVerified": true,
    "firstName": "John",
    "lastName": "Doe",
    "gender": "MALE",
    "phone": "+1234567890",
    "bio": "Software Engineer",
    "address": "Silicon Valley",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "timezone": "UTC",
    "locale": "en",
    "lastLoginAt": "2026-06-12T14:28:24.000Z",
    "deletedAt": null,
    "createdAt": "2026-06-12T14:28:24.000Z",
    "updatedAt": "2026-06-12T14:28:24.000Z",
    "avatar": {
      "id": "a1b2c3d4-...",
      "url": "https://res.cloudinary.com/demo/image/upload/v1234/avatar.png",
      "width": 500,
      "height": 500,
      "size": 15420,
      "createdAt": "2026-06-12T14:28:24.000Z",
      "updatedAt": "2026-06-12T14:28:24.000Z"
    }
  }
}
```

---

### 4. Update Own Profile (text data only)

- **Method**: `PATCH`
- **Path**: `/users/me/profile`
- **Content-Type**: `application/json`
- **Request Body** (all fields optional / nullable):

```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "phone": "+1234567890",
  "gender": "FEMALE",
  "bio": "Full Stack Engineer",
  "address": "New York",
  "dateOfBirth": "1992-08-15",
  "timezone": "America/New_York",
  "locale": "en-US"
}
```

- **Response (200 OK)**: Returns updated user profile.

---

### 5. Upload / Replace Own Avatar

- **Method**: `PATCH`
- **Path**: `/users/me/avatar`
- **Content-Type**: `multipart/form-data`
- **Form Field**: `avatar` — image file (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`)
- **Notes**: Replaces the existing avatar automatically (deletes old from Cloudinary + DB).
- **Response (200 OK)**: Returns updated user profile with new avatar URL.

---

### 6. Delete Own Avatar

- **Method**: `DELETE`
- **Path**: `/users/me/avatar`
- **Notes**: Deletes file from Cloudinary and removes avatar record from DB.
- **Response (200 OK)**: Returns user profile with `avatar: null`.

---

### 7. Change Own Password

- **Method**: `PATCH`
- **Path**: `/users/me/change-password`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "oldPassword": "CurrentPass1#",
  "newPassword": "NewSecurePass2#"
}
```

- **Validation Rules**:
  - `oldPassword` must match the current stored hash.
  - `newPassword` must be at least 8 characters.
  - `newPassword` cannot be the same as `oldPassword`.
- **Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password changed successfully",
  "data": null
}
```

---

### 8. Get User by ID (Admin / Super Admin)

- **Method**: `GET`
- **Path**: `/users/:id`
- **Response (200 OK)**: Same shape as own-profile response.

---

### 9. Update User Status (Admin / Super Admin)

- **Method**: `PATCH`
- **Path**: `/users/:id/status`
- **Request Body**:

```json
{ "status": "SUSPENDED" }
```

- **Valid values**: `PENDING` | `ACTIVE` | `INACTIVE` | `SUSPENDED` | `BANNED` | `DELETED`

---

### 10. Update User Role (Super Admin only)

- **Method**: `PATCH`
- **Path**: `/users/:id/role`
- **Request Body**:

```json
{ "role": "ADMIN" }
```

- **Valid values**: `USER` | `ADMIN` | `SUPER_ADMIN`

---

### 11. Deactivate User (Admin / Super Admin)

- **Method**: `PATCH`
- **Path**: `/users/:id/deactivate`
- **Notes**: Sets user status to `INACTIVE`. No request body required.
- **Response (200 OK)**: Returns updated user with `status: "INACTIVE"`.

---

### 12. Reactivate User (Admin / Super Admin)

- **Method**: `PATCH`
- **Path**: `/users/:id/reactivate`
- **Notes**: Sets user status to `ACTIVE`. No request body required.
- **Response (200 OK)**: Returns updated user with `status: "ACTIVE"`.

---

### 13. Soft Delete User (Admin / Super Admin)

- **Method**: `DELETE`
- **Path**: `/users/:id`
- **Notes**: Sets `deletedAt` timestamp and changes status to `DELETED`. User is excluded from standard queries but record is preserved in DB.
- **Response (200 OK)**: Returns user with `deletedAt` populated.

---

### 14. Hard Delete User (Super Admin only)

- **Method**: `DELETE`
- **Path**: `/users/:id/hard`
- **Notes**: Fully purges the user record and all relations from the database. Avatar file is deleted from Cloudinary first.
- **Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User permanently deleted successfully",
  "data": null
}
```

---

## Error Responses

All errors follow the standard application error envelope:

```json
{
  "success": false,
  "statusCode": 404,
  "message": "User not found",
  "errorCode": "NOT_FOUND",
  "timestamp": "2026-06-12T14:32:00.000Z",
  "path": "/users/bad-id"
}
```

| Status | Scenario                                |
| ------ | --------------------------------------- |
| `400`  | Validation failure, same password reuse |
| `401`  | Unauthenticated or wrong old password   |
| `403`  | Insufficient role permissions           |
| `404`  | User not found                          |
| `409`  | Email or username already exists        |
