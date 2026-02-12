import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import DetailPage from './+page.svelte';

function makeMockForm(id = 'default') {
	return {
		id,
		valid: true,
		posted: false,
		errors: {},
		data: id === 'extend' ? { new_ends_at: '' } : { reason: '' },
		constraints: {},
		shape: {},
		tainted: undefined,
		message: undefined
	};
}

const mockPoa = {
	id: 'poa-1',
	donor_id: 'donor-1',
	attorney_id: 'attorney-1',
	starts_at: '2026-02-12T00:00:00Z',
	ends_at: '2026-03-12T00:00:00Z',
	status: 'active' as const,
	is_currently_active: true,
	scope_id: null,
	reason: 'Planned vacation',
	created_at: '2026-02-12T00:00:00Z',
	revoked_at: null,
	revoked_by: null
};

const mockAudit = {
	items: [
		{
			id: 'evt-1',
			event_type: 'granted',
			actor_id: 'donor-1',
			actor_name: null,
			affected_user_id: null,
			affected_user_name: null,
			details: {},
			created_at: '2026-02-12T10:00:00Z'
		}
	],
	total: 1,
	limit: 50,
	offset: 0
};

describe('PoA Detail Page', () => {
	it('renders page title with truncated ID', () => {
		render(DetailPage, {
			props: {
				data: {
					poa: mockPoa,
					audit: mockAudit,
					revokeForm: makeMockForm(),
					extendForm: makeMockForm('extend'),
					isGrantor: true,
					isGrantee: false,
					currentUserId: 'donor-1'
				} as any
			}
		});
		expect(screen.getByText('Power of Attorney')).toBeTruthy();
	});

	it('renders status badge', () => {
		render(DetailPage, {
			props: {
				data: {
					poa: mockPoa,
					audit: { items: [], total: 0, limit: 50, offset: 0 },
					revokeForm: makeMockForm(),
					extendForm: makeMockForm('extend'),
					isGrantor: true,
					isGrantee: false,
					currentUserId: 'donor-1'
				} as any
			}
		});
		expect(screen.getByText('Active')).toBeTruthy();
	});

	it('renders grant details', () => {
		render(DetailPage, {
			props: {
				data: {
					poa: mockPoa,
					audit: { items: [], total: 0, limit: 50, offset: 0 },
					revokeForm: makeMockForm(),
					extendForm: makeMockForm('extend'),
					isGrantor: true,
					isGrantee: false,
					currentUserId: 'donor-1'
				} as any
			}
		});
		expect(screen.getByText('Planned vacation')).toBeTruthy();
		expect(screen.getByText('donor-1')).toBeTruthy();
		expect(screen.getByText('attorney-1')).toBeTruthy();
	});

	it('shows scope_id as null when no scope', () => {
		render(DetailPage, {
			props: {
				data: {
					poa: mockPoa,
					audit: { items: [], total: 0, limit: 50, offset: 0 },
					revokeForm: makeMockForm(),
					extendForm: makeMockForm('extend'),
					isGrantor: true,
					isGrantee: false,
					currentUserId: 'donor-1'
				} as any
			}
		});
		expect(screen.getByText('Planned vacation')).toBeTruthy();
	});

	it('shows revoke button for active PoA when grantor', () => {
		render(DetailPage, {
			props: {
				data: {
					poa: mockPoa,
					audit: { items: [], total: 0, limit: 50, offset: 0 },
					revokeForm: makeMockForm(),
					extendForm: makeMockForm('extend'),
					isGrantor: true,
					isGrantee: false,
					currentUserId: 'donor-1'
				} as any
			}
		});
		expect(screen.getByText('Revoke')).toBeTruthy();
	});

	it('shows extend button for active PoA when grantor', () => {
		render(DetailPage, {
			props: {
				data: {
					poa: mockPoa,
					audit: { items: [], total: 0, limit: 50, offset: 0 },
					revokeForm: makeMockForm(),
					extendForm: makeMockForm('extend'),
					isGrantor: true,
					isGrantee: false,
					currentUserId: 'donor-1'
				} as any
			}
		});
		expect(screen.getByText('Extend')).toBeTruthy();
	});

	it('shows assume button for active PoA when grantee', () => {
		render(DetailPage, {
			props: {
				data: {
					poa: mockPoa,
					audit: { items: [], total: 0, limit: 50, offset: 0 },
					revokeForm: makeMockForm(),
					extendForm: makeMockForm('extend'),
					isGrantor: false,
					isGrantee: true,
					currentUserId: 'attorney-1'
				} as any
			}
		});
		expect(screen.getByText('Assume Identity')).toBeTruthy();
	});

	it('hides action buttons for revoked PoA', () => {
		const revokedPoa = { ...mockPoa, status: 'revoked' as const, revoked_at: '2026-02-15T00:00:00Z', is_currently_active: false };
		render(DetailPage, {
			props: {
				data: {
					poa: revokedPoa,
					audit: { items: [], total: 0, limit: 50, offset: 0 },
					revokeForm: makeMockForm(),
					extendForm: makeMockForm('extend'),
					isGrantor: true,
					isGrantee: false,
					currentUserId: 'donor-1'
				} as any
			}
		});
		expect(screen.queryByText('Revoke')).toBeFalsy();
		expect(screen.queryByText('Extend')).toBeFalsy();
	});

	it('renders audit trail events', () => {
		render(DetailPage, {
			props: {
				data: {
					poa: mockPoa,
					audit: mockAudit,
					revokeForm: makeMockForm(),
					extendForm: makeMockForm('extend'),
					isGrantor: true,
					isGrantee: false,
					currentUserId: 'donor-1'
				} as any
			}
		});
		expect(screen.getByText('Audit Trail')).toBeTruthy();
		expect(screen.getAllByText('Granted').length).toBeGreaterThanOrEqual(1);
	});

	it('shows audit type filter', () => {
		render(DetailPage, {
			props: {
				data: {
					poa: mockPoa,
					audit: mockAudit,
					revokeForm: makeMockForm(),
					extendForm: makeMockForm('extend'),
					isGrantor: true,
					isGrantee: false,
					currentUserId: 'donor-1'
				} as any
			}
		});
		expect(screen.getByText('All events')).toBeTruthy();
	});

	it('shows back link', () => {
		render(DetailPage, {
			props: {
				data: {
					poa: mockPoa,
					audit: { items: [], total: 0, limit: 50, offset: 0 },
					revokeForm: makeMockForm(),
					extendForm: makeMockForm('extend'),
					isGrantor: true,
					isGrantee: false,
					currentUserId: 'donor-1'
				} as any
			}
		});
		expect(screen.getByText('Back')).toBeTruthy();
	});
});
