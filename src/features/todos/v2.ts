import { getSettings } from '../../settings';
import styles from './styles.v2.scss?inline';
import type { TodosStrategy } from './v1';

/**
 * Logseq v2 (DB) todos.
 *
 * v2 has no marker text (`.todo`/`.done`/…) or `a.priority` anchors — task state
 * is a property rendered via icon-font glyphs (`.ls-icon-Todo`/`InProgress`/
 * `Done`/`Cancelled`), priority via `.ls-icon-priorityLvl*`, and past-due via a
 * native `.overdue` class. So v2 is styling-only (`styles.v2.scss`) and needs no
 * observer — hence the no-op `init`/`destroy` (nothing to inject or clean up).
 */
export const todosV2: TodosStrategy = {
  getStyles() {
    return getSettings().enablePrettyTodos ? styles : '';
  },

  init() {},
  destroy() {},
};
