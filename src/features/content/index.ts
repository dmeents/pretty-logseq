import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import styles from './styles.scss?inline';
import threadingStyles from './threading.scss?inline';

export const contentFeature: Feature = {
  id: 'content',
  name: 'Content',
  description: 'Content block styling and enhancements',

  getStyles() {
    const parts: string[] = [styles];
    if (getSettings().enableBulletThreading) parts.push(threadingStyles);
    return parts.join('\n');
  },

  init() {},

  destroy() {},
};
