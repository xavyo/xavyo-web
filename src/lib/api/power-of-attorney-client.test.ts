import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listPoaClient, getPoaClient, grantPoaClient, revokePoaClient,
	extendPoaClient, assumeIdentityClient, dropIdentityClient,
	getCurrentAssumptionClient, getPoaAuditClient, adminListPoaClient,
	adminRevokePoaClient
} from './power-of-attorney-client';

const mockFetch = vi.fn();

beforeEach(() => {
	mockFetch.mockReset();
});

function mockOk(data: unknown = {}) {
	mockFetch.mockResolvedValueOnce({
		ok: true,
		json: async () => data
	});
}

function mockError(status: number) {
	mockFetch.mockResolvedValueOnce({
		ok: false,
		status
	});
}

describe('listPoaClient', () => {
	it('fetches PoA list with direction param', async () => {
		mockOk({ items: [], total: 0, limit: 20, offset: 0 });
		const result = await listPoaClient({ direction: 'incoming' }, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('direction=incoming'));
		expect(result.items).toEqual([]);
	});

	it('includes status filter', async () => {
		mockOk({ items: [], total: 0, limit: 20, offset: 0 });
		await listPoaClient({ direction: 'outgoing', status: 'active' }, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('status=active'));
	});

	it('throws on error', async () => {
		mockError(500);
		await expect(listPoaClient({ direction: 'outgoing' }, mockFetch)).rejects.toThrow('Failed to fetch PoA list: 500');
	});
});

describe('getPoaClient', () => {
	it('fetches a single PoA', async () => {
		mockOk({ id: 'poa-1', status: 'active' });
		const result = await getPoaClient('poa-1', mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/power-of-attorney/poa-1');
		expect(result.id).toBe('poa-1');
	});

	it('throws on error', async () => {
		mockError(404);
		await expect(getPoaClient('poa-1', mockFetch)).rejects.toThrow('Failed to fetch PoA: 404');
	});
});

describe('grantPoaClient', () => {
	it('sends POST with grant data', async () => {
		const data = { attorney_id: 'g2', starts_at: '2026-01-01', ends_at: '2026-02-01', reason: 'test' };
		mockOk({ id: 'new-poa' });
		await grantPoaClient(data, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/power-of-attorney', expect.objectContaining({
			method: 'POST',
			body: JSON.stringify(data)
		}));
	});

	it('throws on error', async () => {
		mockError(400);
		await expect(grantPoaClient({} as any, mockFetch)).rejects.toThrow('Failed to grant PoA: 400');
	});
});

describe('revokePoaClient', () => {
	it('sends POST to revoke endpoint', async () => {
		mockOk({ id: 'poa-1', status: 'revoked' });
		await revokePoaClient('poa-1', { reason: 'done' }, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/power-of-attorney/poa-1/revoke', expect.objectContaining({ method: 'POST' }));
	});

	it('works without reason', async () => {
		mockOk({ id: 'poa-1', status: 'revoked' });
		await revokePoaClient('poa-1', {}, mockFetch);
		expect(mockFetch).toHaveBeenCalled();
	});
});

describe('extendPoaClient', () => {
	it('sends POST with new end date', async () => {
		mockOk({ id: 'poa-1', ends_at: '2026-04-01' });
		await extendPoaClient('poa-1', { new_ends_at: '2026-04-01' }, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/power-of-attorney/poa-1/extend', expect.objectContaining({ method: 'POST' }));
	});
});

describe('assumeIdentityClient', () => {
	it('sends POST with empty body', async () => {
		mockOk({ access_token: 'jwt', assumed_user_id: 'u1', poa_id: 'p1', expires_at: '2026-03-01' });
		await assumeIdentityClient('poa-1', mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/power-of-attorney/poa-1/assume', expect.objectContaining({
			method: 'POST',
			body: JSON.stringify({})
		}));
	});

	it('throws on error', async () => {
		mockError(403);
		await expect(assumeIdentityClient('poa-1', mockFetch)).rejects.toThrow('Failed to assume identity: 403');
	});
});

describe('dropIdentityClient', () => {
	it('sends POST to drop endpoint', async () => {
		mockOk({ message: 'dropped' });
		await dropIdentityClient(mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/power-of-attorney/drop', expect.objectContaining({ method: 'POST' }));
	});
});

describe('getCurrentAssumptionClient', () => {
	it('fetches current assumption status', async () => {
		mockOk({ is_assuming: false, poa_id: null, assumed_identity: null });
		const result = await getCurrentAssumptionClient(mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/power-of-attorney/current-assumption');
		expect(result.is_assuming).toBe(false);
	});
});

describe('getPoaAuditClient', () => {
	it('fetches audit trail', async () => {
		mockOk({ items: [], total: 0, limit: 20, offset: 0 });
		await getPoaAuditClient('poa-1', {}, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/governance/power-of-attorney/poa-1/audit'));
	});

	it('includes event_type filter', async () => {
		mockOk({ items: [], total: 0, limit: 20, offset: 0 });
		await getPoaAuditClient('poa-1', { event_type: 'assumed' }, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('event_type=assumed'));
	});
});

describe('adminListPoaClient', () => {
	it('fetches admin PoA list', async () => {
		mockOk({ items: [], total: 0, limit: 20, offset: 0 });
		await adminListPoaClient({}, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('/api/governance/power-of-attorney/admin'));
	});

	it('includes status filter', async () => {
		mockOk({ items: [], total: 0, limit: 20, offset: 0 });
		await adminListPoaClient({ status: 'active' }, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith(expect.stringContaining('status=active'));
	});
});

describe('adminRevokePoaClient', () => {
	it('sends POST to admin revoke endpoint', async () => {
		mockOk({ id: 'poa-1', status: 'revoked' });
		await adminRevokePoaClient('poa-1', { reason: 'security' }, mockFetch);
		expect(mockFetch).toHaveBeenCalledWith('/api/governance/power-of-attorney/admin/poa-1/revoke', expect.objectContaining({ method: 'POST' }));
	});
});
