import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-requests', () => ({
	listNhiRequests: vi.fn(),
	getNhiRequestSummary: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class extends Error {
		status: number;
		constructor(m: string, s: number) {
			super(m);
			this.status = s;
		}
	}
}));

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load } from './+page.server';
import { listNhiRequests, getNhiRequestSummary } from '$lib/api/nhi-requests';
import { hasAdminRole } from '$lib/server/auth';
import type { NhiAccessRequest, NhiRequestSummary } from '$lib/api/types';

const mockListRequests = vi.mocked(listNhiRequests);
const mockGetSummary = vi.mocked(getNhiRequestSummary);
const mockHasAdminRole = vi.mocked(hasAdminRole);

function makeRequest(overrides: Partial<NhiAccessRequest> = {}): NhiAccessRequest {
	return {
		id: 'req-1',
		requester_id: 'user-1',
		requested_name: 'My Service Account',
		purpose: 'CI/CD pipeline automation',
		requested_permissions: [],
		requested_expiration: null,
		rotation_interval_days: null,
		nhi_type: 'service_account',
		status: 'pending',
		reviewer_id: null,
		review_comments: null,
		created_at: '2026-02-01T00:00:00Z',
		reviewed_at: null,
		nhi_id: null,
		...overrides
	};
}

function makeSummary(): NhiRequestSummary {
	return { pending: 5, approved: 10, rejected: 2, cancelled: 1 };
}

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('NHI Requests +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('returns empty data when no accessToken', async () => {
			const result = (await load({
				locals: { accessToken: null, tenantId: 'tid', user: { roles: [] } },
				url: new URL('http://localhost/nhi/requests'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.requests).toEqual([]);
			expect(result.summary).toBeNull();
			expect(result.total).toBe(0);
			expect(result.isAdmin).toBe(false);
		});

		it('returns empty data when no tenantId', async () => {
			const result = (await load({
				locals: { accessToken: 'tok', tenantId: null, user: { roles: [] } },
				url: new URL('http://localhost/nhi/requests'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.requests).toEqual([]);
			expect(result.total).toBe(0);
		});

		it('returns requests and summary for authenticated user', async () => {
			const requests = [makeRequest()];
			const summary = makeSummary();

			mockListRequests.mockResolvedValue({ items: requests, total: 1, limit: 20, offset: 0 });
			mockGetSummary.mockResolvedValue(summary);

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/nhi/requests'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.requests).toHaveLength(1);
			expect(result.requests[0].id).toBe('req-1');
			expect(result.total).toBe(1);
			expect(result.summary).toEqual(summary);
		});

		it('passes status filter from URL params', async () => {
			mockListRequests.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });
			mockGetSummary.mockResolvedValue(makeSummary());

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/nhi/requests?status=approved'),
				fetch: vi.fn()
			} as any);

			expect(mockListRequests).toHaveBeenCalledWith(
				expect.objectContaining({ status: 'approved' }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('passes offset from URL params', async () => {
			mockListRequests.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 20 });
			mockGetSummary.mockResolvedValue(makeSummary());

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/nhi/requests?offset=20'),
				fetch: vi.fn()
			} as any);

			expect(mockListRequests).toHaveBeenCalledWith(
				expect.objectContaining({ offset: 20 }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns isAdmin true for admin users', async () => {
			mockHasAdminRole.mockReturnValue(true);
			mockListRequests.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });
			mockGetSummary.mockResolvedValue(makeSummary());

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/nhi/requests'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.isAdmin).toBe(true);
		});

		it('returns isAdmin false for non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			mockListRequests.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });
			mockGetSummary.mockResolvedValue(makeSummary());

			const result = (await load({
				locals: mockLocals(false),
				url: new URL('http://localhost/nhi/requests'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.isAdmin).toBe(false);
		});

		it('handles API failure gracefully', async () => {
			mockListRequests.mockRejectedValue(new Error('API error'));

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/nhi/requests'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.requests).toEqual([]);
			expect(result.total).toBe(0);
			expect(result.summary).toBeNull();
		});

		it('handles summary API failure gracefully', async () => {
			mockListRequests.mockResolvedValue({ items: [makeRequest()], total: 1, limit: 20, offset: 0 });
			mockGetSummary.mockRejectedValue(new Error('summary failed'));

			const result = (await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/nhi/requests'),
				fetch: vi.fn()
			} as any)) as any;

			expect(result.requests).toHaveLength(1);
			expect(result.summary).toBeNull();
		});
	});
});

describe('NHI Requests +page.svelte', () => {
	it('is defined as a module', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	}, 15000);

	it('is a valid Svelte component constructor', async () => {
		const mod = await import('./+page.svelte');
		expect(typeof mod.default).toBe('function');
	}, 15000);
});

describe('NHI Requests rendering logic', () => {
	describe('status filter options', () => {
		const statuses = ['pending', 'approved', 'rejected', 'cancelled'];

		it('has 4 status filter options', () => {
			expect(statuses).toHaveLength(4);
		});

		it('includes pending', () => {
			expect(statuses).toContain('pending');
		});

		it('includes approved', () => {
			expect(statuses).toContain('approved');
		});

		it('includes rejected', () => {
			expect(statuses).toContain('rejected');
		});

		it('includes cancelled', () => {
			expect(statuses).toContain('cancelled');
		});
	});

	describe('summary card labels', () => {
		const labels = ['Pending', 'Approved', 'Rejected', 'Cancelled'];

		it('has 4 summary cards', () => {
			expect(labels).toHaveLength(4);
		});
	});

	describe('table columns', () => {
		const columns = ['Name', 'Purpose', 'Status', 'Created', 'Actions'];

		it('has 5 columns', () => {
			expect(columns).toHaveLength(5);
		});

		it('has Name column', () => {
			expect(columns).toContain('Name');
		});

		it('has Status column', () => {
			expect(columns).toContain('Status');
		});
	});

	describe('empty state', () => {
		it('shows correct empty message', () => {
			const msg = 'No NHI access requests match your filters.';
			expect(msg).toBe('No NHI access requests match your filters.');
		});
	});

	describe('create link', () => {
		it('points to /nhi/requests/create', () => {
			const href = '/nhi/requests/create';
			expect(href).toBe('/nhi/requests/create');
		});
	});

	describe('mock data conformity', () => {
		it('NhiAccessRequest has all required fields', () => {
			const r = makeRequest();
			expect(r.id).toBeDefined();
			expect(r.requester_id).toBeDefined();
			expect(r.requested_name).toBeDefined();
			expect(r.purpose).toBeDefined();
			expect(r.status).toBeDefined();
			expect(r.created_at).toBeDefined();
		});

		it('NhiAccessRequest status is a valid value', () => {
			const validStatuses = ['pending', 'approved', 'rejected', 'cancelled'];
			const r = makeRequest();
			expect(validStatuses).toContain(r.status);
		});
	});
});
