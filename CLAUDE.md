# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Pretty Logseq** is a Logseq plugin that provides custom page preview popovers. Instead of Logseq's default Tippy.js-based hover previews, this plugin renders rich, customizable popovers that display page properties (type, status, description, etc.) in a styled format.

## Tech Stack

- **Language:** TypeScript
- **Build:** Vite with vite-plugin-logseq
- **Runtime:** Logseq Plugin API (@logseq/libs)

## Commands

```bash
# Install dependencies
npm install

# Development (watch mode)
npm run dev

# Production build
npm run build
```

## Development Workflow

1. Run `npm run dev` to start watching for changes
2. In Logseq: Settings > Advanced > Developer mode (enable)
3. In Logseq: Plugins > Load unpacked plugin > Select this project folder
4. Changes auto-rebuild; reload plugin in Logseq to see updates

## Project Structure

```
pretty-logseq/
├── package.json          # Plugin manifest and dependencies
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite build configuration
├── src/
│   └── index.ts          # Main plugin entry point
├── dist/                 # Built output (gitignored)
└── docs/
    └── RESEARCH.md       # Research and implementation details
```

## Key Files

- **src/index.ts** - Main plugin logic: hover listeners, page data fetching, popover rendering
- **docs/RESEARCH.md** - Background research, API reference, and implementation notes

## Logseq Plugin API

Key methods used in this plugin:

```typescript
// Inject CSS styles
logseq.provideStyle(cssString)

// Get page data including properties
const page = await logseq.Editor.getPage(pageName)
// page.properties contains { type, status, description, ... }

// Inject UI at specific DOM location (alternative approach)
logseq.provideUI({
  key: 'my-ui',
  path: '#target-element',
  template: '<div>Content</div>'
})
```

## Architecture Decisions

### Event Delegation
We use event delegation (listeners on `document`) rather than attaching to each `.page-ref` element. This handles dynamically added elements and is more performant.

### Direct DOM vs provideUI
The current implementation uses direct DOM manipulation for the popover rather than `logseq.provideUI()`. This gives us more control over positioning and lifecycle. Consider switching to `provideUI` if we need better integration with Logseq's UI lifecycle.

### Suppressing Native Previews
Currently this plugin shows popovers alongside native Tippy previews. To fully replace them, we may need to:
1. Use CSS to hide `.tippy-box` elements
2. Or intercept/prevent the native hover behavior

## Styling

The plugin injects its own CSS via `logseq.provideStyle()`. Styles use Logseq's CSS variables for theme compatibility:
- `--ls-primary-background-color`
- `--ls-border-color`
- `--ls-primary-text-color`
- `--ls-secondary-text-color`
- `--ls-tertiary-background-color`

## Testing

No automated tests currently. Manual testing:
1. Load plugin in Logseq
2. Hover over various `[[page references]]`
3. Verify popover shows with correct properties
4. Test edge cases: pages without properties, long descriptions, theme switching

## Related Repository

This plugin is designed to work with properties defined in a companion Logseq graph:
- `~/Documents/projects/logseq/` - Personal knowledge graph with custom properties system
- See that repo's `pages/Properties.md` for the property schema
