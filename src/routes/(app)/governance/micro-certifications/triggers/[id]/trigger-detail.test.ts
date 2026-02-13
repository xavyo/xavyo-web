import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn(),
	goto: vi.fn(),
	beforeNavigate: vi.fn(),
	afterNavigate: vi.fn(),
	onNavigate: vi.fn()
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

const { default: Page } = await import('./+page.svelte');

const mockRule = {
	id: '00000000-0000-0000-0000-000000000002',
	tenant_id: 't1',
	name: 'High Risk Assignment Review',
	trigger_type: 'high_risk_assignment' as const,
	scope_type: 'tenant' as const,
	scope_id: null,
	reviewer_type: 'user_manager' as const,
	specific_reviewer_id: null,
	fallback_reviewer_id: null,
	timeout_secs: 86400,
	reminder_threshold_percent: 75,
	auto_revoke: true,
	revoke_triggering_assignment: false,
	is_active: true,
	is_default: false,
	priority: null,
	metadata: null,
	created_at: '2026-02-13T10:00:00Z'
};

const mockForm = {
	id: 'test-form',
	valid: true,
	posted: false,
	errors: {},
	data: {
		name: mockRule.name,
		trigger_type: mockRule.trigger_type,
		scope_type: mockRule.scope_type,
		timeout_secs: mockRule.timeout_secs,
		reminder_threshold_percent: mockRule.reminder_threshold_percent,
		auto_revoke: mockRule.auto_revoke,
		revoke_triggering_assignment: mockRule.revoke_triggering_assignment,
		is_default: mockRule.is_default
	},
	constraints: {}
};

describe('Trigger Rule Detail Page', () => {
	it('renders rule name as heading', () => {
		render(Page, { props: { data: { rule: mockRule, form: mockForm } as any } });
		expect(screen.getByText('High Risk Assignment Review')).toBeTruthy();
	});

	it('shows trigger type badge', () => {
		render(Page, { props: { data: { rule: mockRule, form: mockForm } as any } });
		expect(screen.getAllByText('High Risk').length).toBeGreaterThanOrEqual(1);
	});

	it('shows scope badge', () => {
		render(Page, { props: { data: { rule: mockRule, form: mockForm } as any } });
		expect(screen.getAllByText('Tenant').length).toBeGreaterThanOrEqual(1);
	});

	it('shows active status', () => {
		render(Page, { props: { data: { rule: mockRule, form: mockForm } as any } });
		expect(screen.getByText('Active')).toBeTruthy();
	});

	it('shows disable button when active', () => {
		render(Page, { props: { data: { rule: mockRule, form: mockForm } as any } });
		expect(screen.getByText('Disable')).toBeTruthy();
	});

	it('shows enable button when inactive', () => {
		render(Page, { props: { data: { rule: { ...mockRule, is_active: false }, form: mockForm } as any } });
		expect(screen.getByText('Enable')).toBeTruthy();
	});

	it('shows edit button', () => {
		render(Page, { props: { data: { rule: mockRule, form: mockForm } as any } });
		expect(screen.getByText('Edit')).toBeTruthy();
	});

	it('shows delete button', () => {
		render(Page, { props: { data: { rule: mockRule, form: mockForm } as any } });
		expect(screen.getByText('Delete')).toBeTruthy();
	});

	it('shows set as default button when not default', () => {
		render(Page, { props: { data: { rule: mockRule, form: mockForm } as any } });
		expect(screen.getByText('Set as Default')).toBeTruthy();
	});

	it('hides set as default button when already default', () => {
		render(Page, { props: { data: { rule: { ...mockRule, is_default: true }, form: mockForm } as any } });
		expect(screen.queryByText('Set as Default')).toBeNull();
	});

	it('shows rule details', () => {
		render(Page, { props: { data: { rule: mockRule, form: mockForm } as any } });
		expect(screen.getByText('Timeout')).toBeTruthy();
		expect(screen.getByText('86400s')).toBeTruthy();
	});

	it('shows back link', () => {
		render(Page, { props: { data: { rule: mockRule, form: mockForm } as any } });
		expect(screen.getByText(/Back to Micro Certifications/)).toBeTruthy();
	});
});
