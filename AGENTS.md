# AGENTS.md — Express Prisma Starter

## Quick start

```bash
pnpm install           # postinstall auto-runs prisma generate
cp .env.example .env   # fill in DATABASE_URL, REDIS_*, JWT_*, etc.
pnpm db:migrate        # apply migrations
pnpm db:seed           # optional — seeds SUPER_ADMIN + ADMIN users
pnpm dev               # tsx watch src/server.ts on port 5000
```

## Validation

```bash
pnpm validate          # lint → format:check → typecheck (all must pass)
```

Pre-commit (`pnpm lint-staged`) runs `pnpm lint:fix` and `pnpm format` on staged files.

Build pipeline: `pnpm build` runs `tsc --noEmit && tsup` (typecheck first, then bundle to `dist/server.js` as single ESM file).

## Codegen & generated files

- Prisma client outputs to `generated/prisma/` — **do not edit**, it's gitignored
- `pnpm db:generate` regenerates the client (auto-runs on `pnpm install` via postinstall)
- `prisma.config.ts` is Prisma 7's config file (schema from `prisma/`, seed via `tsx prisma/seed.ts`)

## Key differences from defaults

- **TypeScript `verbatimModuleSyntax`** — use `import type { Foo }` for type-only imports
- **ESM** (`"type": "module"` in package.json) — imports need `.js` extension in output; tsx handles this at dev time
- **Express 5** — route params via `req.params` (not `req.params.id`), async middleware supported natively
- **No test framework** — zero tests exist. Do not look for test commands

## Project layout

- `src/server.ts` — entry point, graceful shutdown (SIGTERM/SIGINT), connects Prisma + Redis
- `src/app.ts` — Express app assembly: helmet → cookieParser → cors → requestLogger → json → `/api/v1` (rate-limited routes) → notFound → globalErrorHandler
- `src/app/modules/{auth,user}/` — feature modules: `.controller.ts` (thin, no logic), `.service.ts` (orchestration), `.route.ts`, `.validation.ts` (Zod), `.types.ts` (inferred), `.constants.ts` (user-facing strings)
- `src/app/builder/QueryBuilder.ts` — generic, type-safe fluent builder: `.search()` → `.filter()` → `.range()` → `.sortBy()` → `.paginate()`/`.cursorPaginate()` → `.select()` → `.executeWithMeta()`
- `src/app/middlewares/` — `checkAuth(...roles)` (JWT verify + Redis blacklist + role guard), `validateRequest(schema)`, `validateQuery(schema)`, `validateParams(schema)`
- `src/app/config/` — env.ts (validates all vars at boot with Zod), prisma.ts (singleton, driver adapter), redis.ts (exponential backoff reconnect, max 10 attempts)
- `src/app/utils/` — 16 modules: logger.ts (Winston, daily rotate, sensitive data masking), token.ts (create/verify/blacklist JWT), hash.ts (bcryptjs), fileUploader.ts (Multer → Cloudinary), sendResponse.ts, catchAsync.ts, appError.ts
- API base path: `/api/v1`
- `test-api.http` — VS Code REST Client file with all endpoints, uses `@baseUrl`, `@accessToken`, `@email` variables

## Auth system internals

- **Dual JWT**: access token (15m default) + refresh token (7d default), both HttpOnly cookies
- **Token revocation**: JTI-based Redis blacklist with TTL matching token expiry. On refresh, old tokens are blacklisted, new ones issued (rotation)
- **OTP flow**: 6-digit code stored in Redis (10min TTL), 2min cooldown per email. Sent via Brevo API (primary) or Gmail SMTP (fallback)
- **Password reset**: JWT token sent to email, stored in URL, validated at reset endpoint, blacklisted after use (15min TTL)
- **Cookie config**: `httpOnly: true`, `secure: true` in production, `sameSite: 'lax'` (dev) / `'none'` (prod). Bearer token header is fallback
- **Login returns**: JWT cookies + response body with user data. `lastLoginAt` is updated on each login
- **User status lifecycle**: `PENDING` (post-reg, not verified) → `ACTIVE` (verified email) → `INACTIVE` / `SUSPENDED` / `BANNED` / `DELETED`
- **`checkUserStatus` utility**: called on every protected route — null/undeleted → 401, PENDING/unverified → 403, INACTIVE/SUSPENDED/BANNED/DELETED → 403

## Operational notes

- **Redis is required** — `connectRedis()` runs before `server.listen()`. No Redis = crash
- **Env validation** — `src/app/config/env.ts` runs at import time. Missing or malformed vars = `process.exit(1)`
- **Error handling** — central `globalErrorHandler` classifies by type: ZodError → 400, Prisma P2002 → 409, P2025 → 404, P2003 → 400, DB unavailable codes → 503, AppError → custom status/code, generic → 500. Response shape: `{ success, statusCode, code, message, timestamp, path, errors }`. Stack traces in dev only
- **Logger** — Winston with daily rotate files (`logs/application-%DATE%.log`, `logs/errors-%DATE%.log`, 14-day retention, 20MB max). Auto-masks passwords, tokens, API keys, cookies in structured metadata
- S3MTP: Two providers available (Brevo API, Gmail SMTP). Currently hard-wired — each call site imports the desired provider directly. No abstraction layer yet

## RBAC system

- **Roles** (hierarchical): `USER` < `ADMIN` < `SUPER_ADMIN`
- **Permissions** defined in `src/app/constants/permissions.constants.ts`: `user:list`, `user:detail`, `user:update`, `user:soft-delete`, `user:hard-delete`, `user:manage-roles`
- `checkAuth(...roles)` guards routes by role. `checkPermission(permission)` checks individual permission
- **Admin routes** (ADMIN, SUPER_ADMIN): list users, get user by ID, update status, soft delete
- **Super Admin only**: update role, hard delete

## Prisma schema conventions

- **Multi-file schema**: `prisma/models/enums.prisma` and `prisma/models/user.prisma` (User, Avatar, AuthProvider). Imported via `prisma/schema.prisma` generator config
- **User fields**: UUID PK, email (unique), username (unique, optional), password (optional for OAuth), role (enum), status (enum), isVerified, timestamps
- **Avatar**: linked 1:1 to User via `avatarId`, stores Cloudinary metadata (publicId, url, width, height, format, etc.)
- **AuthProvider**: supports multiple providers per user (CREDENTIAL, GOOGLE, FACEBOOK, GITHUB), cascade deletes with User
- **Searchable fields**: `['email', 'username', 'firstName', 'lastName', 'phone']`

## Conventions

- **File per concept**: Every concept gets its own file (controller, service, route, validation, types, constants). No grouping
- **User-facing strings** live in `*.constants.ts` as `ModuleMessages` const objects
- **Error codes** live in `src/app/utils/codes.ts` — custom codes + http-status-codes merged
- **Response helper**: `sendResponse(res, { statusCode, message, data?, meta? })` — always returns `{ success, statusCode, message, data?, meta?, timestamp }`
- **No console.log** allowed — ESLint rule `no-console` with `allow: ['warn', 'error']`
- **Imports**: `verbatimModuleSyntax` means `import type { X }` for type-only, `import { x }` for values

## Creating a new module

1. Create `src/app/modules/<name>/` with: `<name>.controller.ts`, `<name>.service.ts`, `<name>.route.ts`, `<name>.validation.ts`, `<name>.types.ts`, `<name>.constants.ts`
2. If the module needs Prisma queries, use `new QueryBuilder(prisma.<model>)` for dynamic filtering/pagination
3. Register route in `src/app/routes/index.ts` by adding to `moduleRoutes` array
4. Use existing auth/user modules as structural reference — file naming, error handling patterns, response format

## Known technical debt (avoid these patterns)

- `utils/httpStatus.ts` is redundant — use `http-status-codes` npm package instead (already a dependency)
- `auth/utils.ts` mixes email sending + token blacklisting + OTP generation — split into separate files for new modules
- SMTP providers have no abstraction layer — for new email features, prefer calling one consistently
- In-memory rate limiter doesn't persist across restarts — acceptable for single-instance dev

## Architecture reference

See [`architecture.md`](architecture.md) for comprehensive system analysis: component hierarchy, data flow diagrams, design pattern evaluation, security review, and 4-phase improvement roadmap.
