# Graph Report - pretty-logseq  (2026-07-19)

## Corpus Check
- 110 files · ~248,439 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 638 nodes · 1344 edges · 44 communities (40 shown, 4 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 38 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2838e366`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- External Links & Favicons
- Package Dependencies
- Platform Adapter & Page API
- Popover DOM Helpers
- Biome Formatter Config
- Favorites Feature
- Popover Hover Manager
- Biome Linter Rules
- TypeScript Compiler Config
- Version Detection & Platform Core
- theme.ts
- Feature Registry
- blocks.ts
- Project Documentation
- logseq.ts
- index.ts
- biome.json
- Plugin Manifest
- setVersionForTest
- getSettings
- formatter
- Brand Banner Imagery
- Codebase Popover Screenshot
- Person Popover Screenshot
- Resource Popover Screenshot
- Sidebar Screenshot
- Tables Screenshot
- Todos Screenshot
- CI & Coverage Config
- index.ts
- Logo Design Elements
- Default Popover Screenshot
- Properties Screenshot
- Narrow Banner Imagery
- Templates Screenshot
- No-Logo Banner Imagery
- Links Preview Screenshot
- Release Automation
- includes
- SCSS Type Declarations
- Dependabot Config
- suspicious

## God Nodes (most connected - your core abstractions)
1. `getParentDoc()` - 48 edges
2. `Feature` - 27 edges
3. `getPlatform()` - 23 edges
4. `getSettings()` - 22 edges
5. `getVersion()` - 17 edges
6. `renderPopover()` - 17 edges
7. `PluginSettings` - 16 edges
8. `compilerOptions` - 16 edges
9. `cleanPropertyValue()` - 15 edges
10. `setVersionForTest()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `CI Test Job` --shares_data_with--> `Codecov Coverage Config`  [INFERRED]
  .github/workflows/ci.yml → .codecov.yml
- `Release Workflow` --references--> `Changelog`  [INFERRED]
  .github/workflows/release.yml → CHANGELOG.md
- `pnpm Workspace Config` --conceptually_related_to--> `Vite + vite-plugin-logseq Build`  [INFERRED]
  pnpm-workspace.yaml → CLAUDE.md
- `CLAUDE.md Project Instructions` --references--> `Pretty Logseq Plugin`  [EXTRACTED]
  CLAUDE.md → README.md
- `Contributing Guide` --cites--> `CLAUDE.md Project Instructions`  [EXTRACTED]
  CONTRIBUTING.md → CLAUDE.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **CI Pipeline (lint, test, build)** — github_workflows_ci_workflow_lint_job, github_workflows_ci_workflow_test_job, github_workflows_ci_workflow_build_job [EXTRACTED 1.00]
- **Release & Dependency Automation** — github_workflows_release_workflow, github_workflows_dependabot_auto_merge_workflow, github_dependabot_config, changelog [INFERRED 0.75]

## Communities (44 total, 4 thin omitted)

### Community 0 - "External Links & Favicons"
Cohesion: 0.08
Nodes (44): cleanupAllLinks(), cleanupLink(), createFaviconImg(), createGlobeSvg(), decorateLink(), getFaviconUrl(), getRemoteFaviconUrl(), GLOBE_PATHS (+36 more)

### Community 1 - "Package Dependencies"
Cohesion: 0.04
Nodes (48): @biomejs/biome, jsdom, @logseq/libs, description, devDependencies, @biomejs/biome, jsdom, @logseq/libs (+40 more)

### Community 2 - "Platform Adapter & Page API"
Cohesion: 0.11
Nodes (29): v1Platform, { getPageV2, getPageBlocksV2, clearPageCacheV2, getThemeMode }, V2_ACCENT_COLORS, v2Platform, REF_TITLES, CacheEntry, cleanBlockContent(), clearPageCache() (+21 more)

### Community 3 - "Popover DOM Helpers"
Cohesion: 0.07
Nodes (46): PlatformApi, cleanAllValues(), collectBlockText(), createAvatarSvg(), createDescription(), createDetailRow(), createRatingDisplay(), createTagPills() (+38 more)

### Community 4 - "Biome Formatter Config"
Cohesion: 0.06
Nodes (36): source, assist, actions, files, ignoreUnknown, includes, formatter, arrowParentheses (+28 more)

### Community 5 - "Favorites Feature"
Cohesion: 0.26
Nodes (9): cleanupAll(), getOwnContentWrapper(), getTodayString(), hasActiveTaskMarker(), isPastDue(), processBlock(), processCancelledLabel(), scanBlocks() (+1 more)

### Community 6 - "Popover Hover Manager"
Cohesion: 0.16
Nodes (23): attachPopoverListeners(), cleanupPopoverListeners(), clearHideTimer(), clearShowTimer(), getPageNameFromRef(), getPopover(), hidePopover(), scheduleHide() (+15 more)

### Community 7 - "Biome Linter Rules"
Cohesion: 0.07
Nodes (27): recommended, recommended, noUnusedImports, recommended, useExhaustiveDependencies, linter, enabled, rules (+19 more)

### Community 8 - "TypeScript Compiler Config"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, ES2020, **/*.spec.ts, src, test, **/*.test.ts, vitest/globals (+18 more)

### Community 9 - "Version Detection & Platform Core"
Cohesion: 0.15
Nodes (15): contentFeature, tablesFeature, templatesFeature, initSettings(), onSettingsChanged(), BooleanSettingKey, buildSettingsSchema(), defaultSettings (+7 more)

### Community 10 - "theme.ts"
Cohesion: 0.13
Nodes (22): getObserverRoot(), getPlatform(), clearFavoritesCache(), favoritesCache, isFavorited(), refreshFavorites(), toggleFavorite(), favoritesFeature (+14 more)

### Community 11 - "Feature Registry"
Cohesion: 0.16
Nodes (3): FeatureRegistry, RegisteredFeature, Feature

### Community 12 - "blocks.ts"
Cohesion: 0.18
Nodes (13): PLATFORMS, setPlatformForTest(), pickStyles(), Platform, PlatformSelectors, PlatformTheme, detectVersion(), getVersion() (+5 more)

### Community 13 - "Project Documentation"
Cohesion: 0.20
Nodes (14): CLAUDE.md Project Instructions, Contributing Guide, Cross-Version Support (v1/v2), Feature Interface, Vite Entry index.html, MIT License, Logseq Plugin API, Platform Adapter (+6 more)

### Community 14 - "logseq.ts"
Cohesion: 0.47
Nodes (3): mockLogseqAPI(), mockPageData(), mockPageWithProperties()

### Community 15 - "index.ts"
Cohesion: 0.25
Nodes (12): registry, injectStyles(), refreshStyles(), applyVersionAttribute(), typographyFeature, applyBinding(), BindingAction, FEATURE_BINDINGS (+4 more)

### Community 16 - "biome.json"
Cohesion: 0.38
Nodes (9): detectAccentWhenReady(), generateThemeCSS(), getAccentColor(), isDarkTheme(), isUsableColor(), mixChannel(), parseRGB(), rgba() (+1 more)

### Community 17 - "Plugin Manifest"
Cohesion: 0.22
Nodes (8): author, description, effect, icon, repo, supportsDB, theme, title

### Community 18 - "setVersionForTest"
Cohesion: 0.20
Nodes (6): setVersionForTest(), propertiesFeature, sidebarTagsFeature, mockDocument, mockHead, mockLinkElement

### Community 19 - "getSettings"
Cohesion: 0.39
Nodes (5): todosFeature, TodosStrategy, todosV1, todosV2, getSettings()

### Community 20 - "formatter"
Cohesion: 0.39
Nodes (3): createNavArrowsInLeft(), applyNavArrowsSetting(), topbarFeature

### Community 21 - "Brand Banner Imagery"
Cohesion: 0.47
Nodes (6): Pretty Logseq Banner, Purple Cosmic Starfield Theme, Hexagon Graph-Node Logo, Knowledge Graph Visual Motif, Pretty Logseq Plugin, Pretty Logseq Wordmark

### Community 22 - "Codebase Popover Screenshot"
Cohesion: 0.33
Nodes (6): GitHub-style repo header (logseq, description, language tags), Pretty Logseq codebase popover screenshot, External repo link (logseq/logseq), Language/property tag pills (Clojure, JavaScript, Code Base, Active), Property-driven popover type inference, Unified config-driven popover renderer

### Community 23 - "Person Popover Screenshot"
Cohesion: 0.40
Nodes (6): Detail rows: Location, Email, Phone with smart property rendering, Header layout: circular avatar photo + title + subtitle role, Pretty Logseq person-page hover popover (Ken Follett), Property tag pills: Person, Friend (accent-colored), Person page-type property-driven config inference, Unified config-driven popover renderer

### Community 24 - "Resource Popover Screenshot"
Cohesion: 0.40
Nodes (6): Dark rounded bordered popover card, Description 'Type for documentation and reference pages', Config-driven page-reference hover popover feature, Pretty Logseq resource-type popover UI, Tag pills 'Resource' and 'Active', Popover header 'Resource' with icon

### Community 25 - "Sidebar Screenshot"
Cohesion: 0.47
Nodes (6): Compact left-sidebar navigation with accent-tinted icon buttons, Dark theme with purple accent color, Favorites section with starred pages (Tasks), Pretty Sidebar feature screenshot, Recent section listing recently visited pages with per-type icons, Top bar with back/forward nav arrows, menu, and search

### Community 26 - "Tables Screenshot"
Cohesion: 0.33
Nodes (6): Three-column layout: PAGE (sorted), STATUS, DESCRIPTION, Dark theme with purple accent link styling, Pretty Tables styled query-result table, Query header 'All Resources' with 52 results count and controls, Alternating zebra-striped rows with accent-colored page links, tables feature module (styled query-result tables)

### Community 27 - "Todos Screenshot"
Cohesion: 0.33
Nodes (6): Task blocks restyled as dark rounded cards with accent left-border, DEADLINE marker with date <2025-12-24 Wed>, Pretty Todos feature screenshot, Priority badges [#A] [#B] styled as pills, Task states: TODO, DONE (checked), CANCELLED, todos feature module

### Community 28 - "CI & Coverage Config"
Cohesion: 0.33
Nodes (6): Codecov Coverage Config, Codecov Coverage Flags (core/features/lib), CI Workflow, CI Build Job, CI Lint & Format Job, CI Test Job

### Community 29 - "index.ts"
Cohesion: 0.67
Nodes (3): PropertiesStrategy, propertiesV1, propertiesV2

### Community 30 - "Logo Design Elements"
Cohesion: 0.50
Nodes (5): Blue-Purple-Pink Gradient, Hexagonal Badge, Knowledge Graph Concept, Pretty Logseq Logo, Connected Node Graph Motif

### Community 31 - "Default Popover Screenshot"
Cohesion: 0.50
Nodes (5): Rounded dark popover card with accent left border, Custom hover popover feature for page references, Pretty Popover default hover preview screenshot, Content snippet body text (lorem ipsum) with fade truncation, Popover title 'The Philosophy of Lorem'

### Community 32 - "Properties Screenshot"
Cohesion: 0.60
Nodes (5): Purple accent theming on values and key labels, URL property rendered as icon + external link (Pretty Links), Properties feature: settings-driven styled page properties, Styled Property Block (bordered card, uppercase muted keys, accent divider, colored values), Pretty Properties Screenshot (Styled Page Properties)

### Community 33 - "Narrow Banner Imagery"
Cohesion: 0.67
Nodes (4): Pretty Logseq banner (narrow), Purple cosmic starfield brand aesthetic, Hexagonal node-graph logo mark, 'Pretty Logseq' wordmark

### Community 34 - "Templates Screenshot"
Cohesion: 0.83
Nodes (4): Dark rounded card styling with bullet dot, accent-colored values (Person, Active) and today macro, Pretty Templates feature screenshot (styled template blocks), person-template block: template properties (template, template-including-parent:false), Person property scaffold: type, icon, status, description, photo, relationship, role, organization, location, address, email, phone, created

### Community 35 - "No-Logo Banner Imagery"
Cohesion: 0.67
Nodes (3): Pretty Logseq banner (purple starfield nebula, no logo), Pretty Logseq branding / marketing banner asset, Purple/violet cosmic accent aesthetic

### Community 36 - "Links Preview Screenshot"
Cohesion: 1.00
Nodes (3): Pretty Links external-link hover preview card, External link labeled 'Github Repository' pointing to github.com/logseq/logseq, Rich link metadata card: hero image, title, description, favicon and URL

### Community 37 - "Release Automation"
Cohesion: 0.67
Nodes (3): Changelog, Release Please Action, Release Workflow

## Knowledge Gaps
- **187 isolated node(s):** `$schema`, `enabled`, `clientKind`, `useIgnoreFile`, `ignoreUnknown` (+182 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getParentDoc()` connect `External Links & Favicons` to `Favorites Feature`, `Popover Hover Manager`, `theme.ts`, `blocks.ts`, `index.ts`, `biome.json`, `formatter`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Why does `Feature` connect `Feature Registry` to `External Links & Favicons`, `Popover DOM Helpers`, `includes`, `Version Detection & Platform Core`, `theme.ts`, `suspicious`, `blocks.ts`, `index.ts`, `setVersionForTest`, `getSettings`, `formatter`, `index.ts`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `$schema`, `enabled`, `clientKind` to the rest of the system?**
  _187 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `External Links & Favicons` be split into smaller, more focused modules?**
  _Cohesion score 0.07787698412698413 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._
- **Should `Platform Adapter & Page API` be split into smaller, more focused modules?**
  _Cohesion score 0.10512820512820513 - nodes in this community are weakly interconnected._
- **Should `Popover DOM Helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.06829488919041157 - nodes in this community are weakly interconnected._