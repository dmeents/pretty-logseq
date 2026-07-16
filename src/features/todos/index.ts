import { getVersion } from '../../core/version';
import type { Feature } from '../../types';
import { todosV1 } from './v1';
import { todosV2 } from './v2';

/**
 * Restyles task blocks with visual indicators for status, priority, and
 * past-due dates. Tasks diverge deeply between versions — v1 is marker-based
 * (`.todo`/`a.priority`) with an observer, v2 is property-based (icon-font
 * glyphs, native `.overdue`) and CSS-only — so this thin `Feature` delegates to
 * a version-specific implementation (same shape as the properties feature).
 */
function strategy() {
  return getVersion() === 'v2' ? todosV2 : todosV1;
}

export const todosFeature: Feature = {
  id: 'todos',
  name: 'Pretty Todos',
  description:
    'Restyle task blocks with visual indicators for status, priority, and past-due dates',

  getStyles() {
    return strategy().getStyles();
  },

  init() {
    return strategy().init();
  },

  destroy() {
    strategy().destroy();
  },
};
