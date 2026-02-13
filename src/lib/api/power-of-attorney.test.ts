import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	grantPoa, listPoa, getPoa, revokePoa, extendPoa,
	assumeIdentity, dropIdentity, getCurrentAssumption,
	getPoaAudit, adminListPoa, adminRevokePoa
} from './power-of-attorney';

const mockFetch = vi.fn();

vi.mock('./client', () => ({
	apiClient: vi.fn(async (url: string, options: Record<string, unknown>) => {
		const res = await (options.fetch as typeof fetch)(url, { method: options.method as string });
		return res.json();
	})
}));

beforeEach(() => {
	mockFetch.mockReset();
	mockFetch.mockResolvedValue({
		ok: true,
		json: async () => ({ id: 'test-id' })
	});
});

describe('grantPoa', () => {
	it('calls POST /governance/power-of-attorney', async () => {
		const { apiClient } = await import('./client');
		const data = { attorney_id: 'g2', starts_at: '2026-01-01', ends_at: '2026-02-01', reason: 'test' };
		await grantPoa(data, 'token', 'tenant', mockFetch);
		expect(apiClient).toHaveBeenCalledWith('/governance/power-of-attorney', expect.objectContaining({ method: 'POST', body: data }));
	});
});

describe('listPoa', () => {
	it('calls GET /governance/power-of-attorney with direction param', async () => {
		const { apiClient } = await import('./client');
		await listPoa({ direction: 'incoming' }, 'token', 'tenant', mockFetch);
		expect(apiClient).toHaveBeenCalledWith(expect.stringContaining('direction=incoming'), expect.objectContaining({ method: 'GET' }));
	});

	it('includes status filter in query string', async () => {
		const { apiClient } = await import('./client');
		await listPoa({ direction: 'outgoing', status: 'active' }, 'token', 'tenant', mockFetch);
		expect(apiClient).toHaveBeenCalledWith(expect.stringContaining('status=active'), expect.objectContaining({ method: 'GET' }));
	});
});

describe('getPoa', () => {
	it('calls GET /governance/power-of-attorney/{id}', async () => {
		const { apiClient } = await import('./client');
		await getPoa('poa-123', 'token', 'tenant', mockFetch);
		expect(apiClient).toHaveBeenCalledWith('/governance/power-of-attorney/poa-123', expect.objectContaining({ method: 'GET' }));
	});
});

describe('revokePoa', () => {
	it('calls POST /governance/power-of-attorney/{id}/revoke', async () => {
		const { apiClient } = await import('./client');
		await revokePoa('poa-123', { reason: 'done' }, 'token', 'tenant', mockFetch);
		expect(apiClient).toHaveBeenCalledWith('/governance/power-of-attorney/poa-123/revoke', expect.objectContaining({ method: 'POST', body: { reason: 'done' } }));
	});
});

describe('extendPoa', () => {
	it('calls POST /governance/power-of-attorney/{id}/extend', async () => {
		const { apiClient } = await import('./client');
		await extendPoa('poa-123', { new_ends_at: '2026-04-01' }, 'token', 'tenant', mockFetch);
		expect(apiClient).toHaveBeenCalledWith('/governance/power-of-attorney/poa-123/extend', expect.objectContaining({ method: 'POST', body: { new_ends_at: '2026-04-01' } }));
	});
});

describe('assumeIdentity', () => {
	it('calls POST /governance/power-of-attorney/{id}/assume with empty body', async () => {
		const { apiClient } = await import('./client');
		await assumeIdentity('poa-123', 'token', 'tenant', mockFetch);
		expect(apiClient).toHaveBeenCalledWith('/governance/power-of-attorney/poa-123/assume', expect.objectContaining({ method: 'POST', body: {} }));
	});
});

describe('dropIdentity', () => {
	it('calls POST /governance/power-of-attorney/drop with empty body', async () => {
		const { apiClient } = await import('./client');
		await dropIdentity('token', 'tenant', mockFetch);
		expect(apiClient).toHaveBeenCalledWith('/governance/power-of-attorney/drop', expect.objectContaining({ method: 'POST', body: {} }));
	});
});

describe('getCurrentAssumption', () => {
	it('calls GET /governance/power-of-attorney/current-assumption', async () => {
		const { apiClient } = await import('./client');
		await getCurrentAssumption('token', 'tenant', mockFetch);
		expect(apiClient).toHaveBeenCalledWith('/governance/power-of-attorney/current-assumption', expect.objectContaining({ method: 'GET' }));
	});
});

describe('getPoaAudit', () => {
	it('calls GET /governance/power-of-attorney/{id}/audit', async () => {
		const { apiClient } = await import('./client');
		await getPoaAudit('poa-123', {}, 'token', 'tenant', mockFetch);
		expect(apiClient).toHaveBeenCalledWith(expect.stringContaining('/governance/power-of-attorney/poa-123/audit'), expect.objectContaining({ method: 'GET' }));
	});

	it('includes filter params in query string', async () => {
		const { apiClient } = await import('./client');
		await getPoaAudit('poa-123', { event_type: 'assumed', from: '2026-01-01' }, 'token', 'tenant', mockFetch);
		expect(apiClient).toHaveBeenCalledWith(expect.stringContaining('event_type=assumed'), expect.objectContaining({ method: 'GET' }));
	});
});

describe('adminListPoa', () => {
	it('calls GET /governance/admin/power-of-attorney', async () => {
		const { apiClient } = await import('./client');
		await adminListPoa({}, 'token', 'tenant', mockFetch);
		expect(apiClient).toHaveBeenCalledWith(expect.stringContaining('/governance/admin/power-of-attorney'), expect.objectContaining({ method: 'GET' }));
	});

	it('includes donor_id filter', async () => {
		const { apiClient } = await import('./client');
		await adminListPoa({ donor_id: 'user-1' }, 'token', 'tenant', mockFetch);
		expect(apiClient).toHaveBeenCalledWith(expect.stringContaining('donor_id=user-1'), expect.objectContaining({ method: 'GET' }));
	});
});

describe('adminRevokePoa', () => {
	it('calls POST /governance/admin/power-of-attorney/{id}/revoke', async () => {
		const { apiClient } = await import('./client');
		await adminRevokePoa('poa-123', { reason: 'security' }, 'token', 'tenant', mockFetch);
		expect(apiClient).toHaveBeenCalledWith('/governance/admin/power-of-attorney/poa-123/revoke', expect.objectContaining({ method: 'POST', body: { reason: 'security' } }));
	});
});
