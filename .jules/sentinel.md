## 2025-07-15 - [Critical] Unauthenticated Admin Migration Endpoint
**Vulnerability:** Found a public `POST /api/system/migrate` endpoint that allows database modification and privilege escalation (admin promotion) without authentication.
**Learning:** Utility/maintenance endpoints are often overlooked during security reviews because they are deemed "temporary" or "internal", but if exposed on the server API, they are public.
**Prevention:** Always apply authentication middleware or checks to ALL server API routes, especially those performing write operations or administrative tasks. Use a "deny by default" strategy.

## 2025-07-20 - [Critical] Migration Authentication Bypass Fixed
**Vulnerability:** Migration endpoints relied on `process.env.MIGRATION_SECRET` which was not exposed via `runtimeConfig`, causing it to be undefined in production. This potentially allowed authentication bypass if the attacker sent an empty or undefined bearer token, or made the endpoints unusable securely.
**Learning:** Nuxt 3 does not automatically expose arbitrary `process.env` variables at runtime. Secrets must be explicitly defined in `runtimeConfig`. Also, relying on `process.dev` for auth bypass is risky if environmental flags are misconfigured.
**Prevention:** Use `useRuntimeConfig().adminSecret` for all administrative endpoints. Ensure all secrets are defined in `nuxt.config.ts`.
