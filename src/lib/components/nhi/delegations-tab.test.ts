import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';

vi.mock('$lib/api/nhi-delegations-client', () => ({
	fetchIncomingDelegations: vi.fn(),
	fetchOutgoingDelegations: vi.fn(),
	revokeDelegationGrantClient: vi.fn()
}));

import { fetchIncomingDelegations, fetchOutgoingDelegations } from '$lib/api/nhi-delegations-client';
import DelegationsTab from './delegations-tab.svelte';

const mockIncoming = vi.mocked(fetchIncomingDelegations);
const mockOutgoing = vi.mocked(fetchOutgoingDelegations);

function mockGrant(overrides: Record<string, unknown> = {}) {
	return {
		id: 'del-1',
		tenant_id: 'tenant-1',
		principal_id: 'user-1',
		principal_type: 'user',
		actor_nhi_id: 'nhi-1',
		allowed_scopes: ['read', 'write'],
		allowed_resource_types: ['api'],
		max_delegation_depth: 1,
		status: 'active',
		granted_at: '2026-01-01T00:00:00Z',
		granted_by: 'admin-1',
		expires_at: null,
		revoked_at: null,
		revoked_by: null,
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-01T00:00:00Z',
		...overrides
	};
}

function makeGrants(count: number) {
	return Array.from({ length: count }, (_, i) =>
		mockGrant({ id: `del-${i}`, principal_id: `user-${i}`, actor_nhi_id: `nhi-${i}` })
	);
}

describe('DelegationsTab', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('shows loading state initially', () => {
		mockIncoming.mockReturnValue(new Promise(() => {}));
		mockOutgoing.mockReturnValue(new Promise(() => {}));

		render(DelegationsTab, { props: { nhiId: 'nhi-1' } });
		expect(screen.getByText('Incoming Delegations')).toBeTruthy();
		expect(screen.getByText('Outgoing Delegations')).toBeTruthy();
	});

	it('shows empty state when no delegations', async () => {
		mockIncoming.mockResolvedValue({ data: [], limit: 20, offset: 0 });
		mockOutgoing.mockResolvedValue({ data: [], limit: 20, offset: 0 });

		render(DelegationsTab, { props: { nhiId: 'nhi-1' } });

		await waitFor(() => {
			expect(screen.getByText('No incoming delegations')).toBeTruthy();
			expect(screen.getByText('No outgoing delegations')).toBeTruthy();
		});
	});

	it('renders incoming delegations with grant data', async () => {
		const grant = mockGrant();
		mockIncoming.mockResolvedValue({ data: [grant as any], limit: 20, offset: 0 });
		mockOutgoing.mockResolvedValue({ data: [], limit: 20, offset: 0 });

		render(DelegationsTab, { props: { nhiId: 'nhi-1' } });

		await waitFor(() => {
			expect(screen.getByText(/Principal: user-1/)).toBeTruthy();
			expect(screen.getByText('Active')).toBeTruthy();
		});
	});

	it('renders outgoing delegations with grant data', async () => {
		const grant = mockGrant({ id: 'del-2', actor_nhi_id: 'nhi-2' });
		mockIncoming.mockResolvedValue({ data: [], limit: 20, offset: 0 });
		mockOutgoing.mockResolvedValue({ data: [grant as any], limit: 20, offset: 0 });

		render(DelegationsTab, { props: { nhiId: 'nhi-1' } });

		await waitFor(() => {
			expect(screen.getByText(/Actor: nhi-2/)).toBeTruthy();
		});
	});

	it('shows error state on fetch failure', async () => {
		mockIncoming.mockRejectedValue(new Error('Network error'));
		mockOutgoing.mockRejectedValue(new Error('Network error'));

		render(DelegationsTab, { props: { nhiId: 'nhi-1' } });

		await waitFor(() => {
			expect(screen.getAllByText('Network error').length).toBe(2);
		});
	});

	it('shows Revoke button only for active grants', async () => {
		const activeGrant = mockGrant({ id: 'del-1', status: 'active' });
		const revokedGrant = mockGrant({ id: 'del-2', status: 'revoked', principal_id: 'user-2' });
		mockIncoming.mockResolvedValue({ data: [activeGrant as any, revokedGrant as any], limit: 20, offset: 0 });
		mockOutgoing.mockResolvedValue({ data: [], limit: 20, offset: 0 });

		render(DelegationsTab, { props: { nhiId: 'nhi-1' } });

		await waitFor(() => {
			const revokeButtons = screen.getAllByText('Revoke');
			expect(revokeButtons.length).toBe(1);
		});
	});

	it('passes correct params to fetch functions', async () => {
		mockIncoming.mockResolvedValue({ data: [], limit: 20, offset: 0 });
		mockOutgoing.mockResolvedValue({ data: [], limit: 20, offset: 0 });

		render(DelegationsTab, { props: { nhiId: 'nhi-42' } });

		await waitFor(() => {
			expect(mockIncoming).toHaveBeenCalledWith('nhi-42', { limit: 20, offset: 0 });
			expect(mockOutgoing).toHaveBeenCalledWith('nhi-42', { limit: 20, offset: 0 });
		});
	});

	it('shows Load More button when page is full', async () => {
		const fullPage = makeGrants(20);
		mockIncoming.mockResolvedValue({ data: fullPage as any[], limit: 20, offset: 0 });
		mockOutgoing.mockResolvedValue({ data: [], limit: 20, offset: 0 });

		render(DelegationsTab, { props: { nhiId: 'nhi-1' } });

		await waitFor(() => {
			const loadMoreButtons = screen.getAllByText('Load More');
			expect(loadMoreButtons.length).toBeGreaterThanOrEqual(1);
		});
	});

	it('does not show Load More button when results are fewer than page size', async () => {
		const partialPage = makeGrants(5);
		mockIncoming.mockResolvedValue({ data: partialPage as any[], limit: 20, offset: 0 });
		mockOutgoing.mockResolvedValue({ data: partialPage as any[], limit: 20, offset: 0 });

		render(DelegationsTab, { props: { nhiId: 'nhi-1' } });

		await waitFor(() => {
			expect(screen.getByText(/Principal: user-0/)).toBeTruthy();
		});

		expect(screen.queryByText('Load More')).toBeNull();
	});

	it('displays scopes and date information', async () => {
		const grant = mockGrant({
			allowed_scopes: ['read', 'write'],
			expires_at: '2027-06-15T00:00:00Z'
		});
		mockIncoming.mockResolvedValue({ data: [grant as any], limit: 20, offset: 0 });
		mockOutgoing.mockResolvedValue({ data: [], limit: 20, offset: 0 });

		render(DelegationsTab, { props: { nhiId: 'nhi-1' } });

		await waitFor(() => {
			expect(screen.getByText(/read, write/)).toBeTruthy();
			expect(screen.getByText(/Expires:/)).toBeTruthy();
		});
	});

	it('shows "All" when allowed_scopes is empty', async () => {
		const grant = mockGrant({ allowed_scopes: [] });
		mockIncoming.mockResolvedValue({ data: [grant as any], limit: 20, offset: 0 });
		mockOutgoing.mockResolvedValue({ data: [], limit: 20, offset: 0 });

		render(DelegationsTab, { props: { nhiId: 'nhi-1' } });

		await waitFor(() => {
			expect(screen.getByText(/Scopes: All/)).toBeTruthy();
		});
	});
});
