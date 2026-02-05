# Pretty Logseq

A Logseq plugin for frontend customizations. Provides custom page preview popovers, navigation styling, sidebar modifications, and content styling.

## Features

- **Custom hover popovers** for `[[page references]]` replacing Logseq's native previews
  - Page icon and title (clickable to navigate)
  - Description property
  - Property tags (type, status, area)
  - Pluggable renderer system for custom popover layouts
- **Theme-aware styling** using Logseq CSS variables (light and dark mode)
- **Top bar and sidebar customizations** via plugin settings
- **Content styling** for page properties and headers

## Installation

### From Source (Development)

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
   - Load plugin: Plugins > Load unpacked plugin > Select this project folder (not dist/)

### Development Mode

```bash
yarn dev
```

This watches for changes and rebuilds automatically. Reload the plugin in Logseq to see updates.

## Usage

Once installed, hover over any `[[page reference]]` to see a custom preview popover showing:
- Page title with icon (if set)
- Description property
- Type, status, and area as tags

Plugin settings are available in Logseq under Settings > Plugin Settings > Pretty Logseq for top bar and sidebar options.

## License

MIT
