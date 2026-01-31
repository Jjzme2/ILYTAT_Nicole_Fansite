## 2025-02-12 - Intl.DateTimeFormat Instantiation Cost
**Learning:** Instantiating `Intl.DateTimeFormat` inside a loop or frequent render function is significantly more expensive (~260x slower in synthetic benchmarks) than reusing a single instance.
**Action:** Always instantiate `Intl` formatters outside of loops/components or use memoization/const caching.

## 2025-02-12 - Firestore Unbounded Queries
**Learning:** Firestore queries for potentially unbounded collections (like notifications) must use `limit()` (e.g., `limit(50)`) to prevent performance degradation and excessive read costs.
**Action:** Always apply `limit()` to real-time listeners (`onSnapshot`) or queries unless you are implementing pagination or explicitly need all data.
