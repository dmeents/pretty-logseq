import type { Feature } from '../../types';
import styles from './styles.scss?inline';

export const contentFeature: Feature = {
  id: 'content',
  name: 'Content',
  description: 'Content block styling and enhancements',

  getStyles() {
    return styles;
  },

  init() {},

  destroy() {},
};
