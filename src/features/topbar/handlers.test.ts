/**
 * Tests for Topbar Handlers
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNavArrowsInLeft } from './handlers';

describe('createNavArrowsInLeft', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  function setupDOM() {
    const head = document.createElement('div');
    head.id = 'head';

    const left = document.createElement('div');
    left.className = 'l';

    const sidebarToggler = document.createElement('button');
    sidebarToggler.className = 'sidebar-toggler';
    left.appendChild(sidebarToggler);

    head.appendChild(left);

    const right = document.createElement('div');
    right.className = 'r';

    const navPanel = document.createElement('div');
    navPanel.className = 'flex flex-row';

    const navLeft = document.createElement('button');
    navLeft.className = 'nav-left';
    navLeft.textContent = 'Back';

    const navRight = document.createElement('button');
    navRight.className = 'nav-right';
    navRight.textContent = 'Forward';

    navPanel.appendChild(navLeft);
    navPanel.appendChild(navRight);
    right.appendChild(navPanel);

    head.appendChild(right);
    document.body.appendChild(head);

    return { head, left, right, navPanel, sidebarToggler };
  }

  it('clones nav panel and inserts into left section', () => {
    setupDOM();

    const cleanup = createNavArrowsInLeft();

    const clone = document.getElementById('pl-nav-arrows');
    expect(clone).not.toBeNull();
    expect(cleanup).not.toBeNull();
  });

  it('inserts clone after sidebar toggler', () => {
    const { sidebarToggler } = setupDOM();

    createNavArrowsInLeft();

    const clone = document.getElementById('pl-nav-arrows');
    expect(sidebarToggler.nextElementSibling).toBe(clone);
  });

  it('clone contains nav-left and nav-right buttons', () => {
    setupDOM();

    createNavArrowsInLeft();

    const clone = document.getElementById('pl-nav-arrows');
    expect(clone?.querySelector('.nav-left')).not.toBeNull();
    expect(clone?.querySelector('.nav-right')).not.toBeNull();
  });

  it('back button calls history.back()', () => {
    setupDOM();
    const historySpy = vi.spyOn(window.history, 'back').mockImplementation(() => {});

    createNavArrowsInLeft();

    const clone = document.getElementById('pl-nav-arrows');
    const backBtn = clone?.querySelector('.nav-left') as HTMLElement;
    backBtn.click();

    expect(historySpy).toHaveBeenCalledTimes(1);
    historySpy.mockRestore();
  });

  it('forward button calls history.forward()', () => {
    setupDOM();
    const historySpy = vi.spyOn(window.history, 'forward').mockImplementation(() => {});

    createNavArrowsInLeft();

    const clone = document.getElementById('pl-nav-arrows');
    const fwdBtn = clone?.querySelector('.nav-right') as HTMLElement;
    fwdBtn.click();

    expect(historySpy).toHaveBeenCalledTimes(1);
    historySpy.mockRestore();
  });

  it('returns null when #head .l is missing', () => {
    // Empty DOM
    const result = createNavArrowsInLeft();
    expect(result).toBeNull();
  });

  it('returns null when nav panel is missing', () => {
    const head = document.createElement('div');
    head.id = 'head';
    const left = document.createElement('div');
    left.className = 'l';
    head.appendChild(left);
    document.body.appendChild(head);

    const result = createNavArrowsInLeft();
    expect(result).toBeNull();
  });

  it('cleanup function removes the clone', () => {
    setupDOM();

    const cleanup = createNavArrowsInLeft();
    expect(document.getElementById('pl-nav-arrows')).not.toBeNull();

    cleanup?.();
    expect(document.getElementById('pl-nav-arrows')).toBeNull();
  });

  it('removes existing clone before creating new one', () => {
    setupDOM();

    createNavArrowsInLeft();
    createNavArrowsInLeft();

    const clones = document.querySelectorAll('#pl-nav-arrows');
    expect(clones.length).toBe(1);
  });

  it('prepends to left section when no sidebar toggler exists', () => {
    const head = document.createElement('div');
    head.id = 'head';

    const left = document.createElement('div');
    left.className = 'l';
    head.appendChild(left);

    const right = document.createElement('div');
    right.className = 'r';
    const navPanel = document.createElement('div');
    navPanel.className = 'flex flex-row';
    right.appendChild(navPanel);
    head.appendChild(right);

    document.body.appendChild(head);

    createNavArrowsInLeft();

    const clone = document.getElementById('pl-nav-arrows');
    expect(clone).not.toBeNull();
    expect(left.firstElementChild).toBe(clone);
  });
});
