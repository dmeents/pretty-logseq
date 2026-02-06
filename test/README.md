# Testing Guide

## Overview

This project uses [Vitest](https://vitest.dev/) for unit and integration testing. The test suite covers core utilities, infrastructure, and feature implementations.

## Running Tests

```bash
# Run tests in watch mode (development)
yarn test

# Run tests with coverage report (CI)
yarn test:coverage
```

## Test Structure

```
test/
├── fixtures/        # Sample data for tests
│   ├── blocks.ts   # Block data fixtures
│   └── pages.ts    # Page data fixtures
├── mocks/          # Mock implementations
│   └── logseq.ts   # Logseq API mocks
├── utils/          # Test utilities
│   └── dom.ts      # DOM testing helpers
└── setup.ts        # Global test setup

src/
├── lib/
│   ├── api.test.ts        # 41 tests - API helpers
│   └── dom.test.ts        # 32 tests - DOM utilities
├── core/
│   └── registry.test.ts   # 38 tests - Feature registry
└── features/popovers/renderers/
    ├── index.test.ts      # 10 tests - Renderer dispatch
    └── default.test.ts    # 17 tests - Default renderer
```

## Coverage Summary

**Total: 138 tests**

| Module | Coverage | Description |
|--------|----------|-------------|
| `lib/api.ts` | 100% | Page fetching, caching, content cleaning |
| `lib/dom.ts` | 95% | Positioning, viewport adjustment |
| `core/registry.ts` | 100% | Feature lifecycle management |
| `features/popovers/renderers/` | 98%+ | Popover rendering system |

**Overall Coverage:** ~21% (focused on core utilities)

## Test Categories

### Unit Tests

**lib/api.test.ts** - Logseq API wrappers
- Page fetching with caching (30s TTL)
- Cache invalidation
- Block content cleaning
- Property value normalization
- Theme mode detection

**lib/dom.test.ts** - DOM manipulation
- Position calculation (top, bottom, left, right)
- Viewport boundary adjustment
- Element creation and removal
- Position element integration

**core/registry.test.ts** - Feature management
- Feature registration and retrieval
- Initialization lifecycle
- Destruction and cleanup
- Style aggregation
- Error handling

### Integration Tests

**features/popovers/renderers/index.test.ts** - Renderer dispatch
- Renderer registration
- Match-based selection
- Default fallback
- Priority ordering

**features/popovers/renderers/default.test.ts** - Default renderer
- Title rendering with icons
- Description from properties
- Snippet extraction from blocks
- Property tag rendering
- Content truncation

## Writing Tests

### Example Test Structure

```typescript
import { describe, expect, it, vi } from 'vitest';
import { mockPageData } from '../../../test/mocks/logseq';

describe('MyFeature', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('does something specific', () => {
    const input = mockPageData();
    const result = myFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Using Mocks

```typescript
// Mock Logseq API
logseq.Editor.getPage.mockResolvedValue({ name: 'test', properties: {} });

// Mock page data
const page = mockPageData({ name: 'Test Page' });
const pageWithProps = mockPageWithProperties({ type: 'Note' });

// Mock DOM elements
const anchor = createMockAnchor({ top: 100, left: 200 });
```

### Testing Async Code

```typescript
it('fetches data', async () => {
  const result = await getPage('test');
  expect(result).toBeDefined();
});
```

### Testing Timers

```typescript
it('delays execution', async () => {
  vi.useFakeTimers();

  const callback = vi.fn();
  setTimeout(callback, 1000);

  vi.advanceTimersByTime(1000);
  expect(callback).toHaveBeenCalled();

  vi.useRealTimers();
});
```

## Best Practices

1. **Test Isolation** - Each test should be independent
2. **Clear Names** - Test names should describe behavior, not implementation
3. **Arrange-Act-Assert** - Structure tests clearly
4. **Mock External Dependencies** - Mock Logseq API, not code under test
5. **Test Error Cases** - Include unhappy path tests
6. **Avoid Implementation Details** - Test behavior, not internals

## CI Integration

Tests run automatically on:
- Pull requests
- Pushes to main branch
- Manual workflow dispatch

See `.github/workflows/test.yml` (if configured)

## Troubleshooting

### Tests timing out
- Check for unresolved promises
- Ensure fake timers are restored with `vi.useRealTimers()`

### Mock not working
- Verify mock is set up in `beforeEach`
- Check that global mocks are in `test/setup.ts`

### Coverage too low
- Run `yarn test:coverage` to see uncovered lines
- Focus on testing business logic over UI details

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Vitest UI](https://vitest.dev/guide/ui.html)
