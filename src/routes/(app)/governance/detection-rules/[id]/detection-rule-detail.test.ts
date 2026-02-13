import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, cleanup, screen } from '@testing-library/svelte';

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn()
}));

vi.mock('$app/forms', () => ({
	enhance: () => () => {}
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import Page from './+page.svelte';

describe('Detection Rule Detail Page', () => {
	afterEach(() => { cleanup(); });

	const mockRule = {
		id: 'rule-1',
		name: 'Inactive 90 Days',
		rule_type: 'inactive' as const,
		is_enabled: true,
		priority: 10,
		parameters: { days_threshold: 90 },
		description: 'Detects accounts inactive for 90+ days',
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-02T00:00:00Z'
	};

	it('renders rule name as title', () => {
		render(Page, { props: { data: { rule: mockRule } } as any });
		expect(screen.getAllByText('Inactive 90 Days').length).toBeGreaterThanOrEqual(1);
	});

	it('renders rule information', () => {
		render(Page, { props: { data: { rule: mockRule } } as any });
		expect(screen.getByText('Rule Information')).toBeTruthy();
	});

	it('renders parameters section', () => {
		render(Page, { props: { data: { rule: mockRule } } as any });
		expect(screen.getByText('Parameters')).toBeTruthy();
	});

	it('renders edit link', () => {
		render(Page, { props: { data: { rule: mockRule } } as any });
		expect(screen.getByText('Edit')).toBeTruthy();
	});

	it('shows disable button for enabled rule', () => {
		render(Page, { props: { data: { rule: mockRule } } as any });
		expect(screen.getByText('Disable')).toBeTruthy();
	});

	it('shows enable button for disabled rule', () => {
		const disabled = { ...mockRule, is_enabled: false };
		render(Page, { props: { data: { rule: disabled } } as any });
		expect(screen.getByText('Enable')).toBeTruthy();
	});

	it('renders delete button', () => {
		render(Page, { props: { data: { rule: mockRule } } as any });
		expect(screen.getByText('Delete')).toBeTruthy();
	});

	it('renders back link', () => {
		render(Page, { props: { data: { rule: mockRule } } as any });
		expect(screen.getByText('← Back to Detection Rules')).toBeTruthy();
	});
});
