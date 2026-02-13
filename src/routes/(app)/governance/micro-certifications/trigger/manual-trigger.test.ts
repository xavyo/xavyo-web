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

const mockForm = {
	id: 'test-form',
	valid: true,
	posted: false,
	errors: {},
	data: {
		user_id: '',
		entitlement_id: '',
		trigger_rule_id: undefined,
		reviewer_id: undefined,
		reason: ''
	},
	constraints: {}
};

describe('Manual Trigger Page', () => {
	it('renders page title', () => {
		render(Page, { props: { data: { form: mockForm } as any } });
		expect(screen.getByRole('heading', { name: 'Trigger Certification' })).toBeTruthy();
	});

	it('shows user ID input', () => {
		render(Page, { props: { data: { form: mockForm } as any } });
		expect(screen.getByLabelText('User ID')).toBeTruthy();
	});

	it('shows entitlement ID input', () => {
		render(Page, { props: { data: { form: mockForm } as any } });
		expect(screen.getByLabelText('Entitlement ID')).toBeTruthy();
	});

	it('shows reason field', () => {
		render(Page, { props: { data: { form: mockForm } as any } });
		expect(screen.getByLabelText('Reason')).toBeTruthy();
	});

	it('shows optional trigger rule ID field', () => {
		render(Page, { props: { data: { form: mockForm } as any } });
		expect(screen.getByLabelText(/Trigger Rule ID/)).toBeTruthy();
	});

	it('shows optional reviewer ID field', () => {
		render(Page, { props: { data: { form: mockForm } as any } });
		expect(screen.getByLabelText(/Reviewer ID/)).toBeTruthy();
	});

	it('shows submit button', () => {
		render(Page, { props: { data: { form: mockForm } as any } });
		expect(screen.getByRole('button', { name: 'Trigger Certification' })).toBeTruthy();
	});

	it('shows back link', () => {
		render(Page, { props: { data: { form: mockForm } as any } });
		expect(screen.getByText(/Back to Micro Certifications/)).toBeTruthy();
	});
});
