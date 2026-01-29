## 2025-02-12 - Intl.DateTimeFormat Instantiation Cost
**Learning:** Instantiating `Intl.DateTimeFormat` inside a loop or frequent render function is significantly more expensive (~260x slower in synthetic benchmarks) than reusing a single instance.
**Action:** Always instantiate `Intl` formatters outside of loops/components or use memoization/const caching.

## 2025-02-12 - Firestore Batch Limits
**Learning:** Firestore `batch.commit()` fails if there are more than 500 operations in the batch.
**Action:** Always implement chunking (e.g., splitting into groups of 500) when performing bulk updates in server handlers.
