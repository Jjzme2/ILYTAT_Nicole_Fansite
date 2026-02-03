## 2025-05-22 - Accessibility in Custom Media Controls
**Learning:** Custom media controls (like camera/video buttons) often rely entirely on visual shapes (circles, squares) and lack semantic meaning for screen readers.
**Action:** Always add aria-labels to custom shaped buttons that mimic physical controls (shutter buttons, record buttons).

## 2025-05-22 - Form Input Accessibility with useId
**Learning:** Vue 3.5+ `useId()` is perfect for generating stable, unique IDs for connecting inputs to labels and error messages (via `aria-describedby`), removing the need for manual ID prop threading.
**Action:** Default to `useId()` in form primitives if no ID is provided, and use it to link `label[for]`, `input[id]`, `input[aria-describedby]`, and error message IDs.
