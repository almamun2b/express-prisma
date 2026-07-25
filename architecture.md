# Architecture Review — Express Prisma Starter

> Generated from comprehensive source code analysis.  
> Covers system structure, design patterns, data flow, security, and improvement roadmap.

---

## 1. System Structure Assessment

### High-level component hierarchy

```
server.ts                         Bootstrap, graceful shutdown, process signals
  app.ts                          Express app assembly (middleware stack)
    middlewares/                   helmet → cookieParser → cors → requestLogger → json → rateLimiter → routes → notFound → globalErrorHandler
      globalErrorHandler.ts       Type-aware error classification (Zod → Prisma → AppError → generic)
      checkAuth.ts                JWT verification + Redis blacklist check + role guard
      validateRequest.ts          Body/query/params + multipart JSON parsing
      requestLogger.ts            Custom Winston HTTP logger (method, URL, status, duration)
      rateLimiter.ts              API + auth-specific rate limits
      notFound.ts                 Catches unmatched routes
    routes/
      index.ts                    Mounts /health, /users, /auth
      health.route.ts             DB connectivity check (SELECT 1)
    modules/
      auth/                       Register, login, logout, refresh, verify email, password reset
        controller.ts             No business logic — delegates to service
        service.ts                Orchestration — Prisma queries, Redis ops, token ops, email
        validation.ts             Zod schemas (register, login, verify-email, password-reset)
        utils.ts                  OTP generation/emailing, token blacklisting, cooldown checks
        constants.ts              All user-facing strings
        types.ts                  Zod-inferred input types
        README.md                 API reference
      user/                       Profile CRUD, avatar upload, admin management
        (same file pattern as auth)
    config/
      env.ts                      Zod-validated env vars with type coercion
      prisma.ts                   Prisma client singleton (driver adapter pattern)
      redis.ts                    Redis client with exponential backoff reconnection
      cloudinary.ts               Cloudinary SDK config
      smtp.brevo.ts               Brevo REST API email sender
      smtp.gmail.ts               Gmail SMTP nodemailer sender
    builder/
      QueryBuilder<TDelegate>     Fluent, type-safe, generic query builder for any Prisma model
    utils/                        16 modules
    errors/                       3 error handlers (Prisma known, Prisma validation, Zod)
    types/                        7 type files
    constants/                    3 constant modules
prisma/
  models/                         enums.prisma, user.prisma
  seed.ts                         Upserts SUPER_ADMIN + ADMIN
```

### Module boundaries

| Module      | Responsibility                                                        | External deps                                | Internal deps                                                                                                        |
| ----------- | --------------------------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| auth        | Auth lifecycle (register → verify → login → logout → refresh → reset) | prisma, redis, jwt, bcrypt, nodemailer/brevo | utils/token, utils/redis, utils/hash, utils/setCookie, utils/checkUserStatus, errors/appError, middlewares/checkAuth |
| user        | Profile CRUD, avatar upload, RBAC admin                               | prisma, redis, cloudinary, multer            | utils/fileUploader, utils/hash, utils/checkUserStatus, builder/QueryBuilder                                          |
| config      | Singleton clients (Prisma, Redis, Cloudinary, SMTP)                   | prisma, redis, cloudinary, nodemailer        | —                                                                                                                    |
| builder     | Generic Prisma query composition                                      | prisma                                       | —                                                                                                                    |
| middlewares | Request pipeline stages                                               | redis, jwt, zod                              | utils/(token, logger, checkUserStatus), errors/appError                                                              |

### Assessment

**Strengths:**

- Clean layered separation: controller (thin) → service (orchestration) → utils/helpers (stateless)
- Feature modules are self-contained with co-located types, validation, constants
- No circular imports between modules
- Single-responsibility config files (Prisma, Redis, Cloudinary, SMTP each in their own file)

**Weaknesses:**

- Dependency on `utils/codes.ts` and `utils/httpStatus.ts` duplicates what `http-status-codes` package provides
- `utils/httpStatus.ts` (239 lines) is a static mirror of the `http-status-codes` package — dead code risk
- `utils/parser.ts`'s `expiresInToMs` is only used in `auth/utils.ts` and `emailTemplate.ts` — should be colocated
- No module boundary tests — impossible to verify contract adherence without manual review

---

## 2. Design Pattern Evaluation

### Patterns identified

| Pattern                  | Location                                                    | Quality      |
| ------------------------ | ----------------------------------------------------------- | ------------ |
| **Layered Architecture** | controller → service → utils/DB                             | ✅ Clean     |
| **Module pattern**       | `modules/{auth,user}/` each self-contained                  | ✅ Clean     |
| **Middleware chain**     | Express middleware stack in `app.ts`                        | ✅ Clean     |
| **Fluent Builder**       | `builder/QueryBuilder` chained API                          | ✅ Excellent |
| **Strategy pattern**     | Dual SMTP providers (Brevo API + Gmail SMTP)                | ⚠️ Partial   |
| **Singleton**            | Prisma, Redis, Cloudinary clients                           | ✅ Clean     |
| **Custom error class**   | `AppError` with isOperational flag                          | ✅ Clean     |
| **Async wrapper**        | `catchAsync` — DRY try/catch                                | ✅ Standard  |
| **Repository/DAO**       | Services act as data access layer                           | ⚠️ Partial   |
| **Null Object**          | `checkUserStatus` returns null guard                        | ✅ Clean     |
| **Cooldown/Backoff**     | Redis key-based cooldowns, exponential backoff reconnection | ✅ Clean     |

### Anti-patterns detected

**1. SMTP provider selection not abstracted** (`config/smtp.brevo.ts` and `config/smtp.gmail.ts`)

- No common interface. Each module imports the concrete provider directly. If you add a third provider, every call site must change.
- **Fix:** Introduce a single `emailSender.ts` that switches on `env.smtpProvider` and exports uniform `sendEmail({ to, subject, html })`.

**2. `auth/utils.ts` imports `services/auth/auth.utils.ts` and vice versa?**

- Verified: `auth/utils.ts` does NOT import from `auth/service.ts`. But `auth/utils.ts` is a mixed-responsibility file:
  - Sends emails (brevo/gmail)
  - Generates/blacklists tokens (redis, jwt)
  - Generates OTPs
  - This should be split into `auth/email.ts`, `auth/token-blacklist.ts`, `auth/otp.ts`.

**3. Inconsistent error code usage**

- `utils/codes.ts` defines `CustomCodes` but `globalErrorHandler.ts` also references status codes as numbers in some branches.
- The `Codes` merge object is not used in the error handler — it's dead code.

**4. `utils/httpStatus.ts` provides a hand-rolled enum**

- The project already depends on `http-status-codes` npm package. This file is redundant (239 lines of maintenance burden).

---

## 3. Dependency Architecture

### Coupling analysis

```
src/server.ts
  → src/app.ts
    → src/app/config/env.ts          (forced — no middleware can run without env)
    → src/app/middlewares/*           (middleware imports)
    → src/app/routes/index.ts
      → modules/auth/auth.route.ts
        → auth.controller.ts → auth.service.ts → auth.utils.ts → config/smtp.brevo.ts
                                                     → utils/token.ts, utils/redis.ts
                                                     → utils/emailTemplate.ts, utils/parser.ts
      → modules/user/user.route.ts
        → user.controller.ts → user.service.ts → builder/QueryBuilder.ts
                                               → utils/fileUploader.ts → config/cloudinary.ts
                                               → utils/hash.ts
```

### Circular dependency check

No circular dependencies detected. The dependency graph is a DAG.

### Coupling levels

| Layer        | Inbound couplings | Outbound couplings        | Assessment      |
| ------------ | ----------------- | ------------------------- | --------------- |
| middlewares/ | app.ts only       | utils/, config/           | ✅ Acceptable   |
| modules/     | routes/index.ts   | utils/, config/, builder/ | ✅ Acceptable   |
| utils/       | multiple          | config/env.ts only        | ✅ Low coupling |
| config/      | multiple          | env.ts, npm pkgs          | ✅ Low coupling |
| builder/     | user/service.ts   | prisma types only         | ✅ Minimal      |

### Assessment

- No circular imports. The dependency graph is clean and directed.
- `utils/` modules depend only on `config/env.ts` (for env vars) — well-factored.
- `config/` modules depend only on `env.ts` and npm packages — well-factored.
- `builder/` has zero project imports — ideal.

---

## 4. Data Flow Analysis

### Authentication flow (register → verify → login → request)

```
POST /auth/register
  validateRequest(registerSchema)       Zod parse body
  auth.controller.register()            catchAsync wraps
    auth.service.register()
      prisma.user.findUnique(email)     Check existing
      hashPassword(password)            bcryptjs
      prisma.user.create(...)           UUID, PENDING, isVerified=false
      auth.utils.sendOtpToEmail()
        redis.get(cooldownKey)          Anti-spam check
        generateOtp()                   6-digit random
        redis.set(otpKey, otp, TTL=10m)
        redis.set(cooldownKey, "1", TTL=2m)
        smtp.brevo.sendEmail(otp)       Or gmail
        logger.info("OTP sent")

POST /auth/verify-email
  validateRequest(verifyEmailSchema)
  auth.service.verifyEmail()
    redis.get(otpKey)                   Verify OTP
    prisma.user.update(status=ACTIVE, isVerified=true)
    redis.del(otpKey)                   Consume OTP

POST /auth/login
  validateRequest(loginSchema)
  auth.service.login()
    prisma.user.findUnique(email, include password)
    comparePassword(plain, hash)
    token.createJwtPayload(user)        { userId, email, role, jti }
    generateToken(payload, secret, expiry)
    setAuthCookies(res, tokens)         HttpOnly cookies
    prisma.user.update(lastLoginAt)

GET /users (authenticated)
  checkAuth(ADMIN, SUPER_ADMIN)
    extractBearerToken() or req.cookies.accessToken
    verifyToken(token, secret)
    redis.get(blacklistKey)             Check if token is revoked
    prisma.user.findUnique(userId)
    checkUserStatus(user)               Must be ACTIVE
    role check in allowedRoles
    req.user = { id, email, role, status }
  validateQuery(queryUsersSchema)
  user.service.getAllUsersFromDB()
    new QueryBuilder(prisma.user)
      .search(searchTerm, USER_SEARCHABLE_FIELDS)
      .filter(filterFields)
      .range(rangeFields)
      .sortBy(sortBy, sortOrder)
      .paginate(page, limit)
      .select(USER_SAFE_SELECT)
      .executeWithMeta()
```

### State management

| State             | Location           | Lifetime           | Persistence |
| ----------------- | ------------------ | ------------------ | ----------- |
| User records      | PostgreSQL         | Permanent          | Disk        |
| JWT tokens        | Stateless (signed) | Per-request        | None        |
| Blacklisted JTIs  | Redis              | TTL = token expiry | Memory      |
| OTP codes         | Redis              | 10 min TTL         | Memory      |
| Cooldown markers  | Redis              | 2 min TTL          | Memory      |
| Cloudinary assets | Cloudinary         | Until deleted      | Cloud       |

### Assessment

- **Redis is the single point of failure** for auth and rate limiting. Redis down = no login, no refresh, no registration.
- OTP and cooldown use Redis exclusively — if Redis is lost, existing OTPs are unverifiable until users request new ones.
- The token blacklist pattern is correct: JTI stored with TTL matching token expiry. After expiry, the record auto-evicts.
- Refresh token rotation is implemented: old tokens are blacklisted, new tokens issued on refresh.

---

## 5. Scalability & Performance

### Current state

| Concern          | Current implementation                        | Assessment                     |
| ---------------- | --------------------------------------------- | ------------------------------ |
| Database queries | Raw Prisma (no query caching)                 | ⚠️ OK for moderate load        |
| Query pagination | Offset + cursor (Builder handles both)        | ✅ Good                        |
| Search/filter    | Prisma `contains` on searchable fields        | ⚠️ No full-text search index   |
| Session storage  | Redis (JTI blacklist) — fine-grained TTL      | ✅ Good                        |
| Rate limiting    | In-memory `express-rate-limit` (default)      | ⚠️ Not shared across instances |
| File uploads     | Multer → local disk → Cloudinary              | ⚠️ Local disk intermediary     |
| Logging          | Winston daily rotate files                    | ⚠️ No log aggregation          |
| Caching          | None for DB queries                           | ❌ Missing                     |
| Connection pool  | Prisma handles pooling (PgBouncer compatible) | ✅ Good                        |
| Bundle size      | tsup bundles ESM with tree-shaking            | ✅ Good                        |

### Bottlenecks

1. **No database query cache** — every user list request runs a full Prisma query even if data hasn't changed. Redis cache with TTL invalidation on write would reduce DB load significantly.
2. **In-memory rate limiter** — `express-rate-limit` stores counters in process memory. Behind multiple instances (e.g., multiple server pods), each has its own counter. Switch to `rate-limit-redis` with the existing Redis instance.
3. **Local disk as upload intermediary** — Multer stores files to `/uploads/` before uploading to Cloudinary. For production with multiple instances, this requires shared storage or switch to streaming upload.
4. **No full-text search index** — `contains` on VARCHAR fields does sequential scans at scale. Consider PostgreSQL `GIN` index on searchable fields or use `pg_trgm`.

### Caching strategy gap

The project has Redis running but only uses it for JTI blacklist and OTP. Adding:

- `QueryBuilder` cache decorator (Redis hash keyed by query hash)
- Cache invalidation on write operations (user update = bust user list cache)
  Would drastically reduce read load.

---

## 6. Security Architecture

### Trust boundaries

```
Client → [HTTPS] → Express (trust proxy=1) → [Helmet] → [CORS] → [Rate Limiter] → [Auth Guard] → [Validator] → Controller → Service → DB
                                                                                          ↓
                                                                                    Redis Blacklist
```

| Boundary         | Protection                                     | Assessment |
| ---------------- | ---------------------------------------------- | ---------- |
| Client → Server  | Helmet headers, CORS whitelist                 | ✅ Good    |
| Network layer    | trust proxy, rate limiting                     | ✅ Good    |
| Authn            | JWT (HS256), HttpOnly cookies, Bearer fallback | ✅ Good    |
| Authz            | Role hierarchy + permission check              | ✅ Good    |
| Token revocation | Redis JTI blacklist                            | ✅ Good    |
| Input validation | Zod schemas on body/query/params               | ✅ Good    |
| Password storage | bcryptjs with configurable salt                | ✅ Good    |
| File uploads     | Extension whitelist (image types only)         | ✅ Good    |
| Email anti-spam  | Redis cooldown keys (2 min)                    | ✅ Good    |
| Error exposure   | Stack traces in dev only                       | ⚠️ Partial |

### Authentication architecture

```
┌──────────────────────────────────────────────────────────────────┐
│  Client                           Server                         │
│   POST /auth/login  ──────────►  validateRequest()              │
│                                    auth.service.login()          │
│                                    createJwtPayload(user)        │
│                                    accessToken (15m)             │
│                                    refreshToken (7d)             │
│   ◄───────────────  Set-Cookie: accessToken (HttpOnly)          │
│   ◄───────────────  Set-Cookie: refreshToken (HttpOnly)         │
│                                                                    │
│   POST /auth/logout ──────────►  checkAuth('USER','ADMIN','SUPER_ADMIN')│
│   (cookie or Bearer)              blacklistTokens(req)           │
│                                    clearAuthCookies(res)         │
│                                                                    │
│   POST /auth/refresh-token ────►  auth.service.refreshToken()    │
│   (cookie or Bearer)              verifyToken(refreshToken)      │
│                                    check redis blacklist         │
│                                    checkUserStatus(user)         │
│                                    create new token pair         │
│                                    blacklist old tokens          │
└──────────────────────────────────────────────────────────────────┘
```

### Security assessment

**Strengths:**

- JWT with per-token JTI + Redis blacklist is a robust revocation approach
- Cookie-based auth with HttpOnly prevents XSS token theft
- bcryptjs with configurable salt rounds
- Cooldown on OTP and forgot-password prevents enumeration and spam
- Rate limiting on auth endpoints (5 req/15min in production)

**Improvements:**

- **CORS origin** — `env.corsOrigins` is an array but validated only for format, not content. If misconfigured to `*`, all origins allowed.
- **Auth limiter effectiveness** — `skipSuccessfulRequests: true` on auth limiter means brute-force guesses that succeed are not counted against the limit. Remove this flag.
- **CSRF** — No CSRF token mechanism. Since auth uses HttpOnly cookies, CSRF attacks could forge authenticated requests (like password change). Add `sameSite: 'strict'` on all cookies in production and/or use `csurf` middleware.
- **Rate limiter reset** — `express-rate-limit` resets on server restart (in-memory). Use `rate-limit-redis` for persistence.
- **Password reset token** — stored in URL sent to email. If email is intercepted, token can be used. Consider requiring email confirmation before reset completes, or using a short TTL (currently 15m with no reuse limit beyond blacklist).

---

## 7. Advanced Analysis

### Component testability

| Component                   | Testability | Reason                                                         |
| --------------------------- | ----------- | -------------------------------------------------------------- |
| Services                    | ⚠️ Medium   | Prisma and Redis are globals — require mocking at module level |
| controllers                 | ⚠️ Medium   | Coupled to services, req/res objects                           |
| middlewares                 | ⚠️ Medium   | checkAuth couples to jwt + redis + prisma in one function      |
| utils/                      | ✅ High     | Pure functions (hash, token, pick, exclude, parser)            |
| QueryBuilder                | ✅ High     | Pure class, Prisma delegate mockable                           |
| config/                     | ⚠️ Medium   | env.ts reads process.env — test isolation requires env reset   |
| middlewares/validateRequest | ✅ High     | Pure Zod parse, no side effects                                |

**Improvement:** Service testability can be improved without a DI framework by:

1. Making Prisma and Redis injectable via function arguments rather than global imports
2. Wrapping `config/prisma.ts` and `config/redis.ts` exports in factory functions

### Configuration management

- **Env validation:** Custom `getEnvVar` function with 4 value types. Works but reinvents Zod schemas for coercion.
- **Prisma config:** Uses Prisma 7's `prisma.config.ts` with `dotenv/config` — modern and correct.
- **Env examples:** `.env.example` is comprehensive and up to date with the codebase.

### Error handling assessment

- **Pattern:** Centralized `globalErrorHandler` with instanceof chain — good
- **Coverage:** Handles Zod, Prisma (4 subtypes), AppError, generic Error — comprehensive
- **Response format:** Consistent `{ success, statusCode, code, message, timestamp, path, errors }` — excellent
- **Stack traces:** Conditionally included in development mode only — correct

### Monitoring gaps

- No health check endpoint exposes Redis connectivity (only DB via `SELECT 1`)
- No structured audit log for critical operations (role changes, hard deletes, password resets)
- Winston logs to files only — no integration with external log aggregation
- No OpenTelemetry/metrics export

### Extensibility

- Adding a new module: Create `modules/<name>/` with standard files, register in `routes/index.ts` — straightforward
- Adding a new DB model: Add `.prisma` file in `prisma/models/`, run `pnpm db:generate` — straightforward
- Adding authentication provider (OAuth): Would need new auth provider logic, but the `AuthProvider` model already supports multiple providers (CREDENTIAL, GOOGLE, FACEBOOK, GITHUB)

---

## 8. Quality Assessment

### Code organization score: 8/10

- Consistent file naming per module (`*.controller.ts`, `*.service.ts`, `*.route.ts`, etc.)
- Co-located types, validation, constants
- 16 utility files in a flat `utils/` directory — some could be nested but acceptable for this size
- **`utils/httpStatus.ts` should be removed** — duplicates npm dependency

### Documentation adequacy: 7/10

- **Module READMEs:** Auth and user modules have co-located API reference docs — very good
- **Builder README:** 982 lines of detailed documentation — excellent
- **Root README:** Comprehensive overview — good
- **No inline code documentation** — consistent with the project's clean-code approach, but some complex logic (auth/utils.ts, builder/QueryBuilder.ts) would benefit from brief comments

### Technical debt

| Debt item                                            | Severity | Effort | Fix                                                           |
| ---------------------------------------------------- | -------- | ------ | ------------------------------------------------------------- |
| `utils/httpStatus.ts` duplicates npm package         | Medium   | Small  | Remove file, replace imports from `http-status-codes` package |
| No email provider abstraction                        | Medium   | Small  | Single `sendEmail` function with provider switch              |
| In-memory rate limiter (not shared across instances) | High     | Small  | Switch to `rate-limit-redis`                                  |
| No DB query cache                                    | High     | Medium | Add Redis cache layer to QueryBuilder                         |
| `skipSuccessfulRequests` on auth limiter             | Medium   | Tiny   | Remove the option flag                                        |
| `auth/utils.ts` mixed responsibilities               | Low      | Small  | Split into email.ts, token-blacklist.ts, otp.ts               |
| No CSRF protection                                   | Medium   | Medium | Add csurf middleware or tighten sameSite                      |
| No Redis health check in /health endpoint            | Low      | Tiny   | Add `redis.ping()` to health route                            |
| Utils `expiresInToMs` not colocated                  | Low      | Tiny   | Move to auth/utils.ts (only caller)                           |

### Improvement roadmap

**Phase 1 — Quick wins (1-2 hours)**

- Remove `utils/httpStatus.ts` and replace imports with `http-status-codes` package
- Remove `skipSuccessfulRequests` from auth rate limiter
- Add Redis ping to health check endpoint
- Tighten cookie `sameSite` to `strict` in production

**Phase 2 — Architecture hardening (1-2 days)**

- Abstract email sender into single `config/emailSender.ts`
- Split `auth/utils.ts` into focused modules
- Switch rate limiter to `rate-limit-redis`
- Move `expiresInToMs` to auth/utils.ts

**Phase 3 — Performance (2-3 days)**

- Add Redis caching layer to QueryBuilder (cache key = query hash, invalidate on write ops)
- Add PostgreSQL GIN index for full-text search on `email`, `username`, `firstName`, `lastName`
- Switch file upload to streaming (Multer memory storage → direct Cloudinary upload)

**Phase 4 — Observability (2-3 days)**

- Add OpenTelemetry metrics (request count, latency, error rate)
- Add structured audit logging for role/status changes
- Configure Winston transport for external log aggregation (ELK, DataDog, etc.)

---

## 9. Architecture Decision Records

### ADR-001: Dual token JWT with Redis blacklist

**Decision:** Access token (15m) + Refresh token (7d). Token revocation via JTI blacklist in Redis.

**Rationale:** Stateless tokens for performance, Redis for efficient revocation without DB queries. JTI ensures each token is uniquely identifiable.

**Trade-off:** Refresh endpoint is a bottleneck for every token rotation (2 Redis writes, 1 DB read).

### ADR-002: Feature modules with controller-service separation

**Decision:** Each module has a thin controller (no business logic), a service layer (orchestration), and utility files.

**Rationale:** Enables testing controllers independently, keeps business logic in one place, and standardizes the module pattern.

### ADR-003: Generic QueryBuilder

**Decision:** Fluent builder wrapping Prisma's `findMany` args, supporting search, filter, range, sort, offset/cursor pagination, projection.

**Rationale:** Eliminates repetitive query assembly across modules. Type-safe via Prisma generics. Single point of change for pagination behavior.

### ADR-004: Global error handler with instanceof dispatch

**Decision:** Single `globalErrorHandler` that classifies errors by type into structured responses.

**Rationale:** Consistent error format, centralized logging, avoids try/catch in every route. instanceof chain is simple and extensible.

---

## 10. Links

- **AGENTS.md** — Operational instructions for AI agents working in this repo
- **DB schema:** `prisma/models/user.prisma`, `prisma/models/enums.prisma`
- **Builder docs:** `src/app/builder/README.md`
- **Auth API:** `src/app/modules/auth/README.md`
- **User API:** `src/app/modules/user/README.md`
- **Test file:** `test-api.http`
