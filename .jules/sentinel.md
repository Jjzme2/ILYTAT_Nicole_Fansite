## 2025-07-15 - [Critical] Unauthenticated Admin Migration Endpoint
**Vulnerability:** Found a public `POST /api/system/migrate` endpoint that allows database modification and privilege escalation (admin promotion) without authentication.
**Learning:** Utility/maintenance endpoints are often overlooked during security reviews because they are deemed "temporary" or "internal", but if exposed on the server API, they are public.
**Prevention:** Always apply authentication middleware or checks to ALL server API routes, especially those performing write operations or administrative tasks. Use a "deny by default" strategy.

## 2025-07-20 - [Critical] Migration Authentication Bypass Fixed
**Vulnerability:** Migration endpoints relied on `process.env.MIGRATION_SECRET` which was not exposed via `runtimeConfig`, causing it to be undefined in production. This potentially allowed authentication bypass if the attacker sent an empty or undefined bearer token, or made the endpoints unusable securely.
**Learning:** Nuxt 3 does not automatically expose arbitrary `process.env` variables at runtime. Secrets must be explicitly defined in `runtimeConfig`. Also, relying on `process.dev` for auth bypass is risky if environmental flags are misconfigured.
**Prevention:** Use `useRuntimeConfig().adminSecret` for all administrative endpoints. Ensure all secrets are defined in `nuxt.config.ts`.
## 2025-07-15 - [Medium] Unbounded Memory Growth in Cache
**Vulnerability:** Found usage of native `new Map()` for server-side caching of user profiles in `server/api/users/public.post.ts`. This allows attackers to exhaust server memory (DoS) by requesting random IDs.
**Learning:** Developers may use `Map` for quick caching solutions, forgetting that serverless/long-running node processes retain memory. Commented-out secure code (`lru-cache`) suggests intent was there but implementation lagged.
**Prevention:** Use `lru-cache` or Redis for any server-side caching. Enforce explicit `max` items and `ttl` (Time To Live) limits on all caches.

## 2026-01-20 - [Critical] Unauthenticated Quota Reset Endpoints
**Vulnerability:** Found `POST /api/messages/reset-all-quotas` and `POST /api/messages/reset-quota` endpoints that allowed resetting user messaging quotas without any authentication or authorization.
**Learning:** Admin-only tools created for "internal use" or convenience often lack security controls because developers assume they are hidden. Always verify auth on EVERY endpoint.
**Prevention:** Added `getUserFromEvent` check to ensure the caller has 'admin' or 'creator' role.
