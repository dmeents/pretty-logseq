# Research & Implementation Plan

This document contains research and implementation details for the Pretty Logseq plugin.

## Background

### Problem Statement

Logseq's default hover previews (powered by Tippy.js) show a block-based preview of page content. While functional, they:
- Cannot be customized to show specific properties prominently
- Don't provide a "card-like" summary view
- Are limited to CSS-only styling

### Goal

Create a plugin that provides rich, customizable hover popovers that display:
- Page icon and title
- Description property
- Key properties as tags (type, status, area)
- Styled consistently with Logseq themes

---

## Technical Research

### Logseq's Native Preview System

- Uses **Tippy.js** library for tooltips/popovers
- CSS classes: `.tippy-box`, `.tippy-content`, `.tippy-arrow`
- Content is loaded dynamically when hovering `.page-ref` elements
- Cannot inject custom content via CSS alone

### Plugin API Overview

Documentation: https://logseq.github.io/plugins/

#### Core Methods

```typescript
// Plugin lifecycle
logseq.ready(main)           // Called when plugin loads
logseq.beforeunload(cleanup) // Called before plugin unloads

// UI injection
logseq.provideStyle(css)     // Inject global CSS
logseq.provideUI(options)    // Inject HTML at DOM locations
logseq.showMainUI()          // Show plugin's main UI panel
logseq.hideMainUI()          // Hide plugin's main UI panel

// Data access
logseq.Editor.getPage(name)           // Get page by name
logseq.Editor.getPageBlocksTree(name) // Get page content
logseq.DB.datascriptQuery(query)      // Raw Datalog queries
```

#### Page Data Structure

```typescript
interface Page {
  id: number
  uuid: string
  name: string           // lowercase
  originalName: string   // preserved case
  properties?: {
    type?: string        // e.g., "[[Resource]]"
    status?: string      // e.g., "active"
    description?: string
    icon?: string
    // ... other custom properties
  }
  // ... other fields
}
```

### Event Handling Approaches

#### Option A: Event Delegation (Current Implementation)
```typescript
document.addEventListener('mouseover', (e) => {
  const pageRef = (e.target as HTMLElement).closest('.page-ref')
  if (pageRef) { /* handle hover */ }
})
```
**Pros:** Works with dynamically added elements, single listener
**Cons:** Runs on every mouseover event

#### Option B: MutationObserver + Direct Listeners
```typescript
const observer = new MutationObserver((mutations) => {
  // Find new .page-ref elements and attach listeners
})
observer.observe(document.body, { childList: true, subtree: true })
```
**Pros:** More targeted event handling
**Cons:** More complex, must manage listener cleanup

#### Option C: Logseq Event Hooks
The plugin API may provide hooks, but hover events aren't directly exposed. Would need to explore `logseq.App.onRouteChanged` and similar.

### Positioning Strategy

Popovers need smart positioning to stay visible:

```typescript
function positionPopover(anchor: HTMLElement, popover: HTMLElement) {
  const anchorRect = anchor.getBoundingClientRect()
  const popoverRect = popover.getBoundingClientRect()

  // Default: below and aligned left
  let top = anchorRect.bottom + 8
  let left = anchorRect.left

  // Flip above if not enough space below
  if (top + popoverRect.height > window.innerHeight) {
    top = anchorRect.top - popoverRect.height - 8
  }

  // Shift left if overflowing right
  if (left + popoverRect.width > window.innerWidth) {
    left = window.innerWidth - popoverRect.width - 16
  }

  popover.style.top = `${top}px`
  popover.style.left = `${left}px`
}
```

### Suppressing Native Previews

To fully replace (not just supplement) native previews:

#### CSS Approach
```css
/* Hide native Tippy popovers */
.tippy-box[data-theme="logseq"] {
  display: none !important;
}
```

#### JavaScript Approach
```typescript
// Intercept mouseenter on page-refs before Logseq handles it
document.addEventListener('mouseenter', (e) => {
  const pageRef = (e.target as HTMLElement).closest('.page-ref')
  if (pageRef) {
    e.stopPropagation() // May prevent native handler
  }
}, true) // Capture phase
```

---

## Implementation Plan

### Phase 1: Basic Popover (MVP) ✅
- [x] Project scaffold with Vite + TypeScript
- [x] Event delegation for hover detection
- [x] Fetch page data via `logseq.Editor.getPage()`
- [x] Render basic popover with title + description
- [x] Basic positioning (below anchor)
- [x] CSS styling with Logseq theme variables

### Phase 2: Enhanced Display
- [ ] Show page icon (handle Tabler icon unicode)
- [ ] Display properties as styled tags
- [ ] Handle pages without properties gracefully
- [ ] Truncate long descriptions with ellipsis
- [ ] Add subtle entrance/exit animations

### Phase 3: Polish & Edge Cases
- [ ] Smart positioning (flip when near edges)
- [ ] Handle rapid hover in/out (debouncing)
- [ ] Theme switching compatibility
- [ ] Performance optimization for large graphs
- [ ] Option to suppress native previews

### Phase 4: Configuration
- [ ] Settings UI for customization
- [ ] Choose which properties to display
- [ ] Customize popover appearance
- [ ] Enable/disable specific features

---

## Reference Plugins

These existing plugins provide useful patterns:

### logseq-plugin-link-preview
https://github.com/pengx17/logseq-plugin-link-preview

- Fetches external URL metadata and shows preview
- Good example of popover positioning
- Uses `logseq.provideUI()` for rendering

### logseq-awesome-ui
https://github.com/yoyurec/logseq-awesome-ui

- Comprehensive UI customization
- Shows how to inject and manage complex UI elements
- Theme-aware styling patterns

### logseq-plugin-sticky-popup
https://github.com/YU000jp/logseq-plugin-sticky-popup

- Creates movable/sticky popups
- Handles user interaction with popups
- Good drag/position management code

---

## API Reference Links

- Plugin API Docs: https://logseq.github.io/plugins/
- Plugin API Types: https://logseq.github.io/plugins/interfaces/ILSPluginUser.html
- Plugin Samples: https://github.com/logseq/logseq-plugin-samples
- Vite Plugin: https://github.com/logseq/vite-plugin-logseq

---

## Open Questions

1. **Native preview coexistence:** Should we hide native previews entirely or let them coexist? Hiding requires CSS or event interception.

2. **Performance at scale:** How does fetching page data on every hover perform with thousands of pages? May need caching.

3. **Block references:** Should we also handle `((block-references))` or just `[[page-refs]]`?

4. **Plugin settings persistence:** How to persist user preferences? Explore `logseq.settings` API.

5. **Icon rendering:** Logseq stores Tabler icons as Unicode PUA characters. Need to verify they render correctly in our popover or if we need special handling.
