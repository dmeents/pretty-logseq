/**
 * Page Data Fixtures
 *
 * Sample page data for testing.
 */

import type { PageData } from '../../src/types';

export const basicPage: PageData = {
  name: 'Basic Page',
  originalName: 'Basic Page',
  properties: {},
};

export const personPage: PageData = {
  name: 'John Doe',
  originalName: 'John Doe',
  properties: {
    type: 'Person',
    title: 'Software Engineer',
    organization: 'Acme Corp',
    tags: ['JavaScript', 'TypeScript', 'React'],
  },
};

export const resourcePage: PageData = {
  name: 'API Documentation',
  originalName: 'API Documentation',
  properties: {
    type: 'Resource',
    url: 'https://api.example.com/docs',
    status: 'Active',
    area: 'Backend',
  },
};

export const codebasePage: PageData = {
  name: 'my-project',
  originalName: 'my-project',
  properties: {
    type: 'Codebase',
    language: 'TypeScript',
    status: 'In Progress',
    repository: 'https://github.com/user/my-project',
  },
};
