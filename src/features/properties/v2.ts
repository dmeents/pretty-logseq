import type { PropertiesStrategy } from './v1';
import { propertiesV1 } from './v1';

/**
 * Logseq v2 (DB) properties.
 *
 * The v2 property model is a full rework — page properties are no longer set via
 * the first block, and properties are namespaced DB attributes (`:logseq.property/*`)
 * rather than a flat markdown map — so this strategy will diverge substantially
 * from v1. For now it mirrors v1 as a safe baseline; replace with the DB-specific
 * DOM/data implementation during triage (see .ai/findings/v2-feature-triage.md).
 */
export const propertiesV2: PropertiesStrategy = propertiesV1;
