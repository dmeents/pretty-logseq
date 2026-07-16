import { pickStyles } from '../../core/platform';
import { getSettings } from '../../settings';
import type { Feature } from '../../types';
import styles from './styles.scss?inline';
import stylesV2 from './styles.v2.scss?inline';

/**
 * Pretty Tags — styles the inline tag/class pills v2 renders on blocks
 * (`.block-tags > .block-tag`). This surface is v2-only: the v1 file app renders
 * `#tags` inline in block content, not as a discrete pill strip, so the v1
 * stylesheet is intentionally empty and `pickStyles` yields nothing on v1.
 */
export const tagsFeature: Feature = {
  id: 'tags',
  name: 'Pretty Tags',
  description: "Pill styling for the tag/class chips on a block's tag row (v2 only)",

  getStyles() {
    return getSettings().enablePrettyTags ? pickStyles({ v1: styles, v2: stylesV2 }) : '';
  },

  init() {},

  destroy() {},
};
