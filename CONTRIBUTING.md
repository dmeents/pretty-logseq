# Contributing to Pretty Logseq

Thank you for your interest in contributing to Pretty Logseq! This guide will help you get started with development.

## Development Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm dev
   ```
4. In Logseq:
   - Enable Developer Mode: Settings > Advanced > Developer mode
   - Load plugin: Plugins > Load unpacked plugin > Select this project folder (not `dist/`)

Changes will auto-rebuild. Reload the plugin in Logseq to see updates.

## Tech Stack

- **Language:** TypeScript
- **Build:** Vite with vite-plugin-logseq
- **Styling:** SCSS (compiled via Vite)
- **Linting/Formatting:** Biome
- **Package Manager:** pnpm 10.x
- **Runtime:** Logseq Plugin API (@logseq/libs)

## Commands

```bash
pnpm install    # Install dependencies
pnpm dev        # Development (watch mode)
pnpm build      # Production build
pnpm check      # Lint and format (fix all issues)
pnpm lint       # Lint only
pnpm format     # Format only
```

## Architecture

The plugin uses a modular feature system. Each feature implements a `Feature` interface with its own styles, initialization, and cleanup. Features are managed by a central registry that handles lifecycle and style aggregation.

### Project Structure

```
src/
├── index.ts              # Bootstrap and feature registration
├── core/                 # Registry, styles, theme management
│   ├── registry.ts       # Feature lifecycle management
│   ├── styles.ts         # Style aggregation and injection
│   └── theme.ts          # Accent color generation and theme detection
├── features/
│   ├── popovers/         # Custom hover previews
│   │   ├── index.ts      # Feature entry point
│   │   ├── manager.ts    # Hover lifecycle (show/hide, timers, positioning)
│   │   ├── styles.scss   # Popover styles
│   │   └── renderers/    # Popover content rendering
│   │       ├── index.ts  # Re-exports renderPopover
│   │       ├── unified.ts    # Config-driven renderer for all page types
│   │       ├── type-config.ts # Property-driven popover config inference
│   │       └── helpers.ts    # Shared DOM helpers (title, tags, details)
│   ├── topbar/           # Top bar customizations
│   ├── sidebar/          # Left sidebar customizations
│   └── search/           # Search interface (placeholder)
├── lib/                  # Shared utilities
│   ├── api.ts            # Logseq API helpers with caching
│   └── dom.ts            # Positioning, element creation
├── settings/             # Plugin settings
│   └── schema.ts         # Settings UI schema and types
├── styles/               # Base and content styles (SCSS)
│   ├── base.scss         # CSS variables, resets
│   └── content.scss      # Page properties, headers, tables
└── types/                # TypeScript interfaces
    ├── feature.ts
    ├── logseq.ts
    └── scss.d.ts
```

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

Features are self-contained with their own styles, initialization, and cleanup logic.

#### Adding a New Feature

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

### Popover Renderer System

Popovers use a unified, config-driven renderer that adapts to any page type. The system has three layers:

- **`type-config.ts`** — Property-driven inference engine. Classifies property names into roles (subtitle, detail row, tag pill) using priority-ordered lists. `resolveConfig(pageData)` analyzes available properties and returns a `PopoverConfig`. No per-type configuration needed.
- **`helpers.ts`** — Shared DOM construction: title, description, tag pills, detail rows, smart property rendering (emails → links, URLs → formatted labels, ratings → stars).
- **`unified.ts`** — The renderer, which builds popovers through a section pipeline: header → description → snippet → details → array tags → link section → property tags.

#### Adding Support for New Properties

Properties are classified by name in `type-config.ts`:

- **`SUBTITLE_PRIORITY`** — First matching property becomes the subtitle (e.g., `role`, `cuisine`, `author`)
- **`DETAIL_PRIORITY`** — Properties shown as key-value rows (e.g., `rating`, `location`, `email`)
- **`TAG_PROPERTIES`** — Properties rendered as extra tag pills (e.g., `relationship`, `initiative`)
- **`MANAGED_PROPERTIES`** — Properties handled by dedicated sections (e.g., `type`, `url`, `photo`)

Array-valued properties are auto-detected and rendered as pill groups. Photos are auto-detected from the `photo` property. New page types work automatically — no config changes needed.

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

The plugin uses Logseq's CSS variables for theme compatibility:
- `--ls-primary-background-color`
- `--ls-border-color`
- `--ls-primary-text-color`
- `--ls-secondary-text-color`
- `--ls-tertiary-background-color`

### Theme System

The theme module automatically generates accent color CSS variables (`--pl-accent-*`) that adapt to light and dark modes. It watches for theme changes via MutationObserver and updates colors dynamically.

## Testing

Manual testing:
1. Load plugin in Logseq (select project root folder, not dist/)
2. Verify popovers on `[[page references]]`
3. Test all settings toggles
4. Verify content styles (page properties, headers, tables)
5. Test in both light and dark themes
6. Test plugin load/unload via developer console

## Build Configuration

The plugin uses Vite with vite-plugin-logseq. Key points:

- **Entry point:** `index.html` in project root loads `src/index.ts`
- **Output:** `dist/index.html` + `dist/assets/index-*.js`
- **package.json main:** Must be `"dist/index.html"` (not .js)
- **@logseq/libs:** Must be bundled (NOT external) - the browser needs the library code

Build output:
```
dist/
├── index.html           # Entry point Logseq loads
└── assets/
    └── index-*.js       # ESM bundle with @logseq/libs
```

## Logseq Plugin API

Key methods used:

```typescript
// Inject CSS styles
logseq.provideStyle({ key: 'my-styles', style: cssString });

// Get page data including properties
const page = await logseq.Editor.getPage(pageName);

// Register settings
logseq.useSettingsSchema(settingsSchema);

// Cleanup before unload
logseq.beforeunload(async () => { /* cleanup */ });
```

## Code Quality

- Run `pnpm check` before committing to fix linting and formatting issues
- Follow the existing code patterns and conventions
- Keep features self-contained and modular
- Add JSDoc comments for public APIs

## Questions?

For implementation details and research notes, see `docs/RESEARCH.md` and `CLAUDE.md`.
