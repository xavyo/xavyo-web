import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';
import EmptyState from './empty-state.svelte';

describe('EmptyState', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders title', () => {
		render(EmptyState, { props: { title: 'No users yet' } });
		expect(screen.getByText('No users yet')).toBeTruthy();
	});

	it('renders description when provided', () => {
		render(EmptyState, {
			props: { title: 'No users yet', description: 'Create your first user to get started.' }
		});
		expect(screen.getByText('Create your first user to get started.')).toBeTruthy();
	});

	it('does not render description when not provided', () => {
		render(EmptyState, { props: { title: 'No users yet' } });
		const paragraphs = document.querySelectorAll('p');
		expect(paragraphs.length).toBe(0);
	});

	it('renders icon when provided', () => {
		render(EmptyState, { props: { title: 'No users yet', icon: '👥' } });
		expect(screen.getByText('👥')).toBeTruthy();
	});

	it('does not render icon when not provided', () => {
		const { container } = render(EmptyState, { props: { title: 'No data' } });
		const spans = container.querySelectorAll('span');
		expect(spans.length).toBe(0);
	});

	it('renders action link when actionLabel and actionHref provided', () => {
		render(EmptyState, {
			props: {
				title: 'No users yet',
				actionLabel: 'Create user',
				actionHref: '/users/create'
			}
		});
		const link = screen.getByText('Create user');
		expect(link).toBeTruthy();
		expect(link.getAttribute('href')).toBe('/users/create');
	});

	it('does not render action link when actionLabel missing', () => {
		render(EmptyState, {
			props: { title: 'No data', actionHref: '/create' }
		});
		const links = document.querySelectorAll('a');
		expect(links.length).toBe(0);
	});

	it('does not render action link when actionHref missing', () => {
		render(EmptyState, {
			props: { title: 'No data', actionLabel: 'Create' }
		});
		const links = document.querySelectorAll('a');
		expect(links.length).toBe(0);
	});

	it('has centered layout with correct classes', () => {
		const { container } = render(EmptyState, { props: { title: 'Test' } });
		const wrapper = container.querySelector('div');
		expect(wrapper?.className).toContain('flex');
		expect(wrapper?.className).toContain('items-center');
		expect(wrapper?.className).toContain('justify-center');
		expect(wrapper?.className).toContain('text-center');
	});
});
