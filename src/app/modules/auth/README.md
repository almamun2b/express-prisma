# 🔐 Authentication Module

The **Authentication Module** handles user identity, secure access control, registration with email OTP verification, dual-token JWT rotation, Redis-backed logout invalidation, and secure self-service password recovery workflows.

---

## 🏗️ Architecture & Security Concepts

### 1. Dual-Token Strategy

To balance user experience and security, this system utilizes two JSON Web Tokens (JWTs):

- **Access Token**: Short-lived (default: `15m`), transmitted in the `Authorization: Bearer <token>` header or via a secure, client-side readable `accessToken` cookie.
- **Refresh Token**: Long-lived (default: `7d`), stored in a secure, `HttpOnly`, `SameSite=Lax` cookie (`refreshToken`) that is inaccessible to client-side scripts, protecting it against Cross-Site Scripting (XSS) attacks.

### 2. Redis-Backed Token Blacklisting (JTI)

Upon user logout or token rotation (refresh):

- The token's unique ID (`jti` claim) is extracted.
- The token is hashed using SHA-256 and cached in Redis.
- The Redis key is configured with a Time-To-Live (TTL) matching the exact remaining lifespan of the token.
- The `checkAuth` middleware queries Redis on every request; any blacklisted token is immediately rejected.

### 3. Cooldown & Anti-Spam Protection

To prevent Denial of Service (DoS) and SMTP resource abuse:

- **Email Verification Cooldown**: Resending verification codes is locked by a 60-second cooldown key stored in Redis.
- **Password Reset Cooldown**: Initiating a password reset generates a temporary cooldown key to prevent email flooding.

---

## 📡 API Reference

### 1. Register User

Creates a pending user account and sends a 6-digit OTP code to the email address.

- **Endpoint**: `POST /api/v1/auth/register`
- **Authentication**: None
- **Validation (Zod)**:
  - `firstName`: string (1-50 chars)
  - `lastName`: string (1-50 chars)
  - `email`: valid email format
  - `password`: minimum 8 characters, must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character.

**Request Body**:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Registration successful. Please verify your email."
}
```

> [!NOTE]
> If a user registration request is received for an email that is already registered but remains unverified, the system will regenerate and resend a new OTP instead of throwing a conflict error.

---

### 2. Resend Verification Code

Triggers a new OTP verification email, subject to rate limiting and cooldown constraints.

- **Endpoint**: `POST /api/v1/auth/resend-verification-code`
- **Authentication**: None

**Request Body**:

```json
{
  "email": "john.doe@example.com"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Verification code sent successfully."
}
```

---

### 3. Verify Email

Validates the OTP code received by the user and activates the account.

- **Endpoint**: `POST /api/v1/auth/verify-email`
- **Authentication**: None

**Request Body**:

```json
{
  "email": "john.doe@example.com",
  "code": "123456"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Email verified successfully."
}
```

---

### 4. Login User

Authenticates the user and sets HTTP-Only tokens.

- **Endpoint**: `POST /api/v1/auth/login`
- **Authentication**: None

**Request Body**:

```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "a9b8c7d6-e5f4-3210-abcd-ef0123456789",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "status": "ACTIVE"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsIn..."
  }
}
```

> [!IMPORTANT]
> The login response sets an `HttpOnly`, `Secure` (in production), and `SameSite=Lax` cookie named `refreshToken`. It also records the timestamp under `lastLoginAt`.

---

### 5. Refresh Access Token

Rotates the access token using the HttpOnly refresh token cookie.

- **Endpoint**: `POST /api/v1/auth/refresh-token`
- **Authentication**: None (Reads `refreshToken` cookie automatically)

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 6. Logout User

Revokes tokens by blacklisting them in the Redis store.

- **Endpoint**: `POST /api/v1/auth/logout`
- **Authentication**: Required (`Bearer <token>` or cookie)

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully."
}
```

---

### 7. Forgot Password

Sends a password reset link containing a secure recovery token to the registered email.

- **Endpoint**: `POST /api/v1/auth/forgot-password`
- **Authentication**: None

**Request Body**:

```json
{
  "email": "john.doe@example.com"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "If that email exists, a reset link has been sent."
}
```

> [!TIP]
> The response message is generic. This prevents user enumeration vulnerability (where attackers check if an email exists by analyzing API success/failure outputs).

---

### 8. Resend Forgot Password Email

Resends the recovery link after verifying the cooldown lock.

- **Endpoint**: `POST /api/v1/auth/resend-forgot-password`
- **Authentication**: None

**Request Body**:

```json
{
  "email": "john.doe@example.com"
}
```

---

### 9. Reset Password

Validates the reset token and updates the user's password.

- **Endpoint**: `POST /api/v1/auth/reset-password`
- **Authentication**: None

**Request Body**:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp...",
  "newPassword": "NewSecurePassword456!"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successfully."
}
```

---

## ❌ Error Codes & Responses

All validation and execution errors return standardized response payloads:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation error",
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "2026-06-21T16:43:00.000Z",
  "path": "/api/v1/auth/register",
  "errors": [
    {
      "field": "password",
      "message": "Password is too weak"
    }
  ]
}
```

### Common Authentication Error Codes

| Status Code | Error Code          | Description                                                         |
| ----------- | ------------------- | ------------------------------------------------------------------- |
| `400`       | `VALIDATION_ERROR`  | Request payload fails Zod validation constraints.                   |
| `401`       | `UNAUTHORIZED`      | Invalid credentials, expired token, or blacklisted token.           |
| `403`       | `FORBIDDEN`         | The account is deactivated, suspended, or banned.                   |
| `409`       | `CONFLICT`          | Registering an email that is already verified.                      |
| `429`       | `TOO_MANY_REQUESTS` | Cooldown period for OTP or password recovery email is still active. |
