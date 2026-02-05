# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Pretty Logseq** is a Logseq plugin for frontend customizations. It provides a modular system for custom popovers, navigation styling, sidebar modifications, and content styling.

## Tech Stack

- **Language:** TypeScript
- **Build:** Vite with vite-plugin-logseq
- **Styling:** SCSS (compiled via Vite)
- **Linting/Formatting:** Biome
- **Package Manager:** Yarn 4.x
- **Runtime:** Logseq Plugin API (@logseq/libs)

## Commands

```bash
# Install dependencies
yarn install

# Development (watch mode)
yarn dev

# Production build
yarn build

# Lint and format
yarn check        # Fix all issues
yarn lint         # Lint only
yarn format       # Format only
```

## Development Workflow

1. Run `yarn dev` to start watching for changes
2. In Logseq: Settings → Advanced → Developer mode (enable)
3. In Logseq: Plugins → Load unpacked plugin → Select this project folder (not dist/)
4. Changes auto-rebuild; reload plugin in Logseq to see updates

## Build Configuration

The plugin uses Vite with vite-plugin-logseq. Key points:

- **Entry point:** `index.html` in project root loads `src/index.ts`
- **Output:** `dist/index.html` + `dist/assets/index-*.js`
- **package.json main:** Must be `"dist/index.html"` (not .js)
- **@logseq/libs:** Must be bundled (NOT external) - the browser needs the library code to set up the global `logseq` object

```
Build output:
dist/
├── index.html           # Entry point Logseq loads
└── assets/
    └── index-*.js       # ESM bundle (~97 KB with @logseq/libs)
```

## Project Structure

```
pretty-logseq/
├── index.html            # Vite entry point (loads src/index.ts)
├── package.json          # Plugin manifest and dependencies
├── vite.config.ts        # Vite build configuration
├── biome.json            # Linting and formatting config
├── tsconfig.json         # TypeScript configuration
├── .yarnrc.yml           # Yarn 4 configuration
├── src/
│   ├── index.ts          # Bootstrap, feature registration
│   ├── types/            # TypeScript interfaces
│   │   ├── index.ts      # Re-exports
│   │   ├── feature.ts    # Feature interface
│   │   ├── logseq.ts     # PageProperties, etc.
│   │   └── scss.d.ts     # SCSS import declarations
│   ├── core/             # Core infrastructure
│   │   ├── registry.ts   # Feature lifecycle management
│   │   └── styles.ts     # Style aggregation and injection
│   ├── lib/              # Shared utilities
│   │   ├── dom.ts        # Positioning, element creation
│   │   └── api.ts        # Logseq API helpers with caching
│   ├── styles/           # Base and content styles (SCSS)
│   │   ├── base.scss     # CSS variables, resets
│   │   └── content.scss  # Page properties, headers
│   ├── settings/         # Plugin settings
│   │   └── schema.ts     # Settings UI schema and types
│   └── features/         # Feature modules
│       ├── popovers/     # Custom hover previews
│       │   ├── index.ts        # Feature entry point
│       │   ├── manager.ts      # Hover lifecycle, show/hide logic
│       │   ├── styles.scss     # Popover and native suppression styles
│       │   └── renderers/      # Pluggable popover content renderers
│       │       ├── index.ts    # Renderer registry and dispatcher
│       │       ├── types.ts    # PopoverRenderer interface
│       │       └── default.ts  # Default renderer (title, description, tags)
│       ├── topbar/       # Top navigation
│       ├── sidebar/      # Left sidebar
│       └── search/       # Search interface (placeholder)
├── dist/                 # Built output (gitignored)
└── docs/
    └── RESEARCH.md       # Research and implementation details
```

## Architecture

### Feature System

Each feature implements the `Feature` interface:

```typescript
interface Feature {
  id: string;
  name: string;
  description: string;
  getStyles(): string;
  init(): void | Promise<void>;
  destroy(): void;
}
```

Features are self-contained with their own styles, initialization, and cleanup.

### Popover Renderer System

Popovers use a pluggable renderer pattern. Each renderer decides whether it can handle a given page and builds the DOM content:

```typescript
interface PopoverRenderer {
  id: string;
  match(pageData: PageData): boolean;
  render(pageData: PageData): HTMLElement;
}
```

Renderers are checked in registration order (first match wins) with the default renderer as fallback. To add a custom renderer:

1. Implement `PopoverRenderer` in `src/features/popovers/renderers/`
2. Call `registerRenderer(myRenderer)` during feature init

The **default renderer** displays: page icon + title (clickable), description, and property tags (type, status, area).

The **popover manager** (`manager.ts`) handles the hover lifecycle: event delegation on `mouseenter` (capturing phase to intercept before Logseq), delayed show/hide with timers, viewport-aware positioning, and race condition prevention via anchor tracking.

### Adding a New Feature

1. Create a new directory under `src/features/`
2. Implement the `Feature` interface in `index.ts`
3. Add styles in `styles.scss` (imported with `?inline`)
4. Register the feature in `src/index.ts`

```typescript
// src/features/myfeature/index.ts
import type { Feature } from '../../types';
import styles from './styles.scss?inline';

export const myFeature: Feature = {
  id: 'myfeature',
  name: 'My Feature',
  description: 'Description of what it does',
  getStyles() { return styles; },
  init() { /* setup */ },
  destroy() { /* cleanup */ },
};
```

### Style Management

Styles use SCSS and are imported with Vite's `?inline` suffix to get compiled CSS as strings:

```typescript
import styles from './styles.scss?inline';
```

Styles are aggregated from three sources:
1. **Base styles** (`styles/base.scss`) - CSS variables, resets
2. **Content styles** (`styles/content.scss`) - Page properties, headers
3. **Feature styles** - Each feature's `getStyles()` return value

All styles are injected via a single `logseq.provideStyle()` call.

## Key Files

- **src/index.ts** - Plugin bootstrap, feature registration, settings change handling
- **src/core/registry.ts** - Feature lifecycle management
- **src/features/popovers/manager.ts** - Popover hover lifecycle (show/hide, timers, positioning)
- **src/features/popovers/renderers/** - Pluggable renderer system for popover content
- **src/lib/api.ts** - Page data fetching with 30s TTL cache, property value cleanup
- **src/lib/dom.ts** - Viewport-aware positioning, element creation helpers
- **src/settings/schema.ts** - Plugin settings schema and `PluginSettings` interface
- **src/styles/content.scss** - Content styling (page properties, headers)
- **docs/RESEARCH.md** - Background research and API reference

## Logseq Plugin API

Key methods used:

```typescript
// Inject CSS styles
logseq.provideStyle({ key: 'my-styles', style: cssString });

// Get page data including properties
const page = await logseq.Editor.getPage(pageName);

// Cleanup before unload
logseq.beforeunload(async () => { /* cleanup */ });
```

## Styling

Uses Logseq's CSS variables for theme compatibility:
- `--ls-primary-background-color`
- `--ls-border-color`
- `--ls-primary-text-color`
- `--ls-secondary-text-color`
- `--ls-tertiary-background-color`

## Testing

Manual testing:
1. Load plugin in Logseq (select project root folder, not dist/)
2. Verify popovers on `[[page references]]`
3. Verify content styles (page properties gradient, header margins)
4. Test plugin load/unload via developer console

## Related Repository

Works with the companion Logseq graph at `~/Documents/projects/logseq/`
