## 2024-05-22 - Accessibility in Custom Media Controls
**Learning:** Custom media controls (like camera/video buttons) often rely entirely on visual shapes (circles, squares) and lack semantic meaning for screen readers.
**Action:** Always add aria-labels to custom shaped buttons that mimic physical controls (shutter buttons, record buttons).

## 2025-10-26 - Automatic Accessible IDs for Form Inputs
**Learning:** Manually pairing `label` and `input` with `for`/`id` attributes is frequently missed. Vue 3.5's `useId()` offers a robust, SSR-safe way to auto-generate these associations.
**Action:** Implement `useId()` fallback in base UI components (like `UiInput`) to ensure accessibility by default without requiring consumer boilerplate.
