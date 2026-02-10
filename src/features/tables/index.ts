import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import styles from './styles.scss?inline';

export const tablesFeature: Feature = {
  id: 'tables',
  name: 'Pretty Tables',
  description:
    'Styled query result tables with accent borders, hover states, and refined typography',

  getStyles() {
    return getSettings().enablePrettyTables ? styles : '';
  },

  init() {},

  destroy() {},
};
