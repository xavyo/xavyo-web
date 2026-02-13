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

// Mock superValidate output
const mockForm = {
	id: 'test-form',
	valid: true,
	posted: false,
	errors: {},
	data: {
		name: '',
		trigger_type: 'high_risk_assignment',
		scope_type: 'tenant',
		scope_id: undefined,
		reviewer_type: 'user_manager',
		specific_reviewer_id: undefined,
		fallback_reviewer_id: undefined,
		timeout_secs: undefined,
		reminder_threshold_percent: undefined,
		auto_revoke: false,
		revoke_triggering_assignment: false,
		is_default: false,
		priority: undefined,
		metadata: undefined
	},
	constraints: {}
};

describe('Trigger Rule Create Page', () => {
	it('renders page title', () => {
		render(Page, {
			props: { data: { form: mockForm } as any }
		});
		expect(screen.getByRole('heading', { name: 'Create Trigger Rule' })).toBeTruthy();
	});

	it('shows name input', () => {
		render(Page, {
			props: { data: { form: mockForm } as any }
		});
		expect(screen.getByLabelText('Name')).toBeTruthy();
	});

	it('shows trigger type select', () => {
		render(Page, {
			props: { data: { form: mockForm } as any }
		});
		expect(screen.getByLabelText('Trigger Type')).toBeTruthy();
	});

	it('shows scope type select', () => {
		render(Page, {
			props: { data: { form: mockForm } as any }
		});
		expect(screen.getByLabelText('Scope')).toBeTruthy();
	});

	it('shows reviewer type select', () => {
		render(Page, {
			props: { data: { form: mockForm } as any }
		});
		expect(screen.getByLabelText('Reviewer Type')).toBeTruthy();
	});

	it('shows auto-revoke checkbox', () => {
		render(Page, {
			props: { data: { form: mockForm } as any }
		});
		expect(screen.getByText('Auto-revoke on expiration')).toBeTruthy();
	});

	it('shows submit button', () => {
		render(Page, {
			props: { data: { form: mockForm } as any }
		});
		expect(screen.getByRole('button', { name: 'Create Trigger Rule' })).toBeTruthy();
	});

	it('shows back link', () => {
		render(Page, {
			props: { data: { form: mockForm } as any }
		});
		expect(screen.getByText(/Back to Micro Certifications/)).toBeTruthy();
	});
});
