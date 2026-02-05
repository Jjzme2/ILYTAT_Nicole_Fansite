# Unfinished Code Report: 2026-02-05

## Summary
* **Total Items Found:** 5
* **High Priority:** 1

## Detailed Log

### pages/giveaways.vue:126
* **Type:** TODO
* **Snippet:** `hasEntered: false // TODO: Check if user already entered`
* **Analysis:** The `hasEntered` flag is hardcoded to `false` in the frontend, meaning the UI does not reflect whether a user has already entered a giveaway. The `enterGiveaway` function performs a write but does not check for existing entries, potentially allowing multiple entries via the UI state mismatch (though backend rules might prevent it, the UI is incomplete).
* **Recommendation:** Implement a check against the `entries` subcollection for the current user and round to populate `hasEntered` correctly during `fetchGiveaways`.

### pages/creator.vue:1011
* **Type:** DEBUG
* **Snippet:** `// DEBUG: Identify user clearly`
* **Analysis:** Development debug comment.
* **Recommendation:** Remove the comment and associated console logs.

### pages/creator.vue:1060
* **Type:** DEBUG
* **Snippet:** `// DEBUG: Check what ANY doc looks like to verify schema`
* **Analysis:** Development debug comment.
* **Recommendation:** Remove the comment and associated console logs.

### components/SystemAnnouncer.vue:114
* **Type:** Empty Block (catch)
* **Snippet:** `} catch (e) {}`
* **Analysis:** `localStorage` access is wrapped in an empty catch block to suppress errors. While intentional to avoid crashes if storage is disabled, it silences potential issues silently.
* **Recommendation:** Add a comment explaining why it is empty or add a `console.debug` for visibility.

### pages/hub.vue:611
* **Type:** NOTE
* **Snippet:** `// NOTE: Firestore requires an index for 'type' ASC + 'created_at' DESC.`
* **Analysis:** This is an informational note about Firestore indexing requirements. The code includes a fallback mechanism if the index is missing.
* **Recommendation:** None. This is valid documentation.
