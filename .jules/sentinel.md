## 2025-07-15 - [Critical] Unauthenticated Admin Migration Endpoint
**Vulnerability:** Found a public `POST /api/system/migrate` endpoint that allows database modification and privilege escalation (admin promotion) without authentication.
**Learning:** Utility/maintenance endpoints are often overlooked during security reviews because they are deemed "temporary" or "internal", but if exposed on the server API, they are public.
**Prevention:** Always apply authentication middleware or checks to ALL server API routes, especially those performing write operations or administrative tasks. Use a "deny by default" strategy.
