# Graph Report - pretty-logseq  (2026-07-19)

## Corpus Check
- 108 files · ~246,309 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 633 nodes · 1259 edges · 49 communities (45 shown, 4 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 37 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e4d26843`
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
- index.ts
- Project Documentation
- version.ts
- observer.ts
- biome.json
- Plugin Manifest
- getSettings
- index.ts
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
- logseq.ts
- source
- correctness
- index.ts
- index.ts

## God Nodes (most connected - your core abstractions)
1. `getParentDoc()` - 43 edges
2. `Feature` - 26 edges
3. `getPlatform()` - 23 edges
4. `getSettings()` - 19 edges
5. `renderPopover()` - 17 edges
6. `compilerOptions` - 16 edges
7. `cleanPropertyValue()` - 15 edges
8. `getVersion()` - 14 edges
9. `PageData` - 14 edges
10. `PluginSettings` - 13 edges

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

## Communities (49 total, 4 thin omitted)

### Community 0 - "External Links & Favicons"
Cohesion: 0.09
Nodes (39): cleanupAllLinks(), cleanupLink(), createFaviconImg(), createGlobeSvg(), decorateLink(), getFaviconUrl(), getRemoteFaviconUrl(), GLOBE_PATHS (+31 more)

### Community 1 - "Package Dependencies"
Cohesion: 0.04
Nodes (48): @biomejs/biome, jsdom, @logseq/libs, description, devDependencies, @biomejs/biome, jsdom, @logseq/libs (+40 more)

### Community 2 - "Platform Adapter & Page API"
Cohesion: 0.06
Nodes (44): PLATFORMS, setPlatformForTest(), Platform, PlatformApi, PlatformSelectors, PlatformTheme, v1Platform, V2_ACCENT_COLORS (+36 more)

### Community 3 - "Popover DOM Helpers"
Cohesion: 0.12
Nodes (34): cleanAllValues(), collectBlockText(), createAvatarSvg(), createDescription(), createDetailRow(), createRatingDisplay(), createTagPills(), createTitle() (+26 more)

### Community 4 - "Biome Formatter Config"
Cohesion: 0.20
Nodes (10): arrowParentheses, bracketSameLine, bracketSpacing, jsxQuoteStyle, quoteProperties, quoteStyle, semicolons, trailingCommas (+2 more)

### Community 5 - "Favorites Feature"
Cohesion: 0.14
Nodes (21): getObserverRoot(), getPlatform(), clearFavoritesCache(), favoritesCache, isFavorited(), refreshFavorites(), toggleFavorite(), favoritesFeature (+13 more)

### Community 6 - "Popover Hover Manager"
Cohesion: 0.16
Nodes (23): attachPopoverListeners(), cleanupPopoverListeners(), clearHideTimer(), clearShowTimer(), getPageNameFromRef(), getPopover(), hidePopover(), scheduleHide() (+15 more)

### Community 7 - "Biome Linter Rules"
Cohesion: 0.13
Nodes (15): recommended, recommended, rules, noBarrelFile, recommended, a11y, complexity, performance (+7 more)

### Community 8 - "TypeScript Compiler Config"
Cohesion: 0.07
Nodes (26): DOM, DOM.Iterable, ES2020, **/*.spec.ts, src, test, **/*.test.ts, vitest/globals (+18 more)

### Community 9 - "Version Detection & Platform Core"
Cohesion: 0.14
Nodes (17): popoversFeature, templatesFeature, mockDocument, mockHead, mockLinkElement, initSettings(), onSettingsChanged(), BooleanSettingKey (+9 more)

### Community 10 - "theme.ts"
Cohesion: 0.27
Nodes (11): registry, injectStyles(), refreshStyles(), generateThemeCSS(), getAccentColor(), isDarkTheme(), isUsableColor(), mixChannel() (+3 more)

### Community 11 - "Feature Registry"
Cohesion: 0.14
Nodes (5): FeatureRegistry, RegisteredFeature, ConfigurableFeature, Feature, FeatureSetting

### Community 12 - "index.ts"
Cohesion: 0.15
Nodes (14): sidebarTagsFeature, processTitle(), scanTitles(), setupSidebarTagObserver(), createNavItem(), makeSidebar(), unwrapAll(), applyBinding() (+6 more)

### Community 13 - "Project Documentation"
Cohesion: 0.20
Nodes (14): CLAUDE.md Project Instructions, Contributing Guide, Cross-Version Support (v1/v2), Feature Interface, Vite Entry index.html, MIT License, Logseq Plugin API, Platform Adapter (+6 more)

### Community 14 - "version.ts"
Cohesion: 0.18
Nodes (10): pickStyles(), applyVersionAttribute(), detectVersion(), getVersion(), probeDomVersion(), setVersionForTest(), strategy(), tagsFeature (+2 more)

### Community 15 - "observer.ts"
Cohesion: 0.26
Nodes (9): cleanupAll(), getOwnContentWrapper(), getTodayString(), hasActiveTaskMarker(), isPastDue(), processBlock(), processCancelledLabel(), scanBlocks() (+1 more)

### Community 16 - "biome.json"
Cohesion: 0.20
Nodes (9): javascript, linter, enabled, overrides, $schema, vcs, clientKind, enabled (+1 more)

### Community 17 - "Plugin Manifest"
Cohesion: 0.22
Nodes (8): author, description, effect, icon, repo, supportsDB, theme, title

### Community 18 - "getSettings"
Cohesion: 0.39
Nodes (5): todosFeature, TodosStrategy, todosV1, todosV2, getSettings()

### Community 19 - "index.ts"
Cohesion: 0.39
Nodes (3): createNavArrowsInLeft(), applyNavArrowsSetting(), topbarFeature

### Community 20 - "formatter"
Cohesion: 0.25
Nodes (8): formatter, attributePosition, enabled, formatWithErrors, indentStyle, indentWidth, lineEnding, lineWidth

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
Cohesion: 0.46
Nodes (4): propertiesFeature, PropertiesStrategy, propertiesV1, propertiesV2

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

### Community 38 - "includes"
Cohesion: 0.33
Nodes (6): files, ignoreUnknown, includes, **/*.js, **/*.json, **/*.ts

### Community 43 - "suspicious"
Cohesion: 0.33
Nodes (6): suspicious, noArrayIndexKey, noConsole, noEmptyBlock, noExplicitAny, recommended

### Community 44 - "logseq.ts"
Cohesion: 0.47
Nodes (3): mockLogseqAPI(), mockPageData(), mockPageWithProperties()

### Community 45 - "source"
Cohesion: 0.40
Nodes (5): source, assist, actions, level, organizeImports

### Community 46 - "correctness"
Cohesion: 0.50
Nodes (4): noUnusedImports, recommended, useExhaustiveDependencies, correctness

## Knowledge Gaps
- **187 isolated node(s):** `BindingAction`, `FEATURE_BINDINGS`, `BooleanSettingKey`, `SettingToggle`, `SettingGroup` (+182 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `getParentDoc()` connect `External Links & Favicons` to `Platform Adapter & Page API`, `Favorites Feature`, `Popover Hover Manager`, `theme.ts`, `version.ts`, `observer.ts`, `index.ts`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Why does `Feature` connect `Feature Registry` to `External Links & Favicons`, `Favorites Feature`, `Version Detection & Platform Core`, `version.ts`, `index.ts`, `index.ts`, `getSettings`, `index.ts`, `index.ts`?**
  _High betweenness centrality (0.023) - this node is a cross-community bridge._
- **What connects `BindingAction`, `FEATURE_BINDINGS`, `BooleanSettingKey` to the rest of the system?**
  _187 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `External Links & Favicons` be split into smaller, more focused modules?**
  _Cohesion score 0.08649912331969609 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._
- **Should `Platform Adapter & Page API` be split into smaller, more focused modules?**
  _Cohesion score 0.060515873015873016 - nodes in this community are weakly interconnected._
- **Should `Popover DOM Helpers` be split into smaller, more focused modules?**
  _Cohesion score 0.11733615221987315 - nodes in this community are weakly interconnected._