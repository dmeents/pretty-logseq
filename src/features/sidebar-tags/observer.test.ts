/**
 * Tests for the sidebar page-tag observer.
 */

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { setupSidebarTagObserver } from './observer';

function createNavItem(titleText: string): HTMLElement {
  const li = document.createElement('li');
  li.className = 'recent-item';
  li.innerHTML = `<a class="link-item"><span class="page-icon"></span><span class="page-title">${titleText}</span></a>`;
  return li;
}

function makeSidebar(...titles: string[]): HTMLElement {
  const sidebar = document.createElement('div');
  sidebar.id = 'left-sidebar';
  const ul = document.createElement('ul');
  for (const t of titles) ul.appendChild(createNavItem(t));
  sidebar.appendChild(ul);
  document.body.appendChild(sidebar);
  return sidebar;
}

function title(sidebar: HTMLElement, index = 0): HTMLElement {
  return sidebar.querySelectorAll<HTMLElement>('.page-title')[index];
}

describe('Sidebar Tag Observer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('returns a cleanup function', () => {
    makeSidebar('Next.JS #Technology');
    const cleanup = setupSidebarTagObserver();
    expect(typeof cleanup).toBe('function');
    cleanup();
  });

  it('wraps the name and tag into separate spans', () => {
    const sidebar = makeSidebar('Next.JS #Technology');
    const cleanup = setupSidebarTagObserver();

    const el = title(sidebar);
    expect(el.querySelector('.pl-nav-name')?.textContent).toBe('Next.JS');
    expect(el.querySelector('.pl-nav-tag')?.textContent).toBe('#Technology');

    cleanup();
  });

  it('keeps multi-word tags intact', () => {
    const sidebar = makeSidebar('poe2-overlord #Code Base');
    const cleanup = setupSidebarTagObserver();

    expect(title(sidebar).querySelector('.pl-nav-name')?.textContent).toBe('poe2-overlord');
    expect(title(sidebar).querySelector('.pl-nav-tag')?.textContent).toBe('#Code Base');

    cleanup();
  });

  it('splits at the first tag for multi-tag titles', () => {
    const sidebar = makeSidebar('Foo #A #B');
    const cleanup = setupSidebarTagObserver();

    expect(title(sidebar).querySelector('.pl-nav-name')?.textContent).toBe('Foo');
    expect(title(sidebar).querySelector('.pl-nav-tag')?.textContent).toBe('#A #B');

    cleanup();
  });

  it('handles page names containing spaces', () => {
    const sidebar = makeSidebar('POE2 Overlord #Project');
    const cleanup = setupSidebarTagObserver();

    expect(title(sidebar).querySelector('.pl-nav-name')?.textContent).toBe('POE2 Overlord');
    expect(title(sidebar).querySelector('.pl-nav-tag')?.textContent).toBe('#Project');

    cleanup();
  });

  it('leaves untagged titles unchanged', () => {
    const sidebar = makeSidebar('Technology');
    const cleanup = setupSidebarTagObserver();

    const el = title(sidebar);
    expect(el.querySelector('.pl-nav-tag')).toBeNull();
    expect(el.textContent).toBe('Technology');

    cleanup();
  });

  it('does not treat a "#" without a leading space as a tag', () => {
    const sidebar = makeSidebar('C#');
    const cleanup = setupSidebarTagObserver();

    expect(title(sidebar).querySelector('.pl-nav-tag')).toBeNull();

    cleanup();
  });

  it('is idempotent — does not double-wrap on re-scan', async () => {
    const sidebar = makeSidebar('Next.JS #Technology');
    const cleanup = setupSidebarTagObserver();

    // Force a mutation so the observer re-scans.
    sidebar.querySelector('ul')?.appendChild(createNavItem('Rust #Technology'));
    await new Promise(r => setTimeout(r, 0));
    await new Promise(r => requestAnimationFrame(r));

    expect(title(sidebar, 0).querySelectorAll('.pl-nav-tag').length).toBe(1);
    expect(title(sidebar, 1).querySelector('.pl-nav-tag')?.textContent).toBe('#Technology');

    cleanup();
  });

  it('wraps items added after setup', async () => {
    const sidebar = makeSidebar('Technology');
    const cleanup = setupSidebarTagObserver();

    sidebar.querySelector('ul')?.appendChild(createNavItem('Tauri #Technology'));
    await new Promise(r => setTimeout(r, 0));
    await new Promise(r => requestAnimationFrame(r));

    expect(title(sidebar, 1).querySelector('.pl-nav-tag')?.textContent).toBe('#Technology');

    cleanup();
  });

  describe('Cleanup', () => {
    it('restores the original title text on cleanup', () => {
      const sidebar = makeSidebar('Next.JS #Technology');
      const cleanup = setupSidebarTagObserver();
      cleanup();

      const el = title(sidebar);
      expect(el.querySelector('.pl-nav-tag')).toBeNull();
      expect(el.textContent).toBe('Next.JS #Technology');
    });

    it('disconnects the observer', async () => {
      const sidebar = makeSidebar('Technology');
      const cleanup = setupSidebarTagObserver();
      cleanup();

      sidebar.querySelector('ul')?.appendChild(createNavItem('Rust #Technology'));
      await new Promise(r => setTimeout(r, 0));
      await new Promise(r => requestAnimationFrame(r));

      expect(title(sidebar, 1).querySelector('.pl-nav-tag')).toBeNull();
    });
  });
});
