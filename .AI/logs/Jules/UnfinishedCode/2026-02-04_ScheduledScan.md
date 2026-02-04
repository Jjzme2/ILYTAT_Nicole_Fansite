# Unfinished Code Report: 2026-02-04

## Summary
* **Total Items Found:** 6
* **High Priority:** 1

## Detailed Log

### pages/giveaways.vue:126
* **Type:** TODO
* **Snippet:** `hasEntered: false // TODO: Check if user already entered`
* **Analysis:** The `hasEntered` status is currently hardcoded to `false`. This logic needs to check the `entries` subcollection in Firestore to prevent duplicate entries and show the correct UI state.
* **Recommendation:** Implement a check against the `entries` subcollection for the current user and round.
* **Severity:** High (Missing Logic/Broken Flow)

### components/SystemAnnouncer.vue:114
* **Type:** Structural / TODO
* **Snippet:** `catch (e) {}` and `// Limit size?`
* **Analysis:** The empty catch block is used to suppress errors when writing to `localStorage`, which is acceptable but technically an empty block. The comment suggests a need to limit the size of the dismissed messages array.
* **Recommendation:** Keep the empty catch as is (low priority). Implement a size limit for the `dismissed_messages` array in `localStorage` to prevent it from growing indefinitely.
* **Severity:** Low (Comment only)

### pages/creator.vue:1011
* **Type:** BUG (Debug)
* **Snippet:** `// DEBUG: Identify user clearly` and console logs
* **Analysis:** Several console logs prefixed with `DEBUG` were left in the code. These clutter the console and should be removed in production.
* **Recommendation:** Remove the `console.log` statements and the comments.
* **Severity:** Low (Cleanup)

### pages/hub.vue:611
* **Type:** NOTE
* **Snippet:** `// NOTE: Firestore requires an index for 'type' ASC + 'created_at' DESC.`
* **Analysis:** Documentation note explaining why client-side sorting/filtering might be used as a fallback.
* **Recommendation:** No action needed. Information only.
* **Severity:** Low (Comment only)

### server/assets/email_templates/daily_report.html:93
* **Type:** NOTE
* **Snippet:** `<!-- NOTE: Triple braces required for Handlebars to render HTML -->`
* **Analysis:** Documentation note for Handlebars usage.
* **Recommendation:** No action needed. Information only.
* **Severity:** Low (Comment only)

### server/utils/logger.ts:12
* **Type:** BUG (False Positive)
* **Snippet:** `console.log(\`[DEBUG]...`
* **Analysis:** The scan matched the string `[DEBUG]` as the keyword `BUG`. This is the logger utility itself.
* **Recommendation:** Ignore. This is a false positive.
* **Severity:** Low (False Positive)
