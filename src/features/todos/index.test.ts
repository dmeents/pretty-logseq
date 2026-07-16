/**
 * Tests for Todos Feature
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setVersionForTest } from '../../core/version';
import type { PluginSettings } from '../../settings';
import * as settingsModule from '../../settings';
import { todosFeature } from './index';
import * as observerModule from './observer';

vi.mock('../../settings', () => ({
  getSettings: vi.fn(() => ({
    enablePrettyTodos: true,
  })),
}));

vi.mock('./observer', () => ({
  setupTodoObserver: vi.fn(() => vi.fn()),
}));

vi.mock('./styles.scss?inline', () => ({
  default: '.todo-styles { }',
}));

vi.mock('./styles.v2.scss?inline', () => ({
  default: '.todo-styles-v2 { }',
}));

describe('Todos Feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Feature Interface', () => {
    it('has correct id', () => {
      expect(todosFeature.id).toBe('todos');
    });

    it('has correct name', () => {
      expect(todosFeature.name).toBe('Pretty Todos');
    });

    it('has a description', () => {
      expect(todosFeature.description).toBeTruthy();
    });
  });

  describe('version strategy', () => {
    afterEach(() => {
      setVersionForTest(null);
    });

    it('returns the v2 stylesheet on v2 when enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTodos: true,
      } as PluginSettings);
      setVersionForTest('v2');

      expect(todosFeature.getStyles()).toBe('.todo-styles-v2 { }');
    });

    it('does not set up the v1 observer on v2', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTodos: true,
      } as PluginSettings);
      setVersionForTest('v2');

      todosFeature.init();

      expect(observerModule.setupTodoObserver).not.toHaveBeenCalled();
    });
  });

  describe('getStyles', () => {
    it('returns styles when enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTodos: true,
      } as PluginSettings);

      expect(todosFeature.getStyles()).toBe('.todo-styles { }');
    });

    it('returns empty string when disabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTodos: false,
      } as PluginSettings);

      expect(todosFeature.getStyles()).toBe('');
    });
  });

  describe('init', () => {
    it('sets up observer when enabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTodos: true,
      } as PluginSettings);

      todosFeature.init();

      expect(observerModule.setupTodoObserver).toHaveBeenCalledTimes(1);
    });

    it('does not set up observer when disabled', () => {
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTodos: false,
      } as PluginSettings);

      todosFeature.init();

      expect(observerModule.setupTodoObserver).not.toHaveBeenCalled();
    });
  });

  describe('destroy', () => {
    it('calls cleanup function', () => {
      const mockCleanup = vi.fn();
      vi.mocked(observerModule.setupTodoObserver).mockReturnValue(mockCleanup);
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTodos: true,
      } as PluginSettings);

      todosFeature.init();
      todosFeature.destroy();

      expect(mockCleanup).toHaveBeenCalledTimes(1);
    });

    it('does not throw when cleanup is null', () => {
      expect(() => todosFeature.destroy()).not.toThrow();
    });

    it('nullifies cleanup after calling', () => {
      const mockCleanup = vi.fn();
      vi.mocked(observerModule.setupTodoObserver).mockReturnValue(mockCleanup);
      vi.mocked(settingsModule.getSettings).mockReturnValue({
        enablePrettyTodos: true,
      } as PluginSettings);

      todosFeature.init();
      todosFeature.destroy();
      todosFeature.destroy();

      expect(mockCleanup).toHaveBeenCalledTimes(1);
    });
  });
});
