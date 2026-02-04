# Pretty Logseq

A Logseq plugin for custom page preview popovers with rich property display.

## Features

- Custom hover previews for `[[page references]]`
- Displays page properties (type, status, description) in a card format
- Styled to match Logseq themes
- Lightweight and performant

## Installation

### From Source (Development)

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the plugin:
   ```bash
   npm run build
   ```
4. In Logseq:
   - Enable Developer Mode: Settings > Advanced > Developer mode
   - Load plugin: Plugins > Load unpacked plugin > Select this folder

### Development Mode

```bash
npm run dev
```

This watches for changes and rebuilds automatically. Reload the plugin in Logseq to see updates.

## Usage

Once installed, hover over any `[[page reference]]` to see the custom preview popover showing:
- Page title with icon (if set)
- Description property
- Type, status, and area as tags

## Configuration

(Coming soon) Settings to customize which properties are displayed and styling options.

## License

MIT
