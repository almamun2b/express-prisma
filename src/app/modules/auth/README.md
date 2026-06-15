# Authentication Module API Documentation

This module handles all user identity workflows: registration with email OTP verification, login, token refresh, logout with Redis-based blacklisting, and a complete password reset flow.

---

## Overview

| Feature                  | Path                                  | Auth Required |
| ------------------------ | ------------------------------------- | ------------- |
| Register                 | `POST /auth/register`                 | No            |
| Resend Verification Code | `POST /auth/resend-verification-code` | No            |
| Verify Email             | `POST /auth/verify-email`             | No            |
| Login                    | `POST /auth/login`                    | No            |
| Refresh Token            | `POST /auth/refresh-token`            | No (cookie)   |
| Logout                   | `POST /auth/logout`                   | Yes           |
| Forgot Password          | `POST /auth/forgot-password`          | No            |
| Resend Forgot Password   | `POST /auth/resend-forgot-password`   | No            |
| Reset Password           | `POST /auth/reset-password`           | No (token)    |

---

## Token Strategy

- **Access Token**: Short-lived JWT sent as `Authorization: Bearer <token>` header and/or `accessToken` cookie.
- **Refresh Token**: Longer-lived JWT stored in an `HttpOnly` cookie (`refreshToken`).
- **Blacklisting**: On logout or token refresh, the previous tokens are hashed (SHA-256) and stored in Redis with a TTL matching their remaining expiry. The `checkAuth` middleware rejects blacklisted tokens.
- **JTI**: Every token is assigned a unique `jti` (JWT ID) claim at issuance to enable per-token blacklisting.

---

## Endpoints

### 1. Register

Creates a new unverified user and sends a 6-digit OTP to the provided email.

- **Method**: `POST`
- **Path**: `/auth/register`
- **Content-Type**: `application/json`
- **Request Body**:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass1#"
}
```

- **Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Registration successful. Please verify your email."
}
```

> **Note**: If the email is already registered but unverified, a new OTP is sent. If already verified, a `409 Conflict` is returned.

---

### 2. Resend Verification Code

Resends the 6-digit OTP if the user has not yet verified their email.

- **Method**: `POST`
- **Path**: `/auth/resend-verification-code`
- **Request Body**:

```json
{ "email": "john@example.com" }
```

- **Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Verification code sent successfully."
}
```

> **Cooldown**: A per-email cooldown (Redis TTL) prevents OTP spam. On cooldown, returns `429 Too Many Requests` with seconds remaining.

---

### 3. Verify Email

Validates the OTP and activates the user account.

- **Method**: `POST`
- **Path**: `/auth/verify-email`
- **Request Body**:

```json
{
  "email": "john@example.com",
  "code": "942176"
}
```

- **Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully."
}
```

- On success, user `status` is set to `ACTIVE`, `isVerified` is set to `true`, and the OTP + cooldown keys are purged from Redis.

---

### 4. Login

Authenticates user credentials and issues access + refresh tokens.

- **Method**: `POST`
- **Path**: `/auth/login`
- **Request Body**:

```json
{
  "email": "john@example.com",
  "password": "SecurePass1#"
}
```

- **Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "e229e470-...",
      "email": "john@example.com",
      "role": "USER",
      "status": "ACTIVE"
    },
    "tokens": {
      "accessToken": "<jwt>",
      "refreshToken": "<jwt>"
    }
  }
}
```

- Tokens are also set as `HttpOnly` cookies (`accessToken`, `refreshToken`).
- Updates `lastLoginAt` on the user record.
- Returns `401 Unauthorized` for invalid credentials, `403 Forbidden` for inactive/banned/deleted accounts.

---

### 5. Refresh Token

Issues a new access + refresh token pair using the existing refresh token. Blacklists the previous pair.

- **Method**: `POST`
- **Path**: `/auth/refresh-token`
- **Auth**: Send `refreshToken` cookie (set automatically by login). No request body required.
- **Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully.",
  "data": {
    "tokens": {
      "accessToken": "<new-jwt>",
      "refreshToken": "<new-jwt>"
    }
  }
}
```

---

### 6. Logout

Blacklists the current access and refresh tokens in Redis and clears auth cookies.

- **Method**: `POST`
- **Path**: `/auth/logout`
- **Auth Required**: Yes (`Authorization: Bearer <token>` or cookie)
- **Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully."
}
```

---

### 7. Forgot Password

Sends a password reset link to the user's email. The link contains a short-lived JWT reset token.

- **Method**: `POST`
- **Path**: `/auth/forgot-password`
- **Request Body**:

```json
{ "email": "john@example.com" }
```

- **Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "If that email exists, a reset link has been sent."
}
```

> **Security**: Always returns `200` regardless of whether the email exists (prevents enumeration). A per-email cooldown prevents abuse.

---

### 8. Resend Forgot Password Email

Re-sends the password reset email if the cooldown has expired.

- **Method**: `POST`
- **Path**: `/auth/resend-forgot-password`
- **Request Body**:

```json
{ "email": "john@example.com" }
```

- Same response shape and cooldown behaviour as Forgot Password.

---

### 9. Reset Password

Validates the reset token and updates the user's password. Blacklists the token after use.

- **Method**: `POST`
- **Path**: `/auth/reset-password`
- **Request Body**:

```json
{
  "token": "<reset-jwt-from-email-link>",
  "newPassword": "NewSecurePass2#"
}
```

- **Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully."
}
```

- Returns `400 Bad Request` if token is invalid, expired, or already used.

---

## Error Responses

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid credentials.",
  "errorCode": "UNAUTHORIZED",
  "timestamp": "2026-06-12T14:32:00.000Z",
  "path": "/auth/login"
}
```

| Status | Scenario                                                |
| ------ | ------------------------------------------------------- |
| `400`  | Validation error, invalid/expired OTP or reset token    |
| `401`  | Wrong password or missing/invalid access token          |
| `403`  | Account inactive, suspended, banned, or deleted         |
| `404`  | User not found (e.g. resend OTP for non-existent email) |
| `409`  | Email already registered and verified                   |
| `429`  | OTP or forgot-password resend cooldown active           |
