import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import { setupTodoObserver } from './observer';
import styles from './styles.scss?inline';

/** The version-specific slice of a feature (everything but its identity). */
export type TodosStrategy = Pick<Feature, 'getStyles' | 'init' | 'destroy'>;

let cleanup: (() => void) | null = null;

/**
 * Logseq v1 (file/markdown) todos: styles marker-based task blocks
 * (`.todo`/`.doing`/`.done`/…, `a.priority`) and runs the observer that injects
 * a "CANCELLED" label and flags past-due SCHEDULED/DEADLINE dates.
 */
export const todosV1: TodosStrategy = {
  getStyles() {
    return getSettings().enablePrettyTodos ? styles : '';
  },

  init() {
    if (!getSettings().enablePrettyTodos) return;
    cleanup = setupTodoObserver();
  },

  destroy() {
    cleanup?.();
    cleanup = null;
  },
};
