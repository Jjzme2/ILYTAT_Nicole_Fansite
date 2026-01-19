# Unfinished Code Report: 2026-01-19

## Summary
* **Total Items Found:** 5
* **High Priority:** 1

## Detailed Log

### pages/giveaways.vue:126
* **Type:** TODO
* **Snippet:** `hasEntered: false // TODO: Check if user already entered`
* **Analysis:** The code presently defaults `hasEntered` to `false` for all giveaways, failing to check if the authenticated user has already participated in the active round. This allows potential double-entries and displays incorrect UI state ("Enter Now" instead of "Entered").
* **Recommendation:** Implement a Firestore query to check the `entries` subcollection for a document where `userId` matches the current user. Update the `hasEntered` state accordingly during the fetch process.
* **Severity:** High

### pages/admin.vue:1559
* **Type:** TODO
* **Snippet:** `to: 'nicole@ilytat.com', // TODO: Use config`
* **Analysis:** The recipient email for brand deal notifications is hardcoded. This limits flexibility and requires code changes to update the notification recipient.
* **Recommendation:** Move the email address to `runtimeConfig.public.adminEmail` or a private server-side config key, and reference it via `useRuntimeConfig()`.
* **Severity:** Low

### pages/hub.vue:542
* **Type:** NOTE
* **Snippet:** `// NOTE: Firestore requires an index for 'type' ASC + 'created_at' DESC.`
* **Analysis:** Highlights a specific Firestore indexing requirement for the query `where('type', '==', ...) .orderBy('createdAt', 'desc')`. The code includes a fallback mechanism, but the note indicates a potential optimization or setup step for the database.
* **Recommendation:** Ensure the composite index is created in the Firestore console to avoid client-side sorting fallbacks and improve performance.
* **Severity:** Low

### nuxt.config.ts:7
* **Type:** TODO
* **Snippet:** `id: 'G-XXXXXXXXXX' // TODO: Replace with actual Google Analytics ID`
* **Analysis:** The Google Analytics ID is currently a placeholder. This prevents valid analytics tracking.
* **Recommendation:** Replace the placeholder with the actual Measurement ID using an environment variable (e.g., `NUXT_PUBLIC_GTAG_ID`) to keep it configurable per environment.
* **Severity:** Low

### components/SystemAnnouncer.vue
* **Type:** Empty Catch Block
* **Snippet:** `} catch (e) {}`
* **Analysis:** `localStorage` access and JSON parsing are wrapped in empty try-catch blocks. While "quiet failure" is likely intended for non-critical local storage features, it suppresses potential errors that could be useful for debugging (e.g., QuotaExceededError).
* **Recommendation:** Add a `console.debug(e)` or a brief comment explaining why the error is suppressed to clarify intent and aid future debugging.
* **Severity:** Low
