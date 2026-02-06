/**
 * Block Data Fixtures
 *
 * Sample block data for testing.
 */

import type { BlockData } from '../../src/types';

export const simpleBlock: BlockData = {
  content: 'This is a simple block of text.',
  children: [],
};

export const blockWithProperties: BlockData = {
  content: 'title:: My Page\ntype:: Note\nThis is the actual content.',
  children: [],
};

export const blockWithReferences: BlockData = {
  content: 'See [[Other Page]] and ((block-uuid-123)) for more details.',
  children: [],
};

export const blockWithMarkdown: BlockData = {
  content: '**Bold** and *italic* text with `code` and [links](https://example.com).',
  children: [],
};

export const nestedBlocks: BlockData = {
  content: 'Parent block',
  children: [
    {
      content: 'Child block 1',
      children: [],
    },
    {
      content: 'Child block 2',
      children: [
        {
          content: 'Nested child',
          children: [],
        },
      ],
    },
  ],
};

export const multiLineDescription: BlockData = {
  content: 'First line of description.\n\nSecond paragraph with more details.\n\nThird paragraph.',
  children: [],
};
