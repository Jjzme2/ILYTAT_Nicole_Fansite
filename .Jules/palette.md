## 2024-05-22 - Accessibility in Custom Media Controls
**Learning:** Custom media controls (like camera/video buttons) often rely entirely on visual shapes (circles, squares) and lack semantic meaning for screen readers.
**Action:** Always add aria-labels to custom shaped buttons that mimic physical controls (shutter buttons, record buttons).

## 2024-05-24 - Native Alerts vs. Toast Notifications
**Learning:** Using `alert()` disrupts the user flow by stealing focus and blocking interaction until dismissed, which feels jarring and "cheap."
**Action:** Replace `alert()` with non-blocking toast notifications (`useToast`) for feedback on async actions like uploads, maintaining a stable UI context.
