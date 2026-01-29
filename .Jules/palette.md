## 2024-05-22 - Accessibility in Custom Media Controls
**Learning:** Custom media controls (like camera/video buttons) often rely entirely on visual shapes (circles, squares) and lack semantic meaning for screen readers.
**Action:** Always add aria-labels to custom shaped buttons that mimic physical controls (shutter buttons, record buttons).

## 2025-02-20 - Accessible Form Inputs with useId
**Learning:** Vue 3.5+ `useId` simplifies generating unique IDs for form inputs and error messages, ensuring `for` and `aria-describedby` are always correctly linked without manual prop drilling.
**Action:** Default to `useId()` in form components to ensure accessibility out-of-the-box.
