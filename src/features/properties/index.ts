import { getVersion } from '../../core/version';
import type { Feature } from '../../types';
import { propertiesV1 } from './v1';
import { propertiesV2 } from './v2';

/**
 * Strategy exemplar: properties diverges deeply between versions (the v2 DB
 * property model is a rework), so this thin `Feature` delegates its behavior to a
 * version-specific implementation picked at call time. Most features don't need
 * this — they consume the platform adapter and stay single-source.
 */
function strategy() {
  return getVersion() === 'v2' ? propertiesV2 : propertiesV1;
}

export const propertiesFeature: Feature = {
  id: 'properties',
  name: 'Pretty Properties',
  description: 'Style page property blocks with accent borders and refined formatting',

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
