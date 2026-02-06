## 2024-05-22 - Accessibility in Custom Media Controls
**Learning:** Custom media controls (like camera/video buttons) often rely entirely on visual shapes (circles, squares) and lack semantic meaning for screen readers.
**Action:** Always add aria-labels to custom shaped buttons that mimic physical controls (shutter buttons, record buttons).

## 2024-05-25 - Label Association in Reusable Components
**Learning:** Reusable input components (UiInput, UiTextarea) failed to associate labels with inputs because IDs were not automatically generated or linked.
**Action:** Use Vue's `useId()` and a reactive computed property to generate unique IDs for `for`/`id` attributes if not explicitly provided.
