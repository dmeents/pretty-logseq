import { getParentDoc } from '../lib/dom';

const GRAY_PATTERN = /^rgb\((\d+),\s*\1,\s*\1\)$/;

function isUsableColor(color: string): boolean {
  return !!color && color !== 'rgb(0, 0, 0)' && !GRAY_PATTERN.test(color);
}

function getAccentColor(): string | null {
  const doc = getParentDoc();
  const probe = doc.createElement('span');
  doc.body.appendChild(probe);

  const cssVars = [
    '--ls-link-text-color',
    '--lx-accent-09',
    '--ls-active-primary-color',
    '--ls-link-ref-text-color',
  ];

  for (const varName of cssVars) {
    probe.style.color = `var(${varName})`;
    const color = getComputedStyle(probe).color;
    if (isUsableColor(color)) {
      probe.remove();
      return color;
    }
  }

  probe.remove();

  // Fallback: try to find a link element with accent color
  const link = doc.querySelector('a.page-ref, .page-property-value a');
  if (link) {
    const color = getComputedStyle(link).color;
    if (isUsableColor(color)) return color;
  }

  return null;
}

function parseRGB(color: string): { r: number; g: number; b: number } | null {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return {
      r: Number.parseInt(match[1], 10),
      g: Number.parseInt(match[2], 10),
      b: Number.parseInt(match[3], 10),
    };
  }
  return null;
}

function rgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

export function generateThemeCSS(): string {
  const accentColor = getAccentColor();

  // Default purple fallback
  let r = 139,
    g = 92,
    b = 246;
  let accent = `rgb(${r}, ${g}, ${b})`;

  if (accentColor) {
    const rgb = parseRGB(accentColor);
    if (rgb) {
      r = rgb.r;
      g = rgb.g;
      b = rgb.b;
      accent = accentColor;
    }
  }

  // Generate CSS with actual color values
  return `
/* Pretty Logseq Theme Colors (auto-detected) */
:root {
  --pl-accent: ${accent};
  --pl-accent-text: ${accent};
  --pl-accent-subtle: ${rgba(r, g, b, 0.1)};
  --pl-accent-light: ${rgba(r, g, b, 0.15)};
  --pl-accent-medium: ${rgba(r, g, b, 0.25)};
  --pl-accent-strong: ${rgba(r, g, b, 0.35)};
  --pl-accent-border: ${rgba(r, g, b, 0.4)};
  --pl-accent-border-strong: ${rgba(r, g, b, 0.6)};
}
`;
}

/**
 * Setup theme color observer to update when theme changes
 * @param onThemeChange - callback to invoke when theme changes (should refresh styles)
 */
export function setupThemeObserver(onThemeChange: () => void): void {
  const doc = getParentDoc();

  // Re-inject when theme might change (class changes on html/body)
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.attributeName === 'class') {
        // Debounce to avoid multiple rapid updates
        setTimeout(onThemeChange, 100);
        break;
      }
    }
  });

  observer.observe(doc.documentElement, { attributes: true });
  observer.observe(doc.body, { attributes: true });
}
