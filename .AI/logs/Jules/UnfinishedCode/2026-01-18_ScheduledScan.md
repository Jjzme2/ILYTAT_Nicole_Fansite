# Unfinished Code Report: 2026-01-18

## Summary
* **Total Items Found:** 6
* **High Priority:** 0

## Detailed Log

### pages/giveaways.vue:126
* **Type:** TODO
* **Snippet:** `hasEntered: false // TODO: Check if user already entered`
* **Analysis:** The `hasEntered` status is hardcoded to `false`. This prevents the UI from correctly showing if a user has already entered a giveaway.
* **Recommendation:** Implement a query to the `entries` subcollection for the current user and round to populate this field dynamically.
* **Severity:** Low

### pages/admin.vue:1559
* **Type:** TODO
* **Snippet:** `to: 'nicole@ilytat.com', // TODO: Use config`
* **Analysis:** The email recipient is hardcoded.
* **Recommendation:** Use `useRuntimeConfig().public.adminEmail` or a similar configuration value to make this configurable.
* **Severity:** Low

### pages/hub.vue:542
* **Type:** NOTE
* **Snippet:** `// NOTE: Firestore requires an index for 'type' ASC + 'created_at' DESC.`
* **Analysis:** Documentation about a required Firestore composite index. If missing, the query will fail (though fallback logic exists).
* **Recommendation:** Verify the index exists in the Firebase Console.
* **Severity:** Low

### nuxt.config.ts:7
* **Type:** TODO
* **Snippet:** `id: 'G-XXXXXXXXXX' // TODO: Replace with actual Google Analytics ID`
* **Analysis:** The Google Analytics ID is a placeholder.
* **Recommendation:** Replace with the valid Measurement ID or load it from an environment variable (e.g., `NUXT_PUBLIC_GA_ID`).
* **Severity:** Low

### components/SystemAnnouncer.vue:53
* **Type:** Empty Block
* **Snippet:** `} catch (e) {`
* **Analysis:** Empty catch block swallowing errors when reading from `localStorage`.
* **Recommendation:** Add a comment explaining why errors are ignored, or log them with `console.debug`.
* **Severity:** Low

### components/SystemAnnouncer.vue:69
* **Type:** Empty Block
* **Snippet:** `} catch (e) {}`
* **Analysis:** Empty catch block swallowing errors when writing to `localStorage`.
* **Recommendation:** Add a comment explaining why errors are ignored, or log them with `console.debug`.
* **Severity:** Low
