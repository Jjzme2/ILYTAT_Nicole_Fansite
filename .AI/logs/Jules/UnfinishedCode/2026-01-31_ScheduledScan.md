# Unfinished Code Report: 2026-01-31

## Summary
* **Total Items Found:** 5
* **High Priority:** 1

## Detailed Log

### pages/giveaways.vue:126
* **Type:** TODO
* **Snippet:** `hasEntered: false // TODO: Check if user already entered`
* **Analysis:** The `fetchGiveaways` function initializes `hasEntered` to `false` for every giveaway without checking the `entries` subcollection for the current user. This results in the UI always showing "Enter Now" even if the user has already entered, potentially allowing duplicate attempts or confusing the user.
* **Recommendation:** Update `fetchGiveaways` to query the `entries` subcollection (e.g., `collection($db, 'giveaways', doc.id, 'rounds', activeRound.id, 'entries')` where `userId` == `currentUser.uid`) to correctly populate `hasEntered`.
* **Severity:** High

### pages/creator.vue:1011
* **Type:** DEBUG
* **Snippet:** `// DEBUG: Identify user clearly`
* **Analysis:** The file contains multiple `console.log` statements prefixed with "DEBUG:" and comment markers intended for development debugging. These clutter the codebase and should not be in production.
* **Recommendation:** Remove the `// DEBUG:` comments and the associated `console.log` statements.
* **Severity:** Low

### components/SystemAnnouncer.vue:114
* **Type:** Empty Block
* **Snippet:** `} catch (e) {}`
* **Analysis:** The `catch` block in the `dismiss` function (and `onMounted`) silences errors when interacting with `localStorage`. While this prevents crashes if storage is disabled/full, it completely hides potential issues.
* **Recommendation:** Consider adding a debug log (e.g., `console.debug('Storage error:', e)`) or an explicit comment explaining why silence is preferred, to differentiate it from accidental omission.
* **Severity:** Low

### server/assets/email_templates/daily_report.html:93
* **Type:** NOTE
* **Snippet:** `<!-- NOTE: Triple braces required for Handlebars to render HTML -->`
* **Analysis:** A developer note explaining the use of triple braces for Handlebars HTML rendering.
* **Recommendation:** This is a helpful comment for maintainability. No action strictly needed, but flagged as part of the scan.
* **Severity:** Low

### pages/hub.vue:611
* **Type:** NOTE
* **Snippet:** `// NOTE: Firestore requires an index for 'type' ASC + 'created_at' DESC.`
* **Analysis:** A comment explaining Firestore indexing constraints and the fallback logic implemented in the code.
* **Recommendation:** Documentation only. Retain for context.
* **Severity:** Low
