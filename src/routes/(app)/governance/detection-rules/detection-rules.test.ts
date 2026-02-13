import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
	invalidateAll: vi.fn()
}));

vi.mock('$app/forms', () => ({
	enhance: () => () => {}
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import Page from './+page.svelte';

describe('Detection Rules List Page', () => {
	afterEach(() => { cleanup(); });

	const mockData = {
		rules: {
			items: [
				{
					id: 'rule-1',
					name: 'Inactive 90 Days',
					rule_type: 'inactive' as const,
					is_enabled: true,
					priority: 10,
					parameters: { days_threshold: 90 },
					description: 'Detect inactive accounts',
					created_at: '2025-01-01T00:00:00Z',
					updated_at: '2025-01-01T00:00:00Z'
				}
			],
			total: 1,
			limit: 50,
			offset: 0
		},
		filters: { rule_type: undefined, is_enabled: undefined }
	};

	it('renders page title', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('Detection Rules')).toBeTruthy();
	});

	it('renders rule list', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('Inactive 90 Days')).toBeTruthy();
	});

	it('renders create rule button', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('Create Rule')).toBeTruthy();
	});

	it('renders seed defaults button', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('Seed Defaults')).toBeTruthy();
	});

	it('renders type filter', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('All Types')).toBeTruthy();
	});

	it('renders empty state when no rules', () => {
		const emptyData = { ...mockData, rules: { items: [], total: 0, limit: 50, offset: 0 } };
		render(Page, { props: { data: emptyData } as any });
		expect(screen.getByText('No detection rules')).toBeTruthy();
	});

	it('shows enabled badge for enabled rules', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getAllByText('Enabled').length).toBeGreaterThanOrEqual(1);
	});

	it('shows disable button for enabled rules', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('Disable')).toBeTruthy();
	});
});
