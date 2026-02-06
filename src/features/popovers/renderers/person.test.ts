/**
 * Tests for Person Renderer
 */

import { describe, expect, it } from 'vitest';
import type { PageData } from '../../../types';
import { personRenderer } from './person';

describe('Person Renderer', () => {
	describe('match', () => {
		it('matches pages with type: Person', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: { type: 'Person' },
			};

			expect(personRenderer.match(pageData)).toBe(true);
		});

		it('matches case-insensitively', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: { type: 'PERSON' },
			};

			expect(personRenderer.match(pageData)).toBe(true);
		});

		it('does not match pages without type', () => {
			const pageData: PageData = {
				name: 'Some Page',
				properties: {},
			};

			expect(personRenderer.match(pageData)).toBe(false);
		});

		it('does not match pages with different type', () => {
			const pageData: PageData = {
				name: 'Some Project',
				properties: { type: 'Project' },
			};

			expect(personRenderer.match(pageData)).toBe(false);
		});

		it('handles type with brackets', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: { type: '[[Person]]' },
			};

			expect(personRenderer.match(pageData)).toBe(true);
		});
	});

	describe('render', () => {
		it('renders person name as clickable title', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: { type: 'Person' },
			};

			const result = personRenderer.render(pageData);

			const title = result.querySelector('.pretty-popover__title');
			expect(title).toBeTruthy();
			expect(title?.textContent).toBe('John Doe');
			expect(title?.getAttribute('data-page-name')).toBe('John Doe');
		});

		it('includes icon in title when present', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: { type: 'Person', icon: '👤' },
			};

			const result = personRenderer.render(pageData);

			const title = result.querySelector('.pretty-popover__title');
			expect(title?.textContent).toBe('👤 John Doe');
		});

		it('renders photo when URL provided', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: {
					type: 'Person',
					photo: 'https://example.com/photo.jpg',
				},
			};

			const result = personRenderer.render(pageData);

			const photo = result.querySelector('.pretty-popover__person-photo img');
			expect(photo).toBeTruthy();
			expect(photo?.getAttribute('src')).toBe('https://example.com/photo.jpg');
		});

		it('extracts URL from markdown link format', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: {
					type: 'Person',
					photo: '[Profile](https://example.com/photo.jpg)',
				},
			};

			const result = personRenderer.render(pageData);

			const photo = result.querySelector('.pretty-popover__person-photo img');
			expect(photo?.getAttribute('src')).toBe('https://example.com/photo.jpg');
		});

		it('uses card layout when photo present', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: {
					type: 'Person',
					photo: 'https://example.com/photo.jpg',
				},
			};

			const result = personRenderer.render(pageData);

			const card = result.querySelector('.pretty-popover__person-card');
			const info = result.querySelector('.pretty-popover__person-info');
			expect(card).toBeTruthy();
			expect(info).toBeTruthy();
		});

		it('uses simple layout when no photo', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: { type: 'Person' },
			};

			const result = personRenderer.render(pageData);

			const card = result.querySelector('.pretty-popover__person-card');
			expect(card).toBeNull();
		});

		it('renders subtitle with role and organization', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: {
					type: 'Person',
					role: 'Software Engineer',
					organization: 'Acme Corp',
				},
			};

			const result = personRenderer.render(pageData);

			const subtitle = result.querySelector('.pretty-popover__person-subtitle');
			expect(subtitle?.textContent).toBe('Software Engineer at Acme Corp');
		});

		it('renders subtitle with only role', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: {
					type: 'Person',
					role: 'Software Engineer',
				},
			};

			const result = personRenderer.render(pageData);

			const subtitle = result.querySelector('.pretty-popover__person-subtitle');
			expect(subtitle?.textContent).toBe('Software Engineer');
		});

		it('renders subtitle with only organization', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: {
					type: 'Person',
					organization: 'Acme Corp',
				},
			};

			const result = personRenderer.render(pageData);

			const subtitle = result.querySelector('.pretty-popover__person-subtitle');
			expect(subtitle?.textContent).toBe('Acme Corp');
		});

		it('does not render subtitle when no role or organization', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: { type: 'Person' },
			};

			const result = personRenderer.render(pageData);

			const subtitle = result.querySelector('.pretty-popover__person-subtitle');
			expect(subtitle).toBeNull();
		});

		it('renders description when present', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: {
					type: 'Person',
					description: 'Experienced software engineer specializing in web development.',
				},
			};

			const result = personRenderer.render(pageData);

			const desc = result.querySelector('.pretty-popover__description');
			expect(desc?.textContent).toBe('Experienced software engineer specializing in web development.');
		});

		it('renders contact details when present', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: {
					type: 'Person',
					location: 'San Francisco, CA',
					email: 'john@example.com',
					phone: '+1-555-0100',
				},
			};

			const result = personRenderer.render(pageData);

			const details = result.querySelector('.pretty-popover__person-details');
			expect(details).toBeTruthy();

			const labels = Array.from(details?.querySelectorAll('.pretty-popover__person-label') || []);
			const values = Array.from(details?.querySelectorAll('.pretty-popover__person-value') || []);

			expect(labels.map((l) => l.textContent)).toEqual(['Location', 'Email', 'Phone']);
			expect(values.map((v) => v.textContent)).toEqual([
				'San Francisco, CA',
				'john@example.com',
				'+1-555-0100',
			]);
		});

		it('renders only available contact details', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: {
					type: 'Person',
					email: 'john@example.com',
				},
			};

			const result = personRenderer.render(pageData);

			const details = result.querySelector('.pretty-popover__person-details');
			expect(details).toBeTruthy();

			const labels = Array.from(details?.querySelectorAll('.pretty-popover__person-label') || []);
			expect(labels).toHaveLength(1);
			expect(labels[0].textContent).toBe('Email');
		});

		it('does not render details when no contact info', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: { type: 'Person' },
			};

			const result = personRenderer.render(pageData);

			const details = result.querySelector('.pretty-popover__person-details');
			expect(details).toBeNull();
		});

		it('renders tags with Person type', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: { type: 'Person' },
			};

			const result = personRenderer.render(pageData);

			const tags = result.querySelectorAll('.pretty-popover__tag');
			expect(tags).toHaveLength(1);
			expect(tags[0].textContent).toBe('Person');
		});

		it('includes relationship in tags when present', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: {
					type: 'Person',
					relationship: 'Colleague',
				},
			};

			const result = personRenderer.render(pageData);

			const tags = result.querySelectorAll('.pretty-popover__tag');
			expect(tags).toHaveLength(2);
			expect(tags[0].textContent).toBe('Person');
			expect(tags[1].textContent).toBe('Colleague');
		});

		it('renders complete person card with all properties', () => {
			const pageData: PageData = {
				name: 'Jane Smith',
				properties: {
					type: 'Person',
					icon: '👩‍💻',
					photo: 'https://example.com/jane.jpg',
					role: 'Senior Engineer',
					organization: 'Tech Inc',
					description: 'Full-stack developer with 10 years experience.',
					location: 'Seattle, WA',
					email: 'jane@techInc.com',
					phone: '+1-555-0200',
					relationship: 'Mentor',
				},
			};

			const result = personRenderer.render(pageData);

			expect(result.querySelector('.pretty-popover__title')?.textContent).toBe('👩‍💻 Jane Smith');
			expect(result.querySelector('.pretty-popover__person-photo')).toBeTruthy();
			expect(result.querySelector('.pretty-popover__person-subtitle')?.textContent).toBe(
				'Senior Engineer at Tech Inc',
			);
			expect(result.querySelector('.pretty-popover__description')).toBeTruthy();
			expect(result.querySelector('.pretty-popover__person-details')).toBeTruthy();
			expect(result.querySelectorAll('.pretty-popover__tag')).toHaveLength(2);
		});

		it('cleans property values (removes brackets)', () => {
			const pageData: PageData = {
				name: 'John Doe',
				properties: {
					type: '[[Person]]',
					role: '[[Engineer]]',
					organization: '[[Acme Corp]]',
				},
			};

			const result = personRenderer.render(pageData);

			const subtitle = result.querySelector('.pretty-popover__person-subtitle');
			expect(subtitle?.textContent).toBe('Engineer at Acme Corp');
		});
	});
});
