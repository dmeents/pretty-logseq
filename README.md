# Pretty Logseq

A Logseq plugin that enhances your graph's visual experience with beautiful custom popovers, refined styling, and flexible UI customizations — all fully theme-aware and configurable.

## Why Pretty Logseq?

Pretty Logseq improves your daily Logseq workflow with thoughtful visual enhancements:

- **Richer page previews** — See full context when hovering over page links, with smart type-specific layouts for people, resources, and more
- **Cleaner interface** — Streamline your workspace with customizable navigation and sidebar layouts
- **Better readability** — Enjoy polished styling for page properties, headers, tables, and templates
- **Your theme, enhanced** — Automatically adapts to your current theme (light or dark) while maintaining visual harmony

## Features

### Custom Page Popovers

Replace Logseq's basic page previews with rich, context-aware popovers when you hover over `[[page references]]`.

**Built-in renderers:**

- **Default** — Page icon, title, description, content preview, and property tags
- **Person** — Contact card layout with photo, name, role, organization, and contact details
- **Resource** — Compact card optimized for links, articles, and reference materials

The plugin automatically detects page types based on your properties and shows the most relevant layout.

### Content Styling

- **Page Properties** — Beautiful accent-bordered cards with styled keys and custom separators
- **Headers** — Clean hierarchy with smart spacing, no distracting borders
- **Tables** — Polished query result tables with themed headers, hover effects, and clean borders
- **Template Blocks** — Dimmed card styling that reveals on hover to reduce visual clutter

### Top Bar Customization

- Move navigation arrows from right to left
- Hide the Home button
- Hide the sync indicator

### Left Sidebar Customization

- **Compact Navigation** — Transform sidebar links into a space-saving icon bar
- Hide the Create button
- Move the graph selector to a fixed position at the bottom

## Installation

### From Logseq Marketplace

_(Coming soon — this plugin will be submitted to the Logseq marketplace)_

### From Source

1. Download or clone this repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Build the plugin:
   ```bash
   yarn build
   ```
4. In Logseq:
   - Go to **Settings → Advanced** and enable **Developer mode**
   - Go to **Plugins → Load unpacked plugin**
   - Select this project folder (the root folder, not `dist/`)

## Configuration

All features can be toggled on or off through Logseq's plugin settings:

**Settings → Plugin Settings → Pretty Logseq**

| Setting               | Default | Description                                               |
| --------------------- | ------- | --------------------------------------------------------- |
| Enable Popovers       | ✓       | Show custom hover popovers for page references            |
| Pretty Tables         | ✓       | Enhanced styling for query result tables                  |
| Pretty Templates      | ✓       | Dimmed card styling for template blocks with hover reveal |
| Compact Sidebar Nav   | ✓       | Convert sidebar navigation to inline icon bar             |
| Hide Create Button    | ✓       | Remove the Create button from the sidebar                 |
| Graph Selector Bottom | ✓       | Move graph selector to the bottom of the sidebar          |
| Hide Home Button      | ✓       | Remove the Home button from the top bar                   |
| Hide Sync Indicator   | ✓       | Remove the file sync indicator                            |
| Nav Arrows Left       | ✓       | Move back/forward arrows to the left side of the top bar  |

Changes take effect immediately — just toggle the setting you want to adjust.

## Usage Tips

- **Hover slowly** over page links to see the custom popovers (200ms delay prevents accidental triggers)
- **Use page properties** like `type:: person` or `type:: resource` to automatically get specialized popover layouts
- **Customize to taste** — all features are optional and can be mixed and matched through settings

## Support

- **Issues & Bug Reports:** [GitHub Issues](https://github.com/dmeents/pretty-logseq/issues)
- **Feature Requests:** Open an issue with your idea
- **Discussions:** [GitHub Discussions](https://github.com/dmeents/pretty-logseq/discussions)

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, architecture details, and guidelines.

## License

MIT — See [LICENSE](LICENSE) for details.

---

Made with ❤️ for the Logseq community
