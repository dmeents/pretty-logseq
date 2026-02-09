/**
 * Tests for Todo Observer
 */

import { beforeEach, describe, expect, it } from 'vitest';
import { setupTodoObserver } from './observer';

describe('Todo Observer', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  /**
   * Create a mock task block with the given marker and optional scheduled date.
   */
  function createBlock(options: {
    marker?: 'todo' | 'doing' | 'now' | 'done' | 'canceled' | 'cancelled';
    scheduled?: string;
    deadline?: string;
    content?: string;
  }): HTMLElement {
    const block = document.createElement('div');
    block.className = 'ls-block';

    const wrapper = document.createElement('div');
    wrapper.className = 'block-content-wrapper';

    if (options.marker) {
      const markerSpan = document.createElement('span');
      markerSpan.className = options.marker;
      markerSpan.textContent = options.content ?? 'Task content';
      wrapper.appendChild(markerSpan);
    } else {
      wrapper.textContent = options.content ?? 'Plain content';
    }

    if (options.scheduled) {
      const schedSpan = document.createElement('span');
      schedSpan.textContent = `SCHEDULED: <${options.scheduled}>`;
      wrapper.appendChild(schedSpan);
    }

    if (options.deadline) {
      const deadlineSpan = document.createElement('span');
      deadlineSpan.textContent = `DEADLINE: <${options.deadline}>`;
      wrapper.appendChild(deadlineSpan);
    }

    block.appendChild(wrapper);
    return block;
  }

  function getFutureDate(): string {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  }

  function getPastDate(): string {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  }

  describe('Past-due detection', () => {
    it('marks TODO block with past SCHEDULED date as past-due', () => {
      const block = createBlock({ marker: 'todo', scheduled: getPastDate() });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();

      expect(block.classList.contains('pl-past-due')).toBe(true);

      cleanup();
    });

    it('marks TODO block with past DEADLINE date as past-due', () => {
      const block = createBlock({ marker: 'todo', deadline: getPastDate() });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();

      expect(block.classList.contains('pl-past-due')).toBe(true);

      cleanup();
    });

    it('marks DOING block with past date as past-due', () => {
      const block = createBlock({ marker: 'doing', scheduled: getPastDate() });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();

      expect(block.classList.contains('pl-past-due')).toBe(true);

      cleanup();
    });

    it('marks NOW block with past date as past-due', () => {
      const block = createBlock({ marker: 'now', scheduled: getPastDate() });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();

      expect(block.classList.contains('pl-past-due')).toBe(true);

      cleanup();
    });

    it('does not mark block with future date as past-due', () => {
      const block = createBlock({ marker: 'todo', scheduled: getFutureDate() });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();

      expect(block.classList.contains('pl-past-due')).toBe(false);

      cleanup();
    });

    it('does not mark DONE block as past-due even with past date', () => {
      const block = createBlock({ marker: 'done', scheduled: getPastDate() });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();

      expect(block.classList.contains('pl-past-due')).toBe(false);

      cleanup();
    });

    it('does not mark cancelled block as past-due even with past date', () => {
      const block = createBlock({ marker: 'cancelled', scheduled: getPastDate() });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();

      expect(block.classList.contains('pl-past-due')).toBe(false);

      cleanup();
    });

    it('does not mark block without scheduled/deadline as past-due', () => {
      const block = createBlock({ marker: 'todo' });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();

      expect(block.classList.contains('pl-past-due')).toBe(false);

      cleanup();
    });

    it('does not mark non-task block as past-due', () => {
      const block = createBlock({ scheduled: getPastDate() });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();

      expect(block.classList.contains('pl-past-due')).toBe(false);

      cleanup();
    });
  });

  describe('Cancelled label injection', () => {
    it('injects CANCELLED label into canceled task', () => {
      const block = createBlock({ marker: 'canceled' });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();

      const label = block.querySelector('.pl-cancelled-label');
      expect(label).not.toBeNull();
      expect(label?.textContent).toBe('CANCELLED ');

      cleanup();
    });

    it('injects CANCELLED label into cancelled task (alternate spelling)', () => {
      const block = createBlock({ marker: 'cancelled' });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();

      const label = block.querySelector('.pl-cancelled-label');
      expect(label).not.toBeNull();

      cleanup();
    });

    it('does not inject label into non-cancelled tasks', () => {
      const block = createBlock({ marker: 'todo' });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();

      expect(block.querySelector('.pl-cancelled-label')).toBeNull();

      cleanup();
    });

    it('does not duplicate label on re-scan', async () => {
      const block = createBlock({ marker: 'canceled' });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();

      // Trigger a mutation to re-scan
      const child = document.createElement('div');
      document.body.appendChild(child);

      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      const labels = block.querySelectorAll('.pl-cancelled-label');
      expect(labels.length).toBe(1);

      cleanup();
    });
  });

  describe('Cleanup', () => {
    it('removes all past-due classes on cleanup', () => {
      const block = createBlock({ marker: 'todo', scheduled: getPastDate() });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();
      expect(block.classList.contains('pl-past-due')).toBe(true);

      cleanup();
      expect(block.classList.contains('pl-past-due')).toBe(false);
    });

    it('removes all cancelled labels on cleanup', () => {
      const block = createBlock({ marker: 'canceled' });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();
      expect(block.querySelector('.pl-cancelled-label')).not.toBeNull();

      cleanup();
      expect(block.querySelector('.pl-cancelled-label')).toBeNull();
    });

    it('disconnects mutation observer on cleanup', async () => {
      const block = createBlock({ marker: 'todo', scheduled: getPastDate() });
      document.body.appendChild(block);

      const cleanup = setupTodoObserver();
      cleanup();

      // Remove the class manually, then add a new block — should not be re-applied
      block.classList.remove('pl-past-due');

      const newBlock = createBlock({ marker: 'todo', scheduled: getPastDate() });
      document.body.appendChild(newBlock);

      await new Promise(resolve => {
        requestAnimationFrame(() => {
          requestAnimationFrame(resolve);
        });
      });

      expect(newBlock.classList.contains('pl-past-due')).toBe(false);
    });
  });

  describe('Multiple blocks', () => {
    it('processes multiple blocks independently', () => {
      const pastDue = createBlock({ marker: 'todo', scheduled: getPastDate() });
      const future = createBlock({ marker: 'todo', scheduled: getFutureDate() });
      const cancelled = createBlock({ marker: 'canceled' });
      const done = createBlock({ marker: 'done' });

      document.body.appendChild(pastDue);
      document.body.appendChild(future);
      document.body.appendChild(cancelled);
      document.body.appendChild(done);

      const cleanup = setupTodoObserver();

      expect(pastDue.classList.contains('pl-past-due')).toBe(true);
      expect(future.classList.contains('pl-past-due')).toBe(false);
      expect(cancelled.querySelector('.pl-cancelled-label')).not.toBeNull();
      expect(done.querySelector('.pl-cancelled-label')).toBeNull();

      cleanup();
    });
  });
});
