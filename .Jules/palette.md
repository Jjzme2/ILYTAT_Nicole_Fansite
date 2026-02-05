## 2024-05-22 - Accessibility in Custom Media Controls
**Learning:** Custom media controls (like camera/video buttons) often rely entirely on visual shapes (circles, squares) and lack semantic meaning for screen readers.
**Action:** Always add aria-labels to custom shaped buttons that mimic physical controls (shutter buttons, record buttons).

## 2024-05-23 - Invisible Focusable Elements
**Learning:** Action buttons hidden with `opacity-0 group-hover:opacity-100` are invisible to keyboard users when focused.
**Action:** Always append `focus:opacity-100` (or similar) to elements that use hover-reveal patterns to ensure they are visible when receiving keyboard focus.

## 2024-05-23 - Hover-Only Dropdowns
**Learning:** Dropdowns triggered solely by `group-hover` are inaccessible to keyboard users.
**Action:** Add `group-focus-within:block` (or `grid/flex`) to the dropdown container so tabbing into the trigger reveals the menu.
