const doc = parent.document;

function getCSSVariableColor(varName: string): string {
  const tempEl = doc.createElement("span");
  tempEl.style.color = `var(${varName})`;
  doc.body.appendChild(tempEl);
  const color = getComputedStyle(tempEl).color;
  tempEl.remove();
  return color;
}

function getAccentColor(): string | null {
  // Try multiple CSS variables that might contain the accent color
  const cssVars = [
    "--ls-link-text-color",
    "--lx-accent-09",
    "--ls-active-primary-color",
    "--ls-link-ref-text-color",
  ];

  for (const varName of cssVars) {
    const color = getCSSVariableColor(varName);
    // Check it's a valid color (not black/white/gray and not empty)
    if (
      color &&
      color !== "rgb(0, 0, 0)" &&
      !color.match(/^rgb\((\d+),\s*\1,\s*\1\)$/)
    ) {
      return color;
    }
  }

  // Fallback: try to find a link element with accent color
  const link = doc.querySelector("a.page-ref, .page-property-value a");
  if (link) {
    const color = getComputedStyle(link).color;
    if (
      color &&
      color !== "rgb(0, 0, 0)" &&
      !color.match(/^rgb\((\d+),\s*\1,\s*\1\)$/)
    ) {
      return color;
    }
  }

  return null;
}

function parseRGB(color: string): { r: number; g: number; b: number } | null {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (match) {
    return {
      r: parseInt(match[1], 10),
      g: parseInt(match[2], 10),
      b: parseInt(match[3], 10),
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
  // Re-inject when theme might change (class changes on html/body)
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.attributeName === "class") {
        // Debounce to avoid multiple rapid updates
        setTimeout(onThemeChange, 100);
        break;
      }
    }
  });

  observer.observe(doc.documentElement, { attributes: true });
  observer.observe(doc.body, { attributes: true });
}
