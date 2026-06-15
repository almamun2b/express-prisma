# 🚀 Express Prisma Advanced Boilerplate

> **Production-Ready Express.js + Prisma + PostgreSQL Starter Template**
>
> A meticulously crafted, enterprise-grade boilerplate for building scalable, type-safe REST APIs with strict TypeScript, advanced querying, comprehensive error handling, and security-first architecture. Built for developers who demand excellence.

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Problems It Solves](#-problems-it-solves)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Database Management](#-database-management)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [API Documentation](#-api-documentation)
- [Authentication Module](#-authentication-module)
- [User Management Module](#-user-management-module)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Key Features

### 🏗️ **Core Architecture**

- **Strict Type Safety**: Full TypeScript strict mode with enforced type checking across the entire codebase
- **Advanced QueryBuilder**: Dynamic, type-safe query builder supporting filtering, searching, range queries, and cursor/offset pagination
- **Layered Architecture**: Clean separation of concerns (controllers, services, routes, middlewares, utilities)
- **Global Error Handling**: Unified middleware for operational vs. programming error classification with custom error codes
- **Request Validation**: Zod-based schema validation for type-safe request/response contracts
- **Modular Routing**: Feature-based module structure for maintainability and scalability

### 🔐 **Security & Authentication**

- **JWT-Based Authentication**: Dual token strategy (access token + refresh token) with HttpOnly cookies
- **Token Blacklisting**: Redis-backed token blacklist on logout/refresh with automatic TTL expiry
- **Secure Password Handling**: bcryptjs hashing with salt rounds configuration
- **CORS Configuration**: Granular CORS setup for origin control
- **Helmet Security Headers**: Industry-standard security headers middleware
- **Rate Limiting**: Request throttling to prevent abuse and DDoS attacks
- **Email OTP Verification**: Multi-step email verification with cooldown protection
- **Password Reset Flow**: Secure token-based password reset with expiration

### 🗄️ **Database & ORM**

- **Prisma ORM**: Type-safe database access with auto-generated client
- **PostgreSQL**: Robust, proven relational database backend
- **Migrations**: Version-controlled schema changes with rollback capability
- **Database Seeding**: Pre-populate environment with test data
- **Prisma Studio**: Visual database management tool

### ✅ **Quality & Developer Experience**

- **ESLint**: Strict linting with `@typescript-eslint/recommended-type-checked` and `stylistic-type-checked`
- **Prettier**: Automatic code formatting for consistency
- **TypeScript Compiler**: No-emit type checking with strict settings
- **Husky + Lint-Staged**: Pre-commit hooks for code quality assurance
- **Winston Logging**: Structured logging with daily rotating file appenders
- **Request Logging**: Comprehensive HTTP request/response logging middleware
- **REST Client Files**: Copy-pasteable `.http` files for API testing with VS Code REST Client extension

### 📦 **Additional Features**

- **File Uploads**: Cloudinary integration for image management
- **Email Services**: Multiple SMTP providers (Gmail, Brevo) support
- **Redis Caching**: Session management and token blacklisting
- **Role-Based Access Control**: USER, ADMIN, SUPER_ADMIN role hierarchy
- **User Status Management**: PENDING, ACTIVE, INACTIVE, SUSPENDED, BANNED statuses
- **Soft Delete Support**: Logical deletion preserving data integrity
- **Avatar Management**: User profile pictures with Cloudinary storage

---

## 🎯 Problems It Solves

| Problem                               | Solution                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------- |
| Type-unsafe query parameters and APIs | Strict TypeScript + Zod validation ensures compile-time and runtime safety |
| Unstructured error handling           | Centralized error middleware classifies operational vs. programming errors |
| Slow API pagination/filtering         | Advanced QueryBuilder with cursor and offset pagination, range filters     |
| Token security & revocation           | Redis-backed token blacklist with JTI-based per-token revocation           |
| Code inconsistency across teams       | ESLint + Prettier + Husky ensure uniform code style and quality            |
| Repeated boilerplate code             | Feature-based module scaffolding reduces duplicate code patterns           |
| Security vulnerabilities              | Helmet, CORS, rate limiting, bcrypt hashing, secure JWT workflows          |
| Limited visibility into requests      | Winston structured logging + request logger middleware                     |
| No clear API documentation            | Comprehensive `.http` test files and module-level READMEs                  |
| Database schema drift                 | Prisma migrations track all schema changes with version control            |

---

## 🛠️ Tech Stack

| Layer                  | Technology                 | Version     |
| ---------------------- | -------------------------- | ----------- |
| **Runtime**            | Node.js                    | v18+ / v20+ |
| **Language**           | TypeScript                 | ^6.0.3      |
| **Framework**          | Express.js                 | ^5.2.1      |
| **Database**           | PostgreSQL                 | Latest      |
| **ORM**                | Prisma                     | ^7.8.0      |
| **Authentication**     | JWT (jsonwebtoken)         | ^9.0.3      |
| **Password Hashing**   | bcryptjs                   | ^3.0.3      |
| **Validation**         | Zod                        | ^4.4.3      |
| **Caching / Sessions** | Redis                      | ^5.12.1     |
| **File Upload**        | Cloudinary                 | ^2.10.0     |
| **Email**              | Nodemailer                 | ^8.0.7      |
| **Security**           | Helmet, CORS, Rate Limiter | Latest      |
| **Logging**            | Winston                    | ^3.19.0     |
| **Linting**            | ESLint + TypeScript-ESLint | ^10.4.1     |
| **Code Formatting**    | Prettier                   | ^3.8.3      |
| **Dev Tools**          | tsx, Husky, Lint-Staged    | Latest      |

---

## 📋 Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v18 or v20+) — [Install here](https://nodejs.org/)
- **npm** or **pnpm** — Package manager (pnpm recommended for faster installs)
- **PostgreSQL** (v12+) — [Install here](https://www.postgresql.org/)
- **Git** — Version control
- **Redis** (optional, required for token blacklisting/caching) — [Install here](https://redis.io/)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/almamun2b/express-prisma.git
cd express-prisma
```

### 2. Install Dependencies

Using **pnpm** (recommended):

```bash
pnpm install
```

Or with **npm**:

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# ============================================
# Application Configuration
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# Database Configuration
# ============================================
DATABASE_URL=postgresql://postgres:password@localhost:5432/express_prisma_db

# ============================================
# JWT Configuration
# ============================================
JWT_ACCESS_SECRET=your_access_token_secret_key_here_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_token_secret_key_here_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# Redis Configuration (for token blacklisting & caching)
# ============================================
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# ============================================
# Email Configuration (SMTP)
# ============================================
# Gmail SMTP
SMTP_GMAIL_USER=your-email@gmail.com
SMTP_GMAIL_PASSWORD=your-app-specific-password

# Brevo SMTP
SMTP_BREVO_USER=your-email@example.com
SMTP_BREVO_PASSWORD=your-brevo-api-key

# Default email provider (gmail or brevo)
SMTP_PROVIDER=gmail

# ============================================
# Cloudinary Configuration (File Uploads)
# ============================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============================================
# CORS Configuration
# ============================================
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# ============================================
# Rate Limiter Configuration (requests per window)
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# Logging
# ============================================
LOG_LEVEL=info
```

**Note**: Replace placeholder values with your actual credentials. Keep `.env` in `.gitignore` and never commit secrets.

---

## 🗄️ Database Management

### Initialize the Database

#### Generate Prisma Client

```bash
pnpm db:generate
```

This generates the type-safe Prisma client from your schema.

#### Run Migrations

```bash
pnpm db:migrate
```

This creates the database schema by running pending migrations.

#### Optional: Seed the Database

```bash
pnpm db:seed
```

Populates the database with initial data (users, roles, etc.) for development.

#### View Database in Prisma Studio

```bash
pnpm db:studio
```

Opens a visual database management interface at `http://localhost:5555`.

#### Push Schema to Database (Development Only)

```bash
pnpm db:push
```

**Warning**: This overwrites the database schema without creating migration files. Use only in development.

---

## 📁 Project Structure

```
express-prisma-advanced-boilerplate/
├── prisma/
│   ├── schema.prisma              # Prisma ORM schema definition
│   ├── seed.ts                    # Database seeding script
│   └── migrations/                # Version-controlled schema migrations
│
├── src/
│   ├── server.ts                  # Express server entry point
│   ├── app.ts                     # Express app configuration
│   │
│   └── app/
│       ├── config/                # Configuration modules
│       │   ├── env.ts             # Environment variables with validation
│       │   ├── prisma.ts          # Prisma client singleton
│       │   ├── redis.ts           # Redis client configuration
│       │   ├── cloudinary.ts      # Cloudinary setup
│       │   ├── smtp.gmail.ts      # Gmail SMTP configuration
│       │   └── smtp.brevo.ts      # Brevo SMTP configuration
│       │
│       ├── constants/             # Application constants
│       │   ├── messages.constants.ts
│       │   ├── roles.constants.ts
│       │   └── permissions.constants.ts
│       │
│       ├── errors/                # Custom error handlers
│       │   ├── prismaClientKnownRequestError.errors.ts
│       │   ├── prismaValidationError.errors.ts
│       │   └── zodError.errors.ts
│       │
│       ├── middlewares/           # Express middlewares
│       │   ├── globalErrorHandler.ts  # Unified error handling
│       │   ├── checkAuth.ts           # JWT authentication
│       │   ├── validateRequest.ts     # Zod request validation
│       │   ├── requestLogger.ts       # HTTP request/response logging
│       │   ├── rateLimiter.ts         # Rate limiting
│       │   └── notFound.ts            # 404 handler
│       │
│       ├── modules/               # Feature-based modules
│       │   ├── auth/              # Authentication module
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── auth.route.ts
│       │   │   ├── auth.validation.ts
│       │   │   ├── auth.types.ts
│       │   │   ├── auth.constants.ts
│       │   │   ├── auth.utils.ts
│       │   │   └── README.md
│       │   │
│       │   └── user/              # User management module
│       │       ├── user.controller.ts
│       │       ├── user.service.ts
│       │       ├── user.route.ts
│       │       ├── user.validation.ts
│       │       ├── user.types.ts
│       │       ├── user.constants.ts
│       │       └── README.md
│       │
│       ├── routes/                # Route aggregation
│       │   ├── index.ts           # Main router
│       │   └── health.route.ts    # Health check endpoint
│       │
│       ├── types/                 # TypeScript type definitions
│       │   ├── env.types.ts
│       │   ├── errors.types.ts
│       │   ├── response.types.ts
│       │   ├── jwt.types.ts
│       │   ├── codes.types.ts
│       │   ├── fileUploads.types.ts
│       │   └── global.d.ts        # Global type augmentations
│       │
│       └── utils/                 # Utility functions & helpers
│           ├── appError.ts        # Custom error class
│           ├── catchAsync.ts      # Async error wrapper
│           ├── sendResponse.ts    # Standardized response formatter
│           ├── token.ts           # JWT generation & validation
│           ├── hash.ts            # Password hashing utilities
│           ├── logger.ts          # Winston logger setup
│           ├── redis.ts           # Redis operations
│           ├── fileUploader.ts    # Cloudinary upload handler
│           ├── emailTemplate.ts   # Email HTML templates
│           ├── httpStatus.ts      # HTTP status codes
│           ├── codes.ts           # Application error codes
│           ├── checkUserStatus.ts # User status validation
│           ├── parser.ts          # Query/body parsing utilities
│           ├── exclude.ts         # Object property exclusion
│           ├── pick.ts            # Object property picking
│           └── setCookie.ts       # Cookie management
│
├── generated/                     # Auto-generated Prisma types (do not edit)
├── logs/                          # Application logs (gitignored)
├── uploads/                       # Temporary file uploads
│
├── .env                           # Environment variables (gitignored)
├── .env.example                   # Environment template
├── .eslintrc.ts                   # ESLint configuration
├── .prettierrc                    # Prettier configuration
├── eslint.config.ts              # ESLint config (flat)
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Project dependencies
├── pnpm-lock.yaml               # Dependency lock file
├── api-doc.http                 # REST Client API documentation
├── README.md                    # This file
└── LICENSE                      # MIT License
```

---

## 📜 Available Scripts

| Script           | Command             | Description                                              |
| ---------------- | ------------------- | -------------------------------------------------------- |
| **Development**  | `pnpm dev`          | Start development server with hot reload using tsx watch |
| **Build**        | `pnpm build`        | Compile TypeScript to JavaScript in `dist/` folder       |
| **Production**   | `npm start`         | Run compiled server from `dist/src/server.js`            |
| **Lint**         | `pnpm lint`         | Run ESLint to check code quality                         |
| **Lint Fix**     | `pnpm lint:fix`     | Auto-fix ESLint violations                               |
| **Format**       | `pnpm format`       | Format code with Prettier                                |
| **Format Check** | `pnpm format:check` | Verify code formatting without changes                   |
| **Type Check**   | `pnpm typecheck`    | Run TypeScript compiler without emit                     |
| **Validate**     | `pnpm validate`     | Run lint + format check + type check                     |
| **DB Generate**  | `pnpm db:generate`  | Generate Prisma client from schema                       |
| **DB Migrate**   | `pnpm db:migrate`   | Run pending database migrations                          |
| **DB Seed**      | `pnpm db:seed`      | Populate database with seed data                         |
| **DB Push**      | `pnpm db:push`      | Push schema changes directly to database                 |
| **DB Pull**      | `pnpm db:pull`      | Introspect database and update schema                    |
| **DB Studio**    | `pnpm db:studio`    | Open Prisma Studio GUI                                   |

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Health Check

**Endpoint**: `GET /health`

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Server is running"
}
```

---

## 🔐 Authentication Module

**Module Path**: `src/app/modules/auth/`

This module handles all user identity workflows: registration with email OTP verification, login, token refresh, logout with Redis-based blacklisting, and a complete password reset flow.

### Overview

| Feature                  | Endpoint                              | Auth Required |
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

### Token Strategy

- **Access Token**: Short-lived JWT (15 minutes by default) sent as `Authorization: Bearer <token>` header and/or `accessToken` cookie.
- **Refresh Token**: Longer-lived JWT (7 days by default) stored in an `HttpOnly` cookie (`refreshToken`).
- **Blacklisting**: On logout or token refresh, the previous tokens are hashed (SHA-256) and stored in Redis with a TTL matching their remaining expiry. The `checkAuth` middleware rejects blacklisted tokens.
- **JTI**: Every token is assigned a unique `jti` (JWT ID) claim at issuance to enable per-token blacklisting.

### Auth API Examples

#### 1. Register

Creates a new unverified user and sends a 6-digit OTP to the provided email.

```http
POST http://localhost:5000/api/v1/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePass1#"
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

> **Note**: If the email is already registered but unverified, a new OTP is sent. If already verified, a `409 Conflict` is returned.

---

#### 2. Resend Verification Code

Resends the 6-digit OTP if the user has not yet verified their email.

```http
POST http://localhost:5000/api/v1/auth/resend-verification-code
Content-Type: application/json

{
  "email": "john@example.com"
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

> **Cooldown**: A per-email cooldown (Redis TTL) prevents OTP spam. On cooldown, returns `429 Too Many Requests` with seconds remaining.

---

#### 3. Verify Email

Validates the OTP and activates the user account.

```http
POST http://localhost:5000/api/v1/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
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

#### 4. Login

Authenticates the user and returns access/refresh tokens.

```http
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass1#"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": { "id": "...", "email": "john@example.com", "firstName": "John" },
    "accessToken": "eyJhbGc..."
  }
}
```

---

#### 5. Refresh Token

Generates a new access token using the refresh token.

```http
POST http://localhost:5000/api/v1/auth/refresh-token
Content-Type: application/json
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

---

#### 6. Logout

Invalidates the current tokens by adding them to the Redis blacklist.

```http
POST http://localhost:5000/api/v1/auth/logout
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logout successful"
}
```

---

#### 7. Forgot Password

Sends a password reset token to the user's email.

```http
POST http://localhost:5000/api/v1/auth/forgot-password
Content-Type: application/json

{
  "email": "john@example.com"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset link sent to email"
}
```

---

#### 8. Reset Password

Updates the password using the reset token.

```http
POST http://localhost:5000/api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "eyJhbGc...",
  "newPassword": "NewPassword1#"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password reset successful"
}
```

---

## 👤 User Management Module

**Module Path**: `src/app/modules/user/`

This module manages user profiles, avatars, passwords, statuses, roles, and administrative lifecycle workflows. It incorporates advanced searching, filtering, range queries, sorting, pagination, and file uploads (Cloudinary).

### Roles & Access Control

| Role          | Description                                                                                  |
| ------------- | -------------------------------------------------------------------------------------------- |
| `USER`        | Access to own profile, avatar management, and password change only.                          |
| `ADMIN`       | All USER permissions + list/search users, update status, deactivate/reactivate, soft delete. |
| `SUPER_ADMIN` | All ADMIN permissions + update roles, hard delete, and manual user creation.                 |

### User Endpoint Permission Matrix

| Action                  | Method   | Path                        | Roles                          |
| ----------------------- | -------- | --------------------------- | ------------------------------ |
| Create user manually    | `POST`   | `/users`                    | `ADMIN`, `SUPER_ADMIN`         |
| List all users          | `GET`    | `/users`                    | `ADMIN`, `SUPER_ADMIN`         |
| Get own profile         | `GET`    | `/users/me`                 | `USER`, `ADMIN`, `SUPER_ADMIN` |
| Update own profile      | `PATCH`  | `/users/me`                 | `USER`, `ADMIN`, `SUPER_ADMIN` |
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

### User API Examples

#### 1. Create User (Admin / Super Admin)

```http
POST http://localhost:5000/api/v1/users
Authorization: Bearer <accessToken>
Content-Type: application/json

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

**Response (201 Created)**:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User created successfully",
  "data": { "id": "...", "email": "jane@example.com", "firstName": "Jane" }
}
```

---

#### 2. List All Users (Advanced Filtering & Pagination)

```http
GET http://localhost:5000/api/v1/users?page=1&limit=10&sortBy=createdAt&sortOrder=desc&role=USER&status=ACTIVE&searchTerm=john&createdAtFrom=2024-01-01&createdAtTo=2024-12-31
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Query Parameters**:

| Param             | Type    | Description                                                                 |
| ----------------- | ------- | --------------------------------------------------------------------------- |
| `page`            | integer | Page number (default: 1)                                                    |
| `limit`           | integer | Records per page (default: 10)                                              |
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

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users fetched successfully",
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPage": 5
  },
  "data": [
    {
      "id": "9b7a3fa1-6e1c-457d-872b-0b4efedb33e7",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "USER",
      "status": "ACTIVE",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

#### 3. Get Own Profile

```http
GET http://localhost:5000/api/v1/users/me
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile fetched successfully",
  "data": {
    "id": "9b7a3fa1-6e1c-457d-872b-0b4efedb33e7",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "username": "johndoe",
    "phone": "+1234567890",
    "gender": "MALE",
    "role": "USER",
    "status": "ACTIVE",
    "isVerified": true,
    "bio": "Full Stack Engineer",
    "address": "New York",
    "dateOfBirth": "1992-08-15",
    "timezone": "America/New_York",
    "locale": "en-US",
    "avatar": {
      "url": "https://res.cloudinary.com/...",
      "size": 2048
    },
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-06-16T14:22:30Z"
  }
}
```

---

#### 4. Update Own Profile

```http
PATCH http://localhost:5000/api/v1/users/me
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1987654321",
  "gender": "MALE",
  "bio": "Senior Full Stack Engineer",
  "address": "San Francisco",
  "dateOfBirth": "1992-08-15",
  "timezone": "America/Los_Angeles",
  "locale": "en-US"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Profile updated successfully",
  "data": { "id": "...", "firstName": "John", "lastName": "Smith" }
}
```

---

#### 5. Upload / Replace Own Avatar

```http
PATCH http://localhost:5000/api/v1/users/me/avatar
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data; boundary=----WebKitFormBoundary

------WebKitFormBoundary
Content-Disposition: form-data; name="avatar"; filename="profile.png"
Content-Type: image/png

[binary image data]
------WebKitFormBoundary--
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Avatar uploaded successfully",
  "data": {
    "avatar": {
      "url": "https://res.cloudinary.com/...",
      "size": 2048
    }
  }
}
```

---

#### 6. Delete Own Avatar

```http
DELETE http://localhost:5000/api/v1/users/me/avatar
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Avatar deleted successfully"
}
```

---

#### 7. Change Own Password

```http
PATCH http://localhost:5000/api/v1/users/me/change-password
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "oldPassword": "SecurePass1#",
  "newPassword": "NewSecurePass1#"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password changed successfully"
}
```

---

#### 8. Get User by ID (Admin / Super Admin)

```http
GET http://localhost:5000/api/v1/users/9b7a3fa1-6e1c-457d-872b-0b4efedb33e7
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User fetched successfully",
  "data": { "id": "...", "email": "...", "firstName": "..." }
}
```

---

#### 9. Update User Status (Admin / Super Admin)

```http
PATCH http://localhost:5000/api/v1/users/9b7a3fa1-6e1c-457d-872b-0b4efedb33e7/status
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "status": "ACTIVE"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User status updated successfully"
}
```

---

#### 10. Update User Role (Super Admin Only)

```http
PATCH http://localhost:5000/api/v1/users/9b7a3fa1-6e1c-457d-872b-0b4efedb33e7/role
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "role": "ADMIN"
}
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User role updated successfully"
}
```

---

#### 11. Deactivate User (Admin / Super Admin)

```http
PATCH http://localhost:5000/api/v1/users/9b7a3fa1-6e1c-457d-872b-0b4efedb33e7/deactivate
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User deactivated successfully"
}
```

---

#### 12. Reactivate User (Admin / Super Admin)

```http
PATCH http://localhost:5000/api/v1/users/9b7a3fa1-6e1c-457d-872b-0b4efedb33e7/reactivate
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User reactivated successfully"
}
```

---

#### 13. Soft Delete User (Admin / Super Admin)

Marks the user as deleted but preserves data.

```http
DELETE http://localhost:5000/api/v1/users/9b7a3fa1-6e1c-457d-872b-0b4efedb33e7
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User deleted successfully"
}
```

---

#### 14. Hard Delete User (Super Admin Only)

Permanently removes user data from the database. **This action is irreversible.**

```http
DELETE http://localhost:5000/api/v1/users/9b7a3fa1-6e1c-457d-872b-0b4efedb33e7/hard
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User permanently deleted"
}
```

---

## 🧪 Testing with REST Client

### Using VS Code REST Client Extension

1. Install the [REST Client extension](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) for VS Code.
2. Open [api-doc.http](api-doc.http) file.
3. Click **Send Request** above each endpoint to test.
4. Update `@baseUrl`, `@email`, `@password`, etc. as needed for your environment.

### Example REST Client Usage

```http
@baseUrl = http://localhost:5000/api/v1
@email = test@example.com
@password = Password1#

### Register
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "{{email}}",
  "password": "{{password}}"
}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "{{email}}",
  "password": "{{password}}"
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork** the repository
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request** with a clear description

### Code Standards

- Follow the existing code style (enforced by ESLint + Prettier)
- Write meaningful commit messages
- Add/update tests for new features
- Ensure all tests pass before submitting PR

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙌 Acknowledgments

Built with precision and care for developers who demand:

- ✅ **Type Safety**: Strict TypeScript throughout
- ✅ **Security**: Best practices for authentication & authorization
- ✅ **Performance**: Optimized queries, caching, pagination
- ✅ **Developer Experience**: Clear code, comprehensive docs, REST Client files
- ✅ **Maintainability**: Modular architecture, consistent patterns
- ✅ **Production Readiness**: Error handling, logging, monitoring hooks

---

## 📞 Support

For issues, questions, or feature requests, please open a GitHub Issue or contact the maintainers.

---

**Happy coding! 🎉**

_This boilerplate is maintained with ❤️ for developers who value code quality._
