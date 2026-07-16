import { pickStyles } from '../../core/platform';
import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import styles from './styles.scss?inline';
import stylesV2 from './styles.v2.scss?inline';

export const tablesFeature: Feature = {
  id: 'tables',
  name: 'Pretty Tables',
  description:
    'Styled query result tables with accent borders, hover states, and refined typography',

  // Exemplar of the version-selected SCSS convention: import v1 + v2 stylesheets
  // and let `pickStyles` pick per active version (v2 falls back to v1 when empty).
  getStyles() {
    return getSettings().enablePrettyTables ? pickStyles({ v1: styles, v2: stylesV2 }) : '';
  },

  init() {},

  destroy() {},
};
