# express-postgresql-template

A production-ready **Express.js + TypeScript + PostgreSQL** starter template. Clone it, rename it, and start building — the boilerplate is already handled.

---

## What's Included

- **Express.js v5** with a modular route structure
- **TypeScript** (ESM, strict mode)
- **Prisma ORM** with a PostgreSQL adapter
- **Redis** for token allowlisting / session management
- **Full auth flow** — register, email verification, login, refresh, logout, forgot/reset password
- **JWT** access + refresh token strategy (httpOnly cookies)
- **Zod** request validation
- **Nodemailer** for transactional email
- **Multer + Cloudinary** for file uploads
- **Winston** structured logging with daily log rotation
- **Helmet + express-rate-limit** for baseline security hardening
- **ESLint v10 flat config + Prettier** pre-configured
- **REST Client** `.http` file for manual API testing in VS Code

---

## Tech Stack

| Layer            | Technology                           |
| ---------------- | ------------------------------------ |
| Runtime          | Node.js (ESM)                        |
| Framework        | Express.js v5                        |
| Language         | TypeScript                           |
| Database         | PostgreSQL + Prisma ORM              |
| Cache / Sessions | Redis                                |
| Auth             | JWT (access + refresh tokens)        |
| Email            | Nodemailer                           |
| File Uploads     | Multer + Cloudinary                  |
| Validation       | Zod                                  |
| Logging          | Winston + Daily Rotate File          |
| Security         | Helmet, express-rate-limit, bcryptjs |

---

## Prerequisites

- Node.js >= 18
- pnpm
- PostgreSQL
- Redis

---

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd express-postgresql
pnpm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

Key variables to set:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=...
JWT_REFRESH_SECRET=...

SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 3. Set up the database

```bash
pnpm db:generate   # Generate Prisma client
pnpm db:push       # Push schema to database (dev)
pnpm db:seed       # Seed initial data (optional)
```

### 4. Run the development server

```bash
pnpm dev
```

The server starts at `http://localhost:5000`.

---

## Available Scripts

| Script              | Description                                    |
| ------------------- | ---------------------------------------------- |
| `pnpm dev`          | Start dev server with hot reload (`tsx watch`) |
| `pnpm build`        | Compile TypeScript to `dist/`                  |
| `pnpm lint`         | Run ESLint                                     |
| `pnpm lint:fix`     | Run ESLint with auto-fix                       |
| `pnpm format`       | Format all files with Prettier                 |
| `pnpm format:check` | Check formatting without writing               |
| `pnpm typecheck`    | Run `tsc --noEmit`                             |
| `pnpm validate`     | Run lint + typecheck                           |
| `pnpm db:generate`  | Regenerate Prisma client                       |
| `pnpm db:migrate`   | Run Prisma migrations                          |
| `pnpm db:push`      | Push schema changes (no migration file)        |
| `pnpm db:pull`      | Introspect existing database                   |
| `pnpm db:seed`      | Seed the database                              |
| `pnpm db:studio`    | Open Prisma Studio                             |

---

## API Reference

Base URL: `http://localhost:5000/api/v1`

### Health

| Method | Endpoint         | Description  |
| ------ | ---------------- | ------------ |
| GET    | `/`              | Root check   |
| GET    | `/api/v1/health` | Health check |

### Auth

| Method | Endpoint                         | Description                   | Auth Required |
| ------ | -------------------------------- | ----------------------------- | ------------- |
| POST   | `/auth/register`                 | Register a new user           | No            |
| POST   | `/auth/resend-verification-code` | Resend email verification OTP | No            |
| POST   | `/auth/verify-email`             | Verify email with OTP         | No            |
| POST   | `/auth/login`                    | Login and receive tokens      | No            |
| POST   | `/auth/refresh-token`            | Refresh access token          | Cookie        |
| POST   | `/auth/logout`                   | Invalidate tokens             | Cookie        |
| POST   | `/auth/forgot-password`          | Send password reset email     | No            |
| POST   | `/auth/resend-forgot-password`   | Resend password reset email   | No            |
| POST   | `/auth/reset-password`           | Reset password with token     | No            |

#### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "password": "Password1#"
}
```

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password1#"
}
```

#### Verify Email

```http
POST /api/v1/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "942176"
}
```

#### Reset Password

```http
POST /api/v1/auth/reset-password
Content-Type: application/json

{
  "token": "<reset-token>",
  "newPassword": "NewPassword1#"
}
```

---

## Project Structure

```
.
├── src/
│   ├── server.ts         # Entry point
│   ├── app.ts            # Express app setup
│   ├── config/           # Env, database, Redis config
│   ├── modules/          # Feature modules (auth, user, etc.)
│   │   └── auth/
│   │       ├── auth.routes.ts
│   │       ├── auth.controller.ts
│   │       ├── auth.service.ts
│   │       └── auth.schema.ts
│   ├── middlewares/      # Error handling, auth guard, rate limiter
│   ├── utils/            # Helpers, token utils, email sender
│   └── types/            # Shared TypeScript types
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── dist/                 # Compiled output
├── eslint.config.js
├── prettier.config.js
├── tsconfig.json
└── package.json
```

---

## Testing the API

A `.http` file is included at the project root for use with the [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension for VS Code. Update the variables at the top of the file before running requests:

```
@email        = user@example.com
@password     = Password1#
```

---

## License

MIT License
