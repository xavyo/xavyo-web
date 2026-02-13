import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';

vi.mock('$lib/api/power-of-attorney-client', () => ({
	listPoaClient: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 }),
	adminListPoaClient: vi.fn().mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 }),
	adminRevokePoaClient: vi.fn().mockResolvedValue({ id: '1', status: 'revoked' })
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import HubPage from './+page.svelte';

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

describe('Power of Attorney Hub', () => {
	it('renders page title', () => {
		render(HubPage, {
			props: {
				data: {
					outgoing: { items: [], total: 0, limit: 20, offset: 0 },
					isAdmin: false
				} as any
			}
		});
		expect(screen.getByText('Power of Attorney')).toBeTruthy();
	});

	it('shows Grant PoA link', () => {
		render(HubPage, {
			props: {
				data: {
					outgoing: { items: [], total: 0, limit: 20, offset: 0 },
					isAdmin: false
				} as any
			}
		});
		expect(screen.getByText('Grant PoA')).toBeTruthy();
	});

	it('shows My PoA tab', () => {
		render(HubPage, {
			props: {
				data: {
					outgoing: { items: [], total: 0, limit: 20, offset: 0 },
					isAdmin: false
				} as any
			}
		});
		expect(screen.getByText('My PoA')).toBeTruthy();
	});

	it('hides admin tab for non-admins', () => {
		render(HubPage, {
			props: {
				data: {
					outgoing: { items: [], total: 0, limit: 20, offset: 0 },
					isAdmin: false
				} as any
			}
		});
		expect(screen.queryByText('Admin')).toBeFalsy();
	});

	it('shows admin tab for admins', () => {
		render(HubPage, {
			props: {
				data: {
					outgoing: { items: [], total: 0, limit: 20, offset: 0 },
					isAdmin: true
				} as any
			}
		});
		expect(screen.getByText('Admin')).toBeTruthy();
	});

	it('shows direction toggle buttons', () => {
		render(HubPage, {
			props: {
				data: {
					outgoing: { items: [], total: 0, limit: 20, offset: 0 },
					isAdmin: false
				} as any
			}
		});
		expect(screen.getByText(/Outgoing/)).toBeTruthy();
		expect(screen.getByText(/Incoming/)).toBeTruthy();
	});

	it('shows empty state when no grants', () => {
		render(HubPage, {
			props: {
				data: {
					outgoing: { items: [], total: 0, limit: 20, offset: 0 },
					isAdmin: false
				} as any
			}
		});
		expect(screen.getByText('No PoA grants')).toBeTruthy();
	});

	it('renders PoA cards when grants exist', () => {
		render(HubPage, {
			props: {
				data: {
					outgoing: { items: [mockPoa], total: 1, limit: 20, offset: 0 },
					isAdmin: false
				} as any
			}
		});
		expect(screen.getByText('Planned vacation')).toBeTruthy();
		expect(screen.getByText('Active')).toBeTruthy();
	});
});
