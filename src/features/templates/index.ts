import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import styles from './styles.scss?inline';

export const templatesFeature: Feature = {
  id: 'templates',
  name: 'Pretty Templates',
  description: 'Styles template body blocks as dimmed, contained cards',

  getStyles() {
    return getSettings().enablePrettyTemplates ? styles : '';
  },

  init() {},

  destroy() {},
};
