# Unfinished Code Report: 2026-01-20

## Summary
* **Total Items Found:** 8
* **High Priority:** 5

## Detailed Log

### pages/giveaways.vue:126
* **Type:** TODO
* **Snippet:** `hasEntered: false // TODO: Check if user already entered`
* **Analysis:** The `fetchGiveaways` function currently hardcodes `hasEntered` to `false` for every campaign. This means the UI will always show the "Enter Now" button even if the user has already entered, allowing for duplicate entry attempts (which might be blocked by backend rules, but is bad UX) or just confusing the user.
* **Recommendation:** Implement a check to verify if the current user has an entry in the `giveaways/{id}/rounds/{roundId}/entries` subcollection. To avoid N+1 queries, fetch all user entries for active rounds in a single batch or separate query when the component mounts.
* **Severity:** High

### pages/admin.vue
* **Type:** HARDCODED_SECRET
* **Snippet:** `['nicole@ilytat.com', 'zettler.jj@ilytat.com'].includes(user.value?.email)`
* **Analysis:** Admin/Developer email addresses are hardcoded in the component logic to bypass permission checks or enable dev mode. This is security through obscurity and makes it hard to manage access control.
* **Recommendation:** Move these email addresses to `runtimeConfig` (e.g., `NUXT_PUBLIC_DEV_EMAILS` or `NUXT_ADMIN_EMAILS`) or use a proper role-based access control system (RBAC) checking the custom claims on the user token.
* **Severity:** High

### components/admin/SystemTests.vue
* **Type:** HARDCODED_SECRET
* **Snippet:** `['nicole@ilytat.com', 'zettler.jj@ilytat.com'].includes(user.value?.email)`
* **Analysis:** Same as above. Hardcoded email allowlist.
* **Recommendation:** Refactor to use a centralized permission check or config-based allowlist.
* **Severity:** High

### components/admin/EngineeringSection.vue
* **Type:** HARDCODED_SECRET
* **Snippet:** `['nicole@ilytat.com', 'zettler.jj@ilytat.com'].includes(user.value?.email)`
* **Analysis:** Same as above. Hardcoded email allowlist.
* **Recommendation:** Refactor to use a centralized permission check or config-based allowlist.
* **Severity:** High

### components/admin/DevTools.vue
* **Type:** HARDCODED_SECRET
* **Snippet:** `['nicole@ilytat.com', 'zettler.jj@ilytat.com'].includes(user.value?.email)`
* **Analysis:** Same as above. Hardcoded email allowlist.
* **Recommendation:** Refactor to use a centralized permission check or config-based allowlist.
* **Severity:** High

### components/SystemAnnouncer.vue:114
* **Type:** Empty Block
* **Snippet:** `} catch (e) {}`
* **Analysis:** The `dismiss` function silently catches errors when writing to `localStorage`. While this prevents the app from crashing if storage is disabled/full, it swallows potential debugging information.
* **Recommendation:** Add a `console.warn` or at least a comment explaining why the error is ignored (e.g., `// Ignore storage errors`).
* **Severity:** Low

### pages/creator.vue:1011
* **Type:** DEBUG
* **Snippet:** `// DEBUG: Identify user clearly`
* **Analysis:** Several `console.log` statements and comments labeled `DEBUG` are present in the code. These look like leftovers from development.
* **Recommendation:** Wrap these in `if (import.meta.dev) { ... }` or remove them if they are no longer needed.
* **Severity:** Low

### pages/hub.vue:611
* **Type:** NOTE
* **Snippet:** `// NOTE: Firestore requires an index for 'type' ASC + 'created_at' DESC.`
* **Analysis:** This is a documentation comment explaining a database constraint.
* **Recommendation:** Keep as is. It provides valuable context for future maintainers.
* **Severity:** Low
