import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/nhi-cert-campaigns', () => ({
	listNhiCertCampaignsV2: vi.fn(),
	createNhiCertCampaignV2: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { GET, POST } from './+server';
import { createNhiCertCampaignV2, listNhiCertCampaignsV2 } from '$lib/api/nhi-cert-campaigns';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/certification/campaigns', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/nhi/certification/campaigns', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin reviewer', async () => {
		vi.mocked(listNhiCertCampaignsV2).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/nhi/certification/campaigns')
		} as any);
		expect(response.status).toBe(200);
		expect(listNhiCertCampaignsV2).toHaveBeenCalled();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listNhiCertCampaignsV2).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/nhi/certification/campaigns?page=3&page_size=10')
		} as any);
		expect(listNhiCertCampaignsV2).toHaveBeenCalledWith(
			{ status: undefined, created_by: undefined, limit: 10, offset: 20 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('forwards advertised created_by filter', async () => {
		vi.mocked(listNhiCertCampaignsV2).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/nhi/certification/campaigns?created_by=user-1')
		} as any);
		expect(listNhiCertCampaignsV2).toHaveBeenCalledWith(
			expect.objectContaining({ created_by: 'user-1' }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/nhi/certification/campaigns', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a campaign with required fields', async () => {
		vi.mocked(createNhiCertCampaignV2).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'Q1 review' })) as any);
		expect(response.status).toBe(201);
		expect(createNhiCertCampaignV2).toHaveBeenCalled();
	});

	it('forwards advertised nhi_type_filter and specific_nhi_ids', async () => {
		vi.mocked(createNhiCertCampaignV2).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'Agents only',
					deadline: '2026-12-01T00:00:00Z',
					nhi_type_filter: 'agent',
					specific_nhi_ids: ['nhi-1', 'nhi-2']
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createNhiCertCampaignV2).toHaveBeenCalledWith(
			expect.objectContaining({
				nhi_type_filter: 'agent',
				specific_nhi_ids: ['nhi-1', 'nhi-2']
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('maps due_date onto advertised deadline and forwards owner_filter', async () => {
		vi.mocked(createNhiCertCampaignV2).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'Q1 review',
					due_date: '2026-12-01T00:00:00Z',
					owner_filter: 'user-1',
					needs_certification_only: false,
					reviewer_type: 'owner',
					specific_reviewers: ['user-2']
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createNhiCertCampaignV2).toHaveBeenCalledWith(
			expect.objectContaining({
				deadline: '2026-12-01T00:00:00Z',
				owner_filter: 'user-1',
				needs_certification_only: false,
				reviewer_type: 'owner',
				specific_reviewers: ['user-2']
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not create when scope is by_type without nhi_type_filter', async () => {
		const response = await POST(
			makeEvent(JSON.stringify({ name: 'By type', scope: 'by_type' })) as any
		);
		expect(response.status).toBe(400);
		expect(createNhiCertCampaignV2).not.toHaveBeenCalled();
	});

	it('does not create when scope is specific without specific_nhi_ids', async () => {
		const response = await POST(
			makeEvent(JSON.stringify({ name: 'Specific', scope: 'specific' })) as any
		);
		expect(response.status).toBe(400);
		expect(createNhiCertCampaignV2).not.toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(createNhiCertCampaignV2).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		const response = await POST(makeEvent(JSON.stringify({})) as any);
		expect(response.status).toBe(400);
		expect(createNhiCertCampaignV2).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(createNhiCertCampaignV2).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'Q1 review' })) as any);
		expect(response.status).toBe(201);
		expect(createNhiCertCampaignV2).toHaveBeenCalled();
	});
});
