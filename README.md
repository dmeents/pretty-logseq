![Pretty Logseq Banner](assets/logos/pretty-logseq-banner-narrow.png)

![version](https://img.shields.io/github/package-json/v/dmeents/pretty-logseq)
[![codecov](https://codecov.io/gh/dmeents/pretty-logseq/graph/badge.svg)](https://codecov.io/gh/dmeents/pretty-logseq)

# Pretty Logseq

A Logseq plugin that enhances your graph's visual experience with beautiful custom popovers, refined styling, and flexible UI customizations — all fully theme-aware and configurable.

## Why Pretty Logseq?

Pretty Logseq improves your daily Logseq workflow with thoughtful visual enhancements:

- **Richer page previews** — See full context when hovering over page links, with smart type-specific layouts for people, resources, and more
- **Enhanced typography** — Refined font styling, spacing, and visual hierarchy that makes your content easier to scan and more pleasant to read
- **Cleaner interface** — Streamline your workspace with customizable navigation and sidebar layouts
- **Smarter visual design** — Polished styling for page properties, headers, tables, todos, and templates that brings clarity to every element
- **Better link styling** — Page references and external links stand out with subtle, theme-aware styling that improves navigation
- **Your theme, enhanced** — Automatically adapts to your current theme (light or dark) while maintaining visual harmony

## Features

### Pretty Popovers

| Description                                                                                                                                                                                                                                                                                                                            | Preview                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Stop scrolling through cluttered page link previews. Get **rich, context-aware popovers** that show you what matters before you click.<br><br>Popovers automatically adapt to whatever properties your pages have — add a `photo::`, `rating::`, `description::`, or any other property and it just shows up. No configuration needed. | ![Person Popover](assets/screenshots/pretty-popover-person.png) |

### Pretty Links

| Description                                                                                                                                                                                                                                                                                                                     | Preview                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Transform your external urls from plain text into **visually distinct, styled links** that make your graph easier to scan and navigate. Links stand out with subtle styling that respects your theme while improving readability. Makes it effortless to spot references, external links, and internal connections at a glance. | ![Pretty Links](assets/screenshots/pretty-links.png) |

### Pretty Properties

| Description                                                                                                                                                                                                                                                                                                                                            | Preview                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- |
| Say goodbye to cluttered property lists. Get **beautifully styled property cards** with accent borders, clean typography, and visual hierarchy that makes metadata actually readable. Properties become a joy to read instead of visual noise. Keys are clearly distinguished from values, and the entire block integrates seamlessly with your theme. | ![Pretty Properties](assets/screenshots/pretty-properties.png) |

### Pretty SideBar

| Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Preview                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| Reclaim precious screen space with **compact icon-based navigation** that keeps everything accessible without the clutter. The sidebar transforms from a text-heavy panel into a streamlined command center.<br><br>Features include:<br>• **Icon-only navigation** for maximum space efficiency<br>• **Bottom-pinned graph selector** that stays out of your way<br>• **Hidden Create button** to reduce visual noise<br>• All functionality preserved, zero friction added | ![Pretty Sidebar](assets/screenshots/pretty-sidebar.png) |

### Pretty Todos

| Description                                                                                                                                                                                                                                                                                                                           | Preview                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Keep your task lists clean and actionable with **enhanced TODO styling** that brings visual clarity to your workflow. Priorities, statuses, and deadlines become instantly scannable. Your task management gets an upgrade with color-coded priorities, clear status indicators, and typography that helps you focus on what matters. | ![Pretty Todos](assets/screenshots/pretty-todos.png) |

### Pretty Templates

| Description                                                                                                                                                                                                                                                                                                                                                                          | Preview                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ |
| Stop letting template blocks clutter your view. Get **dimmed, card-styled templates** that fade into the background until you need them — then reveal on hover when you're ready to use them. Templates stay accessible but don't compete for attention with your actual content. Perfect for keeping your pages clean while maintaining quick access to frequently-used structures. | ![Pretty Templates](assets/screenshots/pretty-templates.png) |

### Pretty Tables

| Description                                                                                                                                                                                                                                                                                                                                                                                                             | Preview                                                |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Query results deserve better. Get **polished, professional tables** with themed headers, smooth hover effects, and clean borders that make data actually readable.<br><br>Transform raw query output into presentation-ready tables with:<br>• Styled headers with subtle backgrounds<br>• Row hover effects for better scanning<br>• Clean borders that guide your eye<br>• Consistent theming that matches your graph | ![Pretty Tables](assets/screenshots/pretty-tables.png) |

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

All features can be toggled on or off through Logseq's plugin settings. Changes take effect immediately — just toggle the setting you want to adjust.

## Usage Tips

- **Hover** over page links to see the custom popovers (200ms delay prevents accidental triggers)
- **Use page properties** like `type:: Person` or `type:: Code Base` to automatically get contextual popover layouts
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
