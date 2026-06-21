# 🚀 Express Prisma Advanced Boilerplate

> **Production-Ready Express.js + Prisma + PostgreSQL Starter Template**
>
> A meticulously crafted, enterprise-grade boilerplate for building scalable, type-safe REST APIs with strict TypeScript, advanced querying, comprehensive error handling, and security-first architecture. Built for developers who demand excellence.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.x-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.x-lightgrey.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.x-2D3748.svg)](https://www.prisma.io/)

---

## 📋 Table of Contents

- [Key Features](#-key-features)
- [Problems It Solves](#-problems-it-solves)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Database Management](#-database-management)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [API Documentation](#-api-documentation)
- [Testing the API](#-testing-the-api)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Key Features

### 🏗️ Core Architecture

- **Strict Type Safety**: Full TypeScript strict mode with enforced type checking across the entire codebase
- **Advanced QueryBuilder**: Dynamic, type-safe query builder [README.md](src/app/builder/README.md) supporting filtering, searching, range queries, and cursor/offset pagination
- **Layered Architecture**: Clean separation of concerns — controllers, services, routes, middlewares, utilities
- **Global Error Handling**: Unified middleware for operational vs. programming error classification with custom error codes
- **Request Validation**: Zod-based schema validation for type-safe request/response contracts
- **Modular Routing**: Feature-based module structure for maintainability and scalability

### 🔐 Security & Authentication

- **JWT-Based Authentication**: Dual token strategy (access token + refresh token) with HttpOnly cookies
- **Token Blacklisting**: Redis-backed token blacklist on logout/refresh with automatic TTL expiry
- **Secure Password Handling**: bcryptjs hashing with configurable salt rounds
- **CORS Configuration**: Granular CORS setup for origin whitelisting control
- **Helmet Security Headers**: Industry-standard security headers middleware
- **Rate Limiting**: Request throttling to prevent abuse and DDoS attacks
- **Email OTP Verification**: Multi-step email verification with per-email cooldown protection
- **Password Reset Flow**: Secure token-based password reset with expiration and blacklisting

### 🗄️ Database & ORM

- **Prisma ORM**: Type-safe database access with auto-generated client
- **PostgreSQL**: Robust, proven relational database backend
- **Migrations**: Version-controlled schema changes with rollback capability
- **Database Seeding**: Pre-populate environment with test data
- **Prisma Studio**: Visual database management GUI

### ✅ Quality & Developer Experience

- **ESLint**: Strict linting with `@typescript-eslint/recommended-type-checked`
- **Prettier**: Automatic code formatting for consistency
- **Husky + Lint-Staged**: Pre-commit hooks for code quality assurance
- **Winston Logging**: Structured logging with daily rotating file appenders
- **REST Client Files**: Copy-pasteable `.http` files for API testing with VS Code REST Client

### 📦 Additional Features

- **File Uploads**: Cloudinary integration for avatar image management
- **Email Services**: Multiple SMTP provider support (Gmail, Brevo)
- **Redis Caching**: Session management and token blacklisting
- **Role-Based Access Control**: `USER`, `ADMIN`, `SUPER_ADMIN` role hierarchy
- **User Status Management**: `PENDING`, `ACTIVE`, `INACTIVE`, `SUSPENDED`, `BANNED` statuses
- **Soft Delete Support**: Logical deletion preserving data integrity

---

## 🎯 Problems It Solves

| Problem                               | Solution                                                                   |
| ------------------------------------- | -------------------------------------------------------------------------- |
| Type-unsafe query parameters and APIs | Strict TypeScript + Zod validation ensures compile-time and runtime safety |
| Unstructured error handling           | Centralized error middleware classifies operational vs. programming errors |
| Slow API pagination/filtering         | Advanced QueryBuilder with cursor and offset pagination, range filters     |
| Token security & revocation           | Redis-backed token blacklist with JTI-based per-token revocation           |
| Code inconsistency across teams       | ESLint + Prettier + Husky ensure uniform code style and quality            |
| Repeated boilerplate setup            | Feature-based module scaffolding reduces duplicate code patterns           |
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
| **File Upload**        | Cloudinary + Multer        | ^2.10.0     |
| **Email**              | Nodemailer                 | ^8.0.7      |
| **Security**           | Helmet, CORS, Rate Limiter | Latest      |
| **Logging**            | Winston + Daily Rotate     | ^3.19.0     |
| **Linting**            | ESLint + TypeScript-ESLint | ^10.4.1     |
| **Code Formatting**    | Prettier                   | ^3.8.3      |
| **Dev Tools**          | tsx, Husky, Lint-Staged    | Latest      |

---

## 📋 Prerequisites

Ensure the following tools are installed and available on your system:

- **Node.js** (v18 or v20+) — [nodejs.org](https://nodejs.org/)
- **pnpm** (recommended) or **npm** — [pnpm.io](https://pnpm.io/)
- **PostgreSQL** (v14+) — [postgresql.org](https://www.postgresql.org/)
- **Redis** (required for token blacklisting & caching) — [redis.io](https://redis.io/)
- **Git** — [git-scm.com](https://git-scm.com/)

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

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your credentials. See [Environment Variables](#-environment-variables) below.

### 4. Initialize the Database

```bash
pnpm db:migrate     # Run all pending migrations
pnpm db:seed        # (Optional) Seed initial data
```

### 5. Start the Development Server

```bash
pnpm dev
```

The API will be running at `http://localhost:5000`.

---

## 🔧 Environment Variables

Create a `.env` file in the project root from the `.env.example` template:

```env
# ============================================
# Application
# ============================================
PORT=5000
NODE_ENV=development

# ============================================
# Database
# ============================================
DATABASE_URL=postgresql://postgres:password@localhost:5432/express_prisma_db

# ============================================
# JWT
# ============================================
JWT_ACCESS_SECRET=your_access_token_secret_key_here_min_32_chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_token_secret_key_here_min_32_chars
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# Redis (Token blacklisting & Caching)
# ============================================
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=

# ============================================
# Email (SMTP)
# ============================================
SMTP_GMAIL_USER=your-email@gmail.com
SMTP_GMAIL_PASSWORD=your-app-specific-password
SMTP_BREVO_USER=your-email@example.com
SMTP_BREVO_PASSWORD=your-brevo-api-key
SMTP_PROVIDER=gmail

# ============================================
# Cloudinary (File Uploads)
# ============================================
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ============================================
# CORS
# ============================================
CORS_ORIGIN=http://localhost:3000,http://localhost:3001

# ============================================
# Rate Limiting
# ============================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# ============================================
# Logging
# ============================================
LOG_LEVEL=info
```

> [!CAUTION]
> Never commit your `.env` file. It is already listed in `.gitignore`. Always keep secrets out of version control.

---

## 🗄️ Database Management

| Command            | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| `pnpm db:generate` | Generate the Prisma client from the schema                  |
| `pnpm db:migrate`  | Apply all pending migrations to the database                |
| `pnpm db:push`     | Push schema changes directly (dev only, no migration files) |
| `pnpm db:pull`     | Introspect an existing database and update the schema       |
| `pnpm db:seed`     | Populate the database with initial seed data                |
| `pnpm db:studio`   | Open Prisma Studio at `http://localhost:5555`               |

---

## 📁 Project Structure

```
express-prisma/
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
│       │   ├── env.ts             # Environment variables with Zod validation
│       │   ├── prisma.ts          # Prisma client singleton
│       │   ├── redis.ts           # Redis client configuration
│       │   ├── cloudinary.ts      # Cloudinary SDK setup
│       │   ├── smtp.gmail.ts      # Gmail SMTP configuration
│       │   └── smtp.brevo.ts      # Brevo SMTP configuration
│       │
│       ├── constants/             # Application-wide constants
│       │   ├── messages.constants.ts
│       │   ├── roles.constants.ts
│       │   └── permissions.constants.ts
│       │
│       ├── errors/                # Custom Prisma & Zod error handlers
│       │   ├── prismaClientKnownRequestError.errors.ts
│       │   ├── prismaValidationError.errors.ts
│       │   └── zodError.errors.ts
│       │
│       ├── middlewares/           # Express middleware chain
│       │   ├── globalErrorHandler.ts  # Unified error handling
│       │   ├── checkAuth.ts           # JWT authentication guard
│       │   ├── validateRequest.ts     # Zod request validation
│       │   ├── requestLogger.ts       # HTTP request/response logging
│       │   ├── rateLimiter.ts         # Rate limiting per IP
│       │   └── notFound.ts            # 404 handler
│       │
│       ├── modules/               # Feature-based modules
│       │   ├── auth/              # 🔐 Authentication module
│       │   │   ├── auth.controller.ts
│       │   │   ├── auth.service.ts
│       │   │   ├── auth.route.ts
│       │   │   ├── auth.validation.ts
│       │   │   ├── auth.types.ts
│       │   │   ├── auth.constants.ts
│       │   │   ├── auth.utils.ts
│       │   │   └── README.md          # 📖 Auth API Reference
│       │   │
│       │   └── user/              # 👤 User management module
│       │       ├── user.controller.ts
│       │       ├── user.service.ts
│       │       ├── user.route.ts
│       │       ├── user.validation.ts
│       │       ├── user.types.ts
│       │       ├── user.constants.ts
│       │       └── README.md          # 📖 User API Reference
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
│           ├── redis.ts           # Redis operations helper
│           ├── fileUploader.ts    # Cloudinary upload handler
│           ├── emailTemplate.ts   # Email HTML templates
│           ├── httpStatus.ts      # HTTP status code mappings
│           ├── codes.ts           # Application error codes
│           ├── checkUserStatus.ts # User status validation helper
│           ├── parser.ts          # Query/body parsing utilities
│           ├── exclude.ts         # Object property exclusion
│           ├── pick.ts            # Object property picking
│           └── setCookie.ts       # Cookie management
│
├── generated/                     # Auto-generated Prisma types (do not edit)
├── logs/                          # Application log files (gitignored)
│
├── .env.example                   # Environment template
├── eslint.config.ts               # ESLint flat config
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Project metadata & dependencies
├── pnpm-lock.yaml                 # Dependency lock file
├── test-api.http                   # REST Client API documentation & requests
└── README.md                      # This file
```

---

## 📜 Available Scripts

| Script           | Command             | Description                                  |
| ---------------- | ------------------- | -------------------------------------------- |
| **Development**  | `pnpm dev`          | Start server with hot reload via `tsx watch` |
| **Build**        | `pnpm build`        | Compile TypeScript to `dist/`                |
| **Lint**         | `pnpm lint`         | Run ESLint across the codebase               |
| **Lint Fix**     | `pnpm lint:fix`     | Auto-fix all fixable ESLint violations       |
| **Format**       | `pnpm format`       | Format all files with Prettier               |
| **Format Check** | `pnpm format:check` | Verify formatting without changes            |
| **Type Check**   | `pnpm typecheck`    | Run TypeScript compiler (no emit)            |
| **Validate**     | `pnpm validate`     | Run lint + format:check + typecheck          |
| **DB Generate**  | `pnpm db:generate`  | Regenerate the Prisma client                 |
| **DB Migrate**   | `pnpm db:migrate`   | Apply pending database migrations            |
| **DB Seed**      | `pnpm db:seed`      | Seed the database with initial data          |
| **DB Push**      | `pnpm db:push`      | Push schema changes (dev only)               |
| **DB Pull**      | `pnpm db:pull`      | Introspect and update schema from DB         |
| **DB Studio**    | `pnpm db:studio`    | Open Prisma Studio GUI                       |

---

## 📡 API Documentation

### Base URL

```
http://localhost:5000/api/v1
```

### Health Check

```http
GET http://localhost:5000/api/v1/health
```

**Response (200 OK)**:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Server is running"
}
```

---

### Module Documentation

Detailed API references — including endpoint contracts, request/response schemas, error codes, security notes, and architecture explanations — are maintained alongside the module source code:

| Module                 | Path                                                             | Description                                                                                   |
| ---------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 🔐 **Authentication**  | [src/app/modules/auth/README.md](src/app/modules/auth/README.md) | Registration, email OTP verification, login, token rotation, logout, and password reset flows |
| 👤 **User Management** | [src/app/modules/user/README.md](src/app/modules/user/README.md) | Profile management, avatar uploads, RBAC, admin controls, and advanced filtering & pagination |
| 🔍 **QueryBuilder**    | [src/app/builder/README.md](src/app/builder/README.md)           | Generic, type-safe Prisma query builder — search, filter, range, sort, paginate, and project  |

> [!TIP]
> Each module README is co-located with its source code so documentation stays close to the implementation, making it easier to keep in sync as the codebase evolves.

---

## 🧪 Testing the API

### Authentication Strategy

This API supports **two authentication methods**. Cookies are the default and preferred approach:

| Method                                    | How it works                                                                                                                                                                       | When to use                                                                            |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 🍪 **HttpOnly Cookies** _(default)_       | On login, the server automatically sets `accessToken` and `refreshToken` as `HttpOnly`, `Secure`, `SameSite=Lax` cookies. They are sent automatically on every subsequent request. | Browsers, VS Code REST Client (with cookie jar enabled), Insomnia                      |
| 🔑 **Bearer Token** _(optional fallback)_ | Pass the token manually as `Authorization: Bearer <accessToken>` in the request header.                                                                                            | Mobile clients, `curl`, cross-origin REST tools, or clients that don't support cookies |

> [!NOTE]
> You do **not** need to set the `Authorization: Bearer` header if your client sends cookies automatically. The header is provided in `test-api.http` as a convenient fallback for tools where cookies are not forwarded.

---

### VS Code REST Client

1. Install the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension for VS Code.
2. Open [`test-api.http`](test-api.http) in the project root.
3. Run the **Login** request first — the server will set the auth cookies automatically.
4. For clients without cookie support, copy the `accessToken` from the login response body and paste it into the `@accessToken` variable at the top of the file.
5. Click **Send Request** above any endpoint to execute it.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository on GitHub
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Commit your changes**: `git commit -m 'feat: add your feature description'`
4. **Push to the branch**: `git push origin feature/your-feature-name`
5. **Open a Pull Request** with a clear description of the change

### Code Standards

- Follow the existing module structure and naming conventions
- Run `pnpm validate` before submitting — all checks must pass
- Write meaningful, conventional commit messages (`feat:`, `fix:`, `docs:`, `refactor:`)
- Update the relevant module `README.md` if you add or change API endpoints

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for full details.

---

## 🙌 Acknowledgments

Built with precision and care for developers who demand:

- ✅ **Type Safety** — Strict TypeScript throughout with zero `any`
- ✅ **Security** — Best practices for authentication & authorization
- ✅ **Performance** — Optimized queries, Redis caching, smart pagination
- ✅ **Developer Experience** — Clear code, comprehensive docs, REST Client files
- ✅ **Maintainability** — Modular architecture, consistent patterns
- ✅ **Production Readiness** — Error handling, structured logging, monitoring hooks

---

<p align="center">
  Made with ❤️ · <a href="https://github.com/almamun2b/express-prisma">GitHub</a> · <a href="https://github.com/almamun2b/express-prisma/issues">Report Bug</a> · <a href="https://github.com/almamun2b/express-prisma/issues">Request Feature</a>
</p>
