import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn(),
	beforeNavigate: vi.fn(),
	afterNavigate: vi.fn(),
	goto: vi.fn()
}));

vi.mock('$app/forms', () => ({
	enhance: () => () => {}
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import Page from './+page.svelte';

describe('Semi-Manual Config Page', () => {
	afterEach(() => { cleanup(); });

	const mockData = {
		applications: {
			items: [
				{
					id: 'app-1',
					name: 'HR System',
					description: 'Human Resources',
					is_semi_manual: true,
					ticketing_config_id: null,
					sla_policy_id: null,
					requires_approval_before_ticket: false,
					status: 'active',
					created_at: '2025-01-01T00:00:00Z',
					updated_at: '2025-01-01T00:00:00Z'
				}
			],
			total: 1,
			limit: 50,
			offset: 0
		},
		form: { valid: true, data: { is_semi_manual: true, ticketing_config_id: null, sla_policy_id: null, requires_approval_before_ticket: false }, errors: {}, id: '', posted: false, constraints: {} }
	};

	it('renders page title', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('Semi-Manual Applications')).toBeTruthy();
	});

	it('renders application list', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('HR System')).toBeTruthy();
	});

	it('renders configure button', () => {
		render(Page, { props: { data: mockData } as any });
		expect(screen.getByText('Configure Application')).toBeTruthy();
	});

	it('renders empty state', () => {
		const emptyData = { ...mockData, applications: { items: [], total: 0, limit: 50, offset: 0 } };
		render(Page, { props: { data: emptyData } as any });
		expect(screen.getByText('No semi-manual applications')).toBeTruthy();
	});
});
