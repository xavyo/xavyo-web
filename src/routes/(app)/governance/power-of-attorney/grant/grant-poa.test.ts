import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import GrantPage from './+page.svelte';

function makeMockForm() {
	return {
		id: 'test',
		valid: true,
		posted: false,
		errors: {},
		data: {
			attorney_id: '',
			scope_application_ids: '',
			scope_workflow_types: '',
			starts_at: '',
			ends_at: '',
			reason: ''
		},
		constraints: {},
		shape: {},
		tainted: undefined,
		message: undefined
	};
}

describe('Grant PoA Page', () => {
	it('renders page title', () => {
		render(GrantPage, {
			props: {
				data: { form: makeMockForm(), users: [], currentUserId: 'u1' } as any
			}
		});
		expect(screen.getByText('Grant Power of Attorney')).toBeTruthy();
	});

	it('renders attorney input when no users loaded', () => {
		render(GrantPage, {
			props: {
				data: { form: makeMockForm(), users: [], currentUserId: 'u1' } as any
			}
		});
		expect(screen.getByLabelText('Grantee')).toBeTruthy();
	});

	it('renders attorney select when users loaded', () => {
		render(GrantPage, {
			props: {
				data: {
					form: makeMockForm(),
					users: [{ id: 'u2', email: 'user@test.com', name: 'Test User' }],
					currentUserId: 'u1'
				} as any
			}
		});
		expect(screen.getByText(/Test User/)).toBeTruthy();
	});

	it('filters out current user from attorney options', () => {
		render(GrantPage, {
			props: {
				data: {
					form: makeMockForm(),
					users: [
						{ id: 'u1', email: 'me@test.com', name: 'Me' },
						{ id: 'u2', email: 'other@test.com', name: 'Other' }
					],
					currentUserId: 'u1'
				} as any
			}
		});
		expect(screen.queryByText(/Me \(me@test.com\)/)).toBeFalsy();
		expect(screen.getByText(/Other/)).toBeTruthy();
	});

	it('renders start and end date fields', () => {
		render(GrantPage, {
			props: {
				data: { form: makeMockForm(), users: [], currentUserId: 'u1' } as any
			}
		});
		expect(screen.getByLabelText('Start date')).toBeTruthy();
		expect(screen.getByLabelText('End date')).toBeTruthy();
	});

	it('renders reason textarea', () => {
		render(GrantPage, {
			props: {
				data: { form: makeMockForm(), users: [], currentUserId: 'u1' } as any
			}
		});
		expect(screen.getByLabelText('Reason')).toBeTruthy();
	});

	it('renders submit button', () => {
		render(GrantPage, {
			props: {
				data: { form: makeMockForm(), users: [], currentUserId: 'u1' } as any
			}
		});
		expect(screen.getByText('Grant PoA')).toBeTruthy();
	});

	it('renders cancel link', () => {
		render(GrantPage, {
			props: {
				data: { form: makeMockForm(), users: [], currentUserId: 'u1' } as any
			}
		});
		expect(screen.getByText('Cancel')).toBeTruthy();
	});
});
