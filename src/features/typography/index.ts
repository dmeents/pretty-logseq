import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import headersStyles from './headers.scss?inline';
import typographyStyles from './styles.scss?inline';

export const typographyFeature: Feature = {
  id: 'typography',
  name: 'Pretty Typography',
  description: 'Header styling and text rendering refinements for modern legibility',

  getStyles() {
    const styles: string[] = [headersStyles];

    if (getSettings().enablePrettyTypography) {
      styles.push(typographyStyles);
    }

    return styles.join('\n');
  },

  init() {},

  destroy() {},
};
