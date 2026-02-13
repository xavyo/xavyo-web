import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';

vi.mock('sveltekit-superforms', async () => {
	const actual = await vi.importActual('sveltekit-superforms');
	return { ...actual };
});

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import Page from './+page.svelte';

describe('Detection Rule Create Page', () => {
	afterEach(() => { cleanup(); });

	const mockData = {
		form: {
			valid: true,
			data: { name: '', rule_type: 'no_manager', is_enabled: true, priority: 1, days_threshold: undefined, expression: undefined, description: undefined },
			errors: {},
			id: '',
			posted: false,
			constraints: {}
		}
	};

	it('renders page title', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('Create Detection Rule')).toBeTruthy();
	});

	it('renders name input', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('Name')).toBeTruthy();
	});

	it('renders rule type selector', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('Rule Type')).toBeTruthy();
	});

	it('renders priority input', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('Priority')).toBeTruthy();
	});

	it('renders create button', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('Create Rule')).toBeTruthy();
	});

	it('renders cancel link', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('Cancel')).toBeTruthy();
	});
});
