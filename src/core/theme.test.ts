/**
 * Tests for Theme Color Management
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { generateThemeCSS, setupThemeObserver } from './theme';

describe('Theme Color Management', () => {
	beforeEach(() => {
		// Clear document body
		document.body.innerHTML = '';
		vi.clearAllMocks();
	});

	afterEach(() => {
		// Clean up any elements
		document.body.innerHTML = '';
	});

	describe('getCSSVariableColor', () => {
		it('extracts color from CSS variable', () => {
			// Setup: mock getComputedStyle to return a color
			const mockComputedStyle = {
				color: 'rgb(139, 92, 246)',
			};
			vi.spyOn(window, 'getComputedStyle').mockReturnValue(
				mockComputedStyle as CSSStyleDeclaration,
			);

			const css = generateThemeCSS();

			expect(css).toContain('--pl-accent: rgb(139, 92, 246)');
		});

		it('cleans up temporary element', () => {
			const initialChildren = document.body.children.length;

			generateThemeCSS();

			// Should not leave any elements behind
			expect(document.body.children.length).toBe(initialChildren);
		});
	});

	describe('getAccentColor', () => {
		it('returns first valid accent color from CSS variables', () => {
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				color: 'rgb(59, 130, 246)',
			} as CSSStyleDeclaration);

			const css = generateThemeCSS();

			expect(css).toContain('rgb(59, 130, 246)');
		});

		it('skips black color (rgb(0, 0, 0))', () => {
			let callCount = 0;
			vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
				callCount++;
				// First few calls return black, last call returns valid color
				if (callCount <= 4) {
					return { color: 'rgb(0, 0, 0)' } as CSSStyleDeclaration;
				}
				return { color: 'rgb(139, 92, 246)' } as CSSStyleDeclaration;
			});

			const css = generateThemeCSS();

			// Should use the purple color, not black
			expect(css).toContain('rgb(139, 92, 246)');
		});

		it('skips gray colors (same RGB values)', () => {
			let callCount = 0;
			vi.spyOn(window, 'getComputedStyle').mockImplementation(() => {
				callCount++;
				if (callCount <= 4) {
					// Gray color: all values same
					return { color: 'rgb(128, 128, 128)' } as CSSStyleDeclaration;
				}
				return { color: 'rgb(139, 92, 246)' } as CSSStyleDeclaration;
			});

			const css = generateThemeCSS();

			expect(css).toContain('rgb(139, 92, 246)');
		});

		it('falls back to link element color when CSS variables fail', () => {
			// Create a link element
			const link = document.createElement('a');
			link.className = 'page-ref';
			document.body.appendChild(link);

			let callCount = 0;
			vi.spyOn(window, 'getComputedStyle').mockImplementation((element) => {
				callCount++;
				// CSS variable calls return black
				if (element.tagName === 'SPAN') {
					return { color: 'rgb(0, 0, 0)' } as CSSStyleDeclaration;
				}
				// Link element returns accent color
				return { color: 'rgb(59, 130, 246)' } as CSSStyleDeclaration;
			});

			const css = generateThemeCSS();

			expect(css).toContain('rgb(59, 130, 246)');
		});

		it('uses default purple when no valid accent found', () => {
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				color: 'rgb(0, 0, 0)',
			} as CSSStyleDeclaration);

			const css = generateThemeCSS();

			// Default purple
			expect(css).toContain('rgb(139, 92, 246)');
		});
	});

	describe('parseRGB', () => {
		it('parses valid RGB color string', () => {
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				color: 'rgb(255, 128, 64)',
			} as CSSStyleDeclaration);

			const css = generateThemeCSS();

			// Should use parsed values in RGBA
			expect(css).toContain('rgba(255, 128, 64, 0.1)');
		});

		it('handles RGB with spaces after commas', () => {
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				color: 'rgb(100, 200, 50)',
			} as CSSStyleDeclaration);

			const css = generateThemeCSS();

			expect(css).toContain('rgba(100, 200, 50, 0.1)');
		});
	});

	describe('rgba', () => {
		it('generates RGBA color with alpha', () => {
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				color: 'rgb(139, 92, 246)',
			} as CSSStyleDeclaration);

			const css = generateThemeCSS();

			// Check various alpha values
			expect(css).toContain('rgba(139, 92, 246, 0.1)'); // subtle
			expect(css).toContain('rgba(139, 92, 246, 0.15)'); // light
			expect(css).toContain('rgba(139, 92, 246, 0.25)'); // medium
			expect(css).toContain('rgba(139, 92, 246, 0.35)'); // strong
			expect(css).toContain('rgba(139, 92, 246, 0.4)'); // border
			expect(css).toContain('rgba(139, 92, 246, 0.6)'); // border-strong
		});
	});

	describe('generateThemeCSS', () => {
		it('returns CSS with theme variables', () => {
			const css = generateThemeCSS();

			expect(css).toContain(':root {');
			expect(css).toContain('--pl-accent:');
			expect(css).toContain('--pl-accent-text:');
			expect(css).toContain('--pl-accent-subtle:');
			expect(css).toContain('--pl-accent-light:');
			expect(css).toContain('--pl-accent-medium:');
			expect(css).toContain('--pl-accent-strong:');
			expect(css).toContain('--pl-accent-border:');
			expect(css).toContain('--pl-accent-border-strong:');
		});

		it('includes header comment', () => {
			const css = generateThemeCSS();

			expect(css).toContain('Pretty Logseq Theme Colors');
			expect(css).toContain('auto-detected');
		});

		it('uses detected accent color', () => {
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				color: 'rgb(34, 197, 94)',
			} as CSSStyleDeclaration);

			const css = generateThemeCSS();

			expect(css).toContain('--pl-accent: rgb(34, 197, 94)');
			expect(css).toContain('rgba(34, 197, 94, 0.1)');
		});

		it('generates valid CSS', () => {
			const css = generateThemeCSS();

			// Should be valid CSS
			expect(css).toMatch(/:root\s*\{[\s\S]*\}/);
		});
	});

	describe('setupThemeObserver', () => {
		it('creates MutationObserver', () => {
			const callback = vi.fn();
			const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');

			setupThemeObserver(callback);

			expect(observeSpy).toHaveBeenCalled();
		});

		it('observes documentElement and body', () => {
			const callback = vi.fn();
			const observeSpy = vi.spyOn(MutationObserver.prototype, 'observe');

			setupThemeObserver(callback);

			expect(observeSpy).toHaveBeenCalledWith(document.documentElement, { attributes: true });
			expect(observeSpy).toHaveBeenCalledWith(document.body, { attributes: true });
		});

		it('calls callback when class attribute changes', async () => {
			const callback = vi.fn();

			setupThemeObserver(callback);

			// Trigger class change
			document.documentElement.className = 'dark-theme';

			// Wait for observer to fire and debounce
			await new Promise((resolve) => setTimeout(resolve, 150));

			expect(callback).toHaveBeenCalled();
		});

		it('debounces callback calls', async () => {
			const callback = vi.fn();

			setupThemeObserver(callback);

			// Trigger multiple rapid class changes
			document.documentElement.className = 'theme-1';
			document.documentElement.className = 'theme-2';
			document.documentElement.className = 'theme-3';

			// Wait for observer and debounce (100ms + buffer)
			await new Promise((resolve) => setTimeout(resolve, 150));

			// Should have called callback (debounce consolidates multiple changes)
			expect(callback).toHaveBeenCalled();
		});

		it('does not call callback for non-class attribute changes', async () => {
			const callback = vi.fn();
			vi.useFakeTimers();

			setupThemeObserver(callback);

			// Change non-class attribute
			document.documentElement.setAttribute('data-test', 'value');

			vi.advanceTimersByTime(150);

			expect(callback).not.toHaveBeenCalled();

			vi.useRealTimers();
		});
	});
});
