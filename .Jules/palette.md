## 2024-05-22 - Accessibility in Custom Media Controls
**Learning:** Custom media controls (like camera/video buttons) often rely entirely on visual shapes (circles, squares) and lack semantic meaning for screen readers.
**Action:** Always add aria-labels to custom shaped buttons that mimic physical controls (shutter buttons, record buttons).

## 2026-01-25 - Automating Input Accessibility
**Learning:** Developers often skip associating labels with inputs because manual ID management is tedious. Vue 3.5's `useId()` makes this automatic and SSR-safe.
**Action:** Default to using `useId()` in all form primitives to guarantee label-to-input association without developer effort.
