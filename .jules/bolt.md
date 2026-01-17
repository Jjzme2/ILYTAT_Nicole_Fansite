## 2025-02-12 - Intl.DateTimeFormat Instantiation Cost
**Learning:** Instantiating `Intl.DateTimeFormat` inside a loop or frequent render function is significantly more expensive (~260x slower in synthetic benchmarks) than reusing a single instance.
**Action:** Always instantiate `Intl` formatters outside of loops/components or use memoization/const caching.
