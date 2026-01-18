## 2025-07-15 - [Critical] Unauthenticated Admin Migration Endpoint
**Vulnerability:** Found a public `POST /api/system/migrate` endpoint that allows database modification and privilege escalation (admin promotion) without authentication.
**Learning:** Utility/maintenance endpoints are often overlooked during security reviews because they are deemed "temporary" or "internal", but if exposed on the server API, they are public.
**Prevention:** Always apply authentication middleware or checks to ALL server API routes, especially those performing write operations or administrative tasks. Use a "deny by default" strategy.

## 2025-07-15 - [Medium] Unbounded Memory Growth in Cache
**Vulnerability:** Found usage of native `new Map()` for server-side caching of user profiles in `server/api/users/public.post.ts`. This allows attackers to exhaust server memory (DoS) by requesting random IDs.
**Learning:** Developers may use `Map` for quick caching solutions, forgetting that serverless/long-running node processes retain memory. Commented-out secure code (`lru-cache`) suggests intent was there but implementation lagged.
**Prevention:** Use `lru-cache` or Redis for any server-side caching. Enforce explicit `max` items and `ttl` (Time To Live) limits on all caches.
