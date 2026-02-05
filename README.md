# Pretty Logseq

A Logseq plugin for frontend customizations. Provides custom page preview popovers with type-specific renderers, navigation and sidebar styling, and content formatting — all theme-aware and configurable through plugin settings.

## Features

### Custom Popovers

Replaces Logseq's native page preview popups with styled popovers when hovering over `[[page references]]`.

- **Default renderer** — page icon, clickable title, description, content snippet from page blocks, and property tags (type, status, area)
- **Person renderer** — contact-card layout with a prominent circular photo, name, role and organization subtitle, detail rows for location/email/phone, and relationship tag
- **Resource renderer** — compact card with title, description, and property tags
- **Pluggable renderer system** — add custom renderers for any page type by implementing the `PopoverRenderer` interface

### Content Styling

- **Page properties** — accent-bordered cards with styled property keys and custom separators
- **Headers** — clean headers with hierarchy-based spacing (no borders or underlines)
- **Tables** — query result tables with accent-themed headers, hover rows, and clean borders
- **Template blocks** — dimmed card styling for template content with hover reveal

### Top Bar

- **Move navigation arrows** — relocate back/forward nav arrows from the right side to the left
- **Hide home button** — remove the Home button from the top bar
- **Hide sync indicator** — remove the file sync indicator

### Left Sidebar

- **Compact navigation** — converts sidebar nav items into a compact inline icon bar
- **Hide create button** — remove the Create button
- **Graph selector at bottom** — move the graph selector to a fixed position at the bottom of the sidebar

### Theme Support

Automatically detects Logseq's theme and generates a set of accent color CSS variables (`--pl-accent-*`) that adapt to light and dark modes. Watches for theme changes via MutationObserver.

## Settings

All features are configurable through Logseq's plugin settings (Settings > Plugin Settings > Pretty Logseq):

| Setting | Default | Description |
|---|---|---|
| Enable Popovers | On | Custom hover popovers for page references |
| Pretty Tables | On | Styled query result tables |
| Pretty Templates | On | Dimmed card styling for template blocks |
| Compact Sidebar Nav | On | Inline icon bar for sidebar navigation |
| Hide Create Button | Off | Hide the Create button in the sidebar |
| Graph Selector Bottom | Off | Move graph selector to sidebar bottom |
| Hide Home Button | Off | Hide the Home button in the top bar |
| Hide Sync Indicator | Off | Hide the file sync indicator |
| Nav Arrows Left | Off | Move back/forward arrows to the left side of the top bar |

## Installation

### From Source

1. Clone this repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Build the plugin:
   ```bash
   yarn build
   ```
4. In Logseq:
   - Enable Developer Mode: Settings > Advanced > Developer mode
   - Load plugin: Plugins > Load unpacked plugin > Select this project folder (not `dist/`)

### Development

```bash
yarn dev
```

Watches for changes and rebuilds automatically. Reload the plugin in Logseq to see updates.

## Tech Stack

- TypeScript, SCSS, Vite with vite-plugin-logseq
- Biome for linting and formatting
- Yarn 4.x

## Commands

```bash
yarn install    # Install dependencies
yarn dev        # Development (watch mode)
yarn build      # Production build
yarn check      # Lint and format (fix all issues)
yarn lint       # Lint only
yarn format     # Format only
```

## Architecture

The plugin uses a modular feature system. Each feature implements a `Feature` interface with its own styles, initialization, and cleanup. Features are managed by a central registry that handles lifecycle and style aggregation.

Popovers use a pluggable renderer pattern — renderers are checked in registration order (first match wins) with the default renderer as fallback. To add a renderer for a new page type, implement the `PopoverRenderer` interface and register it during feature init.

```
src/
├── index.ts              # Bootstrap and feature registration
├── core/                 # Registry, styles, theme management
├── features/
│   ├── popovers/         # Custom hover previews
│   │   ├── manager.ts    # Hover lifecycle (show/hide, timers, positioning)
│   │   └── renderers/    # Default, Person, Resource renderers
│   ├── topbar/           # Navigation arrow repositioning
│   └── sidebar/          # Sidebar customizations
├── lib/                  # API helpers (caching), DOM utilities
├── settings/             # Plugin settings schema
├── styles/               # Base and component SCSS
└── types/                # TypeScript interfaces
```

## License

MIT
