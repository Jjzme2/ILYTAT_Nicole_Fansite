## 2024-05-22 - Accessibility in Custom Media Controls
**Learning:** Custom media controls (like camera/video buttons) often rely entirely on visual shapes (circles, squares) and lack semantic meaning for screen readers.
**Action:** Always add aria-labels to custom shaped buttons that mimic physical controls (shutter buttons, record buttons).

## 2025-01-23 - Toast Notification Accessibility
**Learning:** Toast notifications require specific ARIA roles to be announced correctly. `role="alert"` (assertive) for errors and `role="status"` (polite) for success/info messages ensures critical errors interrupt while updates wait.
**Action:** When implementing toast systems, dynamically assign roles based on message type rather than using a generic live region for the container.
