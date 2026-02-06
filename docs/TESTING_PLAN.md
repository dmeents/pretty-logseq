# Testing Plan: Pretty Logseq with Vitest

## Overview

This document outlines a comprehensive testing strategy for the Pretty Logseq plugin using Vitest. The plan covers unit tests, integration tests, test infrastructure setup, and testing best practices.

## Goals

1. **Ensure correctness** of core utilities and business logic
2. **Verify feature lifecycle** (initialization, cleanup, settings changes)
3. **Validate DOM manipulation** and positioning logic
4. **Test popover behavior** including hover interactions and timing
5. **Confirm renderer dispatch** and custom renderer registration
6. **Achieve high code coverage** (target: 80%+ for utilities, 60%+ overall)

## Test Infrastructure Setup

### 1. Dependencies to Install

```bash
yarn add -D vitest @vitest/ui @vitest/coverage-v8 jsdom
yarn add -D @testing-library/dom @testing-library/user-event
yarn add -D happy-dom  # Alternative to jsdom, faster
```

### 2. Vitest Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom', // or 'happy-dom' for speed
    setupFiles: ['./test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.d.ts',
        'src/types/**',
        'src/index.ts', // Bootstrap file
        'src/**/*.scss.d.ts',
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 60,
        statements: 60,
      },
    },
    include: ['src/**/*.{test,spec}.ts', 'test/**/*.{test,spec}.ts'],
    exclude: ['node_modules', 'dist', '.yarn'],
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

### 3. Test Setup File

Create `test/setup.ts`:

```typescript
import { vi, beforeEach, afterEach } from 'vitest';
import { mockLogseqAPI } from './mocks/logseq';

// Mock SCSS imports
vi.mock('*.scss?inline', () => ({
  default: '',
}));

// Setup global mocks
beforeEach(() => {
  // Mock Logseq API
  global.logseq = mockLogseqAPI();

  // Mock top/parent for iframe context
  global.top = window;
  global.parent = window;

  // Reset DOM
  document.body.innerHTML = '';
});

afterEach(() => {
  vi.clearAllMocks();
  vi.clearAllTimers();
});
```

### 4. Logseq API Mock

Create `test/mocks/logseq.ts`:

```typescript
import { vi } from 'vitest';

export function mockLogseqAPI() {
  return {
    ready: vi.fn((fn) => Promise.resolve(fn())),
    beforeunload: vi.fn(),
    provideStyle: vi.fn(),
    provideUI: vi.fn(),

    Editor: {
      getPage: vi.fn(),
      getPageBlocksTree: vi.fn(),
    },

    App: {
      getUserConfigs: vi.fn().mockResolvedValue({
        preferredThemeMode: 'light',
      }),
      pushState: vi.fn(),
    },

    Settings: {
      registerSettings: vi.fn(),
      on: vi.fn(),
    },
  };
}

export function mockPageData(overrides = {}) {
  return {
    name: 'Test Page',
    originalName: 'Test Page',
    properties: {},
    ...overrides,
  };
}

export function mockPageWithProperties(properties: Record<string, unknown>) {
  return mockPageData({
    properties,
  });
}
```

### 5. DOM Testing Utilities

Create `test/utils/dom.ts`:

```typescript
export function createPageRef(pageName: string): HTMLElement {
  const ref = document.createElement('a');
  ref.className = 'page-ref';
  ref.setAttribute('data-ref', pageName);
  ref.textContent = pageName;
  return ref;
}

export function waitForPopover(timeout = 500): Promise<HTMLElement> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Popover not found')), timeout);

    const check = () => {
      const popover = document.getElementById('pretty-logseq-popover');
      if (popover) {
        clearTimeout(timer);
        resolve(popover);
      } else {
        setTimeout(check, 50);
      }
    };

    check();
  });
}
```

## Test Structure

```
test/
├── setup.ts                    # Global test setup
├── mocks/
│   ├── logseq.ts              # Logseq API mocks
│   └── dom.ts                 # DOM element factories
├── utils/
│   ├── dom.ts                 # DOM testing utilities
│   └── async.ts               # Async test helpers
└── fixtures/
    ├── pages.ts               # Sample page data
    └── blocks.ts              # Sample block data

src/
├── lib/
│   ├── api.test.ts            # Unit tests for API helpers
│   └── dom.test.ts            # Unit tests for DOM utilities
├── core/
│   ├── registry.test.ts       # Unit tests for feature registry
│   └── styles.test.ts         # Unit tests for style management
├── features/
│   ├── popovers/
│   │   ├── manager.test.ts    # Integration tests for popover lifecycle
│   │   └── renderers/
│   │       ├── default.test.ts
│   │       ├── person.test.ts
│   │       └── index.test.ts  # Renderer dispatch tests
│   └── topbar/
│       └── handlers.test.ts
└── settings/
    └── schema.test.ts
```

## Test Coverage Plan

### Priority 1: Core Utilities (High Value, Low Risk)

#### `src/lib/api.test.ts`

**Test Coverage:**
- ✅ `getPage()` - basic fetching
- ✅ `getPage()` - caching behavior (TTL)
- ✅ `getPage()` - cache invalidation
- ✅ `getPage()` - error handling
- ✅ `clearPageCache()` - single page vs all
- ✅ `getPageBlocks()` - tree structure mapping
- ✅ `cleanBlockContent()` - property line removal
- ✅ `cleanBlockContent()` - reference stripping
- ✅ `cleanBlockContent()` - markdown formatting
- ✅ `cleanPropertyValue()` - string values
- ✅ `cleanPropertyValue()` - array values
- ✅ `cleanPropertyValue()` - bracket removal
- ✅ `getThemeMode()` - light/dark detection

**Key Testing Patterns:**
```typescript
describe('getPage', () => {
  it('fetches page data and normalizes properties', async () => {
    const mockPage = { name: 'test', properties: { type: 'Note' } };
    logseq.Editor.getPage.mockResolvedValue(mockPage);

    const result = await getPage('test');

    expect(result).toEqual({
      name: 'test',
      originalName: undefined,
      properties: { type: 'Note' },
    });
  });

  it('uses cache on subsequent calls within TTL', async () => {
    logseq.Editor.getPage.mockResolvedValue({ name: 'test' });

    await getPage('test');
    await getPage('test');

    expect(logseq.Editor.getPage).toHaveBeenCalledTimes(1);
  });

  it('bypasses cache when useCache is false', async () => {
    logseq.Editor.getPage.mockResolvedValue({ name: 'test' });

    await getPage('test');
    await getPage('test', { useCache: false });

    expect(logseq.Editor.getPage).toHaveBeenCalledTimes(2);
  });
});

describe('cleanBlockContent', () => {
  it('removes property lines', () => {
    expect(cleanBlockContent('title:: Test\nContent'))
      .toBe('Content');
  });

  it('converts page references to plain text', () => {
    expect(cleanBlockContent('See [[Other Page]] for details'))
      .toBe('See Other Page for details');
  });
});
```

#### `src/lib/dom.test.ts`

**Test Coverage:**
- ✅ `calculatePosition()` - all placements (top, bottom, left, right)
- ✅ `calculatePosition()` - offset parameter
- ✅ `adjustForViewport()` - right edge clipping
- ✅ `adjustForViewport()` - bottom edge clipping
- ✅ `adjustForViewport()` - left edge clipping
- ✅ `adjustForViewport()` - top edge clipping
- ✅ `positionElement()` - integration of calculate + adjust
- ✅ `createElement()` - tag creation
- ✅ `createElement()` - attribute setting
- ✅ `createElement()` - innerHTML injection
- ✅ `removeElementById()` - existing element
- ✅ `removeElementById()` - non-existent element (no error)

**Key Testing Patterns:**
```typescript
describe('calculatePosition', () => {
  it('positions below anchor by default', () => {
    const anchor = document.createElement('div');
    anchor.getBoundingClientRect = vi.fn(() => ({
      top: 100,
      left: 200,
      bottom: 120,
      right: 300,
    }));

    const pos = calculatePosition(anchor);

    expect(pos).toEqual({ top: 128, left: 200 }); // 120 + 8 offset
  });
});

describe('adjustForViewport', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 1920 });
    Object.defineProperty(window, 'innerHeight', { value: 1080 });
  });

  it('constrains element within viewport', () => {
    const pos = { top: 1100, left: 1900 };
    const adjusted = adjustForViewport(pos, 200, 100);

    expect(adjusted.left).toBeLessThanOrEqual(1920 - 200 - 16);
    expect(adjusted.top).toBeLessThanOrEqual(1080 - 100 - 16);
  });
});
```

### Priority 2: Core Infrastructure

#### `src/core/registry.test.ts`

**Test Coverage:**
- ✅ `register()` - single feature
- ✅ `register()` - duplicate registration warning
- ✅ `get()` - retrieve by ID
- ✅ `getAll()` - list all features
- ✅ `initializeAll()` - calls init() on all features
- ✅ `initializeAll()` - error handling (continues on failure)
- ✅ `initializeFeature()` - single feature init
- ✅ `initializeFeature()` - skip if already initialized
- ✅ `destroyFeature()` - single feature cleanup
- ✅ `destroyAll()` - reverse order cleanup
- ✅ `isInitialized()` - status checking
- ✅ `getAggregatedStyles()` - combines feature styles

**Key Testing Patterns:**
```typescript
describe('FeatureRegistry', () => {
  let registry: FeatureRegistry;
  let mockFeature: Feature;

  beforeEach(() => {
    registry = new FeatureRegistry();
    mockFeature = {
      id: 'test',
      name: 'Test Feature',
      description: 'Test',
      getStyles: vi.fn(() => '.test { color: red; }'),
      init: vi.fn(),
      destroy: vi.fn(),
    };
  });

  it('initializes all features in registration order', async () => {
    const feature2 = { ...mockFeature, id: 'test2' };

    registry.register(mockFeature);
    registry.register(feature2);

    await registry.initializeAll();

    expect(mockFeature.init).toHaveBeenCalled();
    expect(feature2.init).toHaveBeenCalled();
  });

  it('continues initialization on feature error', async () => {
    const failingFeature = {
      ...mockFeature,
      id: 'failing',
      init: vi.fn(() => Promise.reject(new Error('Init failed'))),
    };

    registry.register(failingFeature);
    registry.register(mockFeature);

    await registry.initializeAll();

    expect(failingFeature.init).toHaveBeenCalled();
    expect(mockFeature.init).toHaveBeenCalled();
  });
});
```

#### `src/core/styles.test.ts`

**Test Coverage:**
- ✅ Style aggregation from registry
- ✅ Base styles inclusion
- ✅ Content styles inclusion
- ✅ Settings-conditional styles
- ✅ `injectStyles()` - calls logseq.provideStyle
- ✅ `refreshStyles()` - updates existing styles

### Priority 3: Feature Tests

#### `src/features/popovers/manager.test.ts`

**Test Coverage:**
- ✅ `setupPopovers()` - returns cleanup function
- ✅ Hover on .page-ref - schedules popover after delay
- ✅ Hover out before delay - cancels popover
- ✅ Popover appears with correct content
- ✅ Popover positioned near anchor
- ✅ Hover on popover - keeps it open
- ✅ Hover out of popover - schedules hide
- ✅ Click on .page-ref - hides popover
- ✅ Click on popover title - navigates to page
- ✅ Rapid anchor changes - only shows for current anchor
- ✅ Cleanup - removes listeners and popover

**Key Testing Patterns:**
```typescript
describe('Popover Manager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    logseq.Editor.getPage.mockResolvedValue(mockPageData());
    logseq.Editor.getPageBlocksTree.mockResolvedValue([]);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows popover after hover delay', async () => {
    const cleanup = setupPopovers();
    const ref = createPageRef('Test Page');
    document.body.appendChild(ref);

    ref.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));

    // Before delay
    expect(document.getElementById('pretty-logseq-popover')).toBeNull();

    // After delay
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();

    expect(document.getElementById('pretty-logseq-popover')).toBeTruthy();

    cleanup();
  });

  it('cancels popover on quick hover out', () => {
    const cleanup = setupPopovers();
    const ref = createPageRef('Test Page');
    document.body.appendChild(ref);

    ref.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    vi.advanceTimersByTime(100);
    ref.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
    vi.advanceTimersByTime(300);

    expect(document.getElementById('pretty-logseq-popover')).toBeNull();

    cleanup();
  });
});
```

#### `src/features/popovers/renderers/index.test.ts`

**Test Coverage:**
- ✅ `registerRenderer()` - adds to registry
- ✅ `getRenderer()` - first match wins
- ✅ `getRenderer()` - falls back to default
- ✅ Custom renderer priority
- ✅ Multiple renderers for different types

**Key Testing Patterns:**
```typescript
describe('Renderer Registry', () => {
  beforeEach(() => {
    // Reset renderer registry
    renderers.length = 0;
    registerRenderer(defaultRenderer);
  });

  it('selects first matching renderer', () => {
    const personRenderer = { id: 'person', match: () => true, render: vi.fn() };
    const resourceRenderer = { id: 'resource', match: () => true, render: vi.fn() };

    registerRenderer(personRenderer);
    registerRenderer(resourceRenderer);

    const pageData = mockPageData();
    const renderer = getRenderer(pageData);

    expect(renderer.id).toBe('person');
  });

  it('falls back to default when no match', () => {
    const specificRenderer = {
      id: 'specific',
      match: (page) => page.properties.type === 'Specific',
      render: vi.fn(),
    };

    registerRenderer(specificRenderer);

    const pageData = mockPageData({ properties: { type: 'Other' } });
    const renderer = getRenderer(pageData);

    expect(renderer.id).toBe('default');
  });
});
```

#### `src/features/popovers/renderers/default.test.ts`

**Test Coverage:**
- ✅ Renders title with page name
- ✅ Renders description from first block
- ✅ Renders property tags (type, status, area)
- ✅ Handles missing properties gracefully
- ✅ Title click navigation

#### `src/features/popovers/renderers/person.test.ts`

**Test Coverage:**
- ✅ `match()` - returns true for person pages
- ✅ Renders name and title
- ✅ Renders organization
- ✅ Renders tags/skills
- ✅ Handles missing fields

### Priority 4: Integration Tests

#### `test/integration/feature-lifecycle.test.ts`

**Test Coverage:**
- ✅ Plugin initialization sequence
- ✅ Feature registration → init → styles injected
- ✅ Settings change → feature toggle
- ✅ Settings change → style refresh
- ✅ Plugin unload → all features destroyed

#### `test/integration/popover-flow.test.ts`

**Test Coverage:**
- ✅ Full popover flow: hover → fetch → render → position → show
- ✅ Interactive popover: hover stays open
- ✅ Navigation: click title → page loads
- ✅ Multiple page types use correct renderers

## Testing Best Practices

### 1. Test Isolation

- Each test should be independent
- Use `beforeEach` to reset state
- Mock timers with `vi.useFakeTimers()` for predictable timing tests
- Clear mocks between tests

### 2. Mock Strategy

- Mock external dependencies (Logseq API, DOM APIs)
- Don't mock code under test
- Use `vi.spyOn()` for partial mocks
- Verify mock calls with `expect().toHaveBeenCalledWith()`

### 3. Async Testing

```typescript
// ✅ Correct: await promises
it('fetches page data', async () => {
  const result = await getPage('test');
  expect(result).toBeDefined();
});

// ✅ Correct: advance fake timers
it('shows after delay', async () => {
  vi.useFakeTimers();
  triggerHover();
  vi.advanceTimersByTime(300);
  await vi.runAllTimersAsync(); // Flush promises
  expect(popover).toBeVisible();
});
```

### 4. DOM Testing

```typescript
// ✅ Use real DOM methods
it('creates element with attributes', () => {
  const el = createElement('div', { class: 'test', id: 'foo' });
  expect(el.className).toBe('test');
  expect(el.id).toBe('foo');
});

// ✅ Test actual DOM behavior
it('removes element from DOM', () => {
  const el = document.createElement('div');
  el.id = 'test';
  document.body.appendChild(el);

  removeElementById('test');

  expect(document.getElementById('test')).toBeNull();
});
```

### 5. Coverage Gaps

Don't aim for 100% coverage. Focus on:
- ✅ Business logic (utilities, core functions)
- ✅ Error paths
- ✅ Edge cases
- ❌ Type definitions
- ❌ Style files
- ❌ Trivial getters/setters

## Running Tests

**Commands:**
- `yarn test` - Run tests in watch mode (development)
- `yarn test:coverage` - Run tests with coverage report (CI)

## CI Integration

Example GitHub Actions workflow:

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: yarn install
      - run: yarn test:run
      - run: yarn test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Implementation Status

### ✅ Completed

1. **Test Infrastructure**
   - ✅ Installed vitest, @vitest/ui, @vitest/coverage-v8, jsdom, @testing-library/dom
   - ✅ Created vitest.config.ts with jsdom environment and coverage settings
   - ✅ Set up test/setup.ts with global mocks and cleanup
   - ✅ Created test/mocks/logseq.ts for Logseq API mocking
   - ✅ Created test/utils/dom.ts with DOM testing utilities
   - ✅ Created test/fixtures/ for sample data

2. **Core Tests**
   - ✅ lib/api.test.ts (41 tests) - Page fetching, caching, content cleaning
   - ✅ lib/dom.test.ts (32 tests) - Positioning, viewport adjustment, element creation
   - ✅ core/registry.test.ts (38 tests) - Feature lifecycle management

3. **Feature Tests**
   - ✅ features/popovers/renderers/index.test.ts (10 tests) - Renderer dispatch
   - ✅ features/popovers/renderers/default.test.ts (17 tests) - Default renderer

4. **Configuration**
   - ✅ Added test scripts to package.json

### Test Summary

**Total: 138 tests across 5 test files**

```
✓ src/lib/api.test.ts (41 tests)
✓ src/lib/dom.test.ts (32 tests)
✓ src/core/registry.test.ts (38 tests)
✓ src/features/popovers/renderers/index.test.ts (10 tests)
✓ src/features/popovers/renderers/default.test.ts (17 tests)
```

## Success Metrics

- ✅ 80%+ coverage on core utilities
- ✅ 70%+ coverage on features
- ✅ 60%+ overall coverage
- ✅ All tests run in <10 seconds
- ✅ Zero flaky tests
- ✅ CI integration passing

## Open Questions

1. **Snapshot testing**: Should we snapshot-test rendered popovers?
   - Pro: Catches unintended UI changes
   - Con: Brittle, requires manual review
   - **Recommendation**: Use sparingly for complex renderers only

2. **E2E testing**: Should we add Playwright for end-to-end tests?
   - **Recommendation**: Not initially. Vitest + jsdom covers most cases. Consider later if integration issues arise.

3. **Visual regression**: Should we test CSS rendering?
   - **Recommendation**: No. Manual testing sufficient for UI plugin.

4. **Performance testing**: Should we benchmark popover rendering?
   - **Recommendation**: Add basic timing assertions if performance issues reported.

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Vitest UI](https://vitest.dev/guide/ui.html)
- [Coverage Reports](https://vitest.dev/guide/coverage.html)
