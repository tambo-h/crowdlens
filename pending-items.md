# Mobile UI & Accessibility — Pending Items

Based on our previous conversation, here's the status of all requested changes.

---

## Completed ✅

- [x] **Remove "Tambo AI / Ready to boost your productivity" message** from sidebar footer
  - Removed `<ApiKeyCheck>` block and its unused import from [page.tsx](file:///Users/apple/Documents/personal-workspace/crowdlens/crowdlens/src/app/page.tsx)

- [x] **CSS-level fix for hover-dependent actions on touch devices**
  - Added `@media (hover: none)` and `@media (max-width: 768px)` rules in [globals.css](file:///Users/apple/Documents/personal-workspace/crowdlens/crowdlens/src/app/globals.css)
  - Forces `opacity: 1` on all `group-hover:opacity-100` elements (edit, delete, options buttons)
  - Added `focus-visible` outline styles for keyboard accessibility

---

## Pending 🔲

### Hover → Tap Interaction Fixes (Component-level)

- [ ] **Skill Tracker** — [skill-tracker.tsx](file:///Users/apple/Documents/personal-workspace/crowdlens/crowdlens/src/components/productivity/skill-tracker.tsx)
  - [ ] Delete track button (line ~227): always visible on mobile, add `aria-label`
  - [ ] Challenge edit/delete buttons (line ~319): restructure to a mobile-friendly action row or long-press menu
  - [ ] Step edit/delete buttons (line ~487): same treatment
  - [ ] Resource delete button (line ~550): same treatment
  - [ ] Expanded detail panel padding too large on mobile (`px-12` → responsive `px-4 md:px-12`)

- [ ] **Link Card** — [link-card.tsx](file:///Users/apple/Documents/personal-workspace/crowdlens/crowdlens/src/components/productivity/link-card.tsx)
  - [ ] Delete button (line ~209): always visible or add swipe-to-delete on mobile
  - [ ] Grid layout: verify single-column on small screens (already `grid-cols-1 md:grid-cols-2`)

- [ ] **Thread History** — [thread-history.tsx](file:///Users/apple/Documents/personal-workspace/crowdlens/crowdlens/src/components/tambo/thread-history.tsx)
  - [ ] Options dropdown trigger (line ~606): always visible on mobile

### Mobile Layout & Readability

- [ ] **Chat side panel** — [chat-side-panel.tsx](file:///Users/apple/Documents/personal-workspace/crowdlens/crowdlens/src/components/tambo/chat-side-panel.tsx)
  - [ ] On mobile, panel should be full-screen overlay instead of side panel (currently `right-4 bottom-4` clipped)
  - [ ] Chat FAB button position may overlap content on small screens

- [ ] **Dashboard** — [productivity-dashboard.tsx](file:///Users/apple/Documents/personal-workspace/crowdlens/crowdlens/src/components/productivity/productivity-dashboard.tsx)
  - [ ] Large heading `text-4xl md:text-5xl` — verify readability on very small screens
  - [ ] Quick Actions grid: `grid-cols-2` can be tight; verify touch targets

- [ ] **Page layout** — [page.tsx](file:///Users/apple/Documents/personal-workspace/crowdlens/crowdlens/src/app/page.tsx)
  - [ ] Header content energy badge may overflow on very narrow screens
  - [ ] Sidebar nav items: verify touch target size (min 44×44px)

### Accessibility (a11y)

- [ ] Add `aria-label` to all icon-only buttons across components
- [ ] Ensure all interactive elements are keyboard-navigable (tab order)
- [ ] Add `role` attributes where needed (e.g., `role="dialog"` on chat panel)
- [ ] Verify color contrast ratios meet WCAG AA (especially muted text on light backgrounds)
- [ ] Add skip-to-content link for keyboard navigation

### Rendering Issues

- [ ] **Pomodoro Timer** — verify mobile rendering, centered layout
- [ ] **Creative components** (distraction journal, code snippets, standup, energy mapper, weekly review) — spot-check mobile layouts
- [ ] **Inspiration Quote** — long quotes may overflow on narrow screens; verify wrapping

---

> [!TIP]
> The CSS-only opacity fix handles the most critical gap (hidden actions on touch), but component-level changes will provide a more polished mobile experience.
