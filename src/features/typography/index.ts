import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import headersStyles from './headers.scss?inline';
import proseStyles from './prose.scss?inline';
import typographyStyles from './styles.scss?inline';

const doc = top?.document ?? parent.document;
const FONT_LINK_ID = 'pretty-logseq-inter-font';
const INTER_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap';

export const typographyFeature: Feature = {
  id: 'typography',
  name: 'Pretty Typography',
  description: 'Inter font, refined heading weights, and prose styling for modern legibility',

  getStyles() {
    const styles: string[] = [headersStyles];

    if (getSettings().enablePrettyTypography) {
      styles.push(typographyStyles);
      styles.push(proseStyles);
    }

    return styles.join('\n');
  },

  init() {
    if (!getSettings().enablePrettyTypography) return;
    if (doc.getElementById(FONT_LINK_ID)) return;

    const link = doc.createElement('link');
    link.id = FONT_LINK_ID;
    link.rel = 'stylesheet';
    link.href = INTER_FONT_URL;
    doc.head.appendChild(link);
  },

  destroy() {
    doc.getElementById(FONT_LINK_ID)?.remove();
  },
};
