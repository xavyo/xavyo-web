import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/micro-certifications', () => ({
	listMicroCertifications: vi.fn(),
	bulkDecideMicroCertifications: vi.fn()
}));

import { GET, POST } from './+server';
import { bulkDecideMicroCertifications, listMicroCertifications } from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/micro-certifications', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/micro-certifications', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin reviewer', async () => {
		vi.mocked(listMicroCertifications).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/micro-certifications')
		} as any);
		expect(response.status).toBe(200);
		expect(listMicroCertifications).toHaveBeenCalled();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listMicroCertifications).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/micro-certifications?page=4&page_size=5')
		} as any);
		expect(listMicroCertifications).toHaveBeenCalledWith(
			expect.objectContaining({ limit: 5, offset: 15 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('forwards advertised assignment, trigger, and date filters', async () => {
		vi.mocked(listMicroCertifications).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/micro-certifications?assignment_id=a1&trigger_rule_id=t1&from_date=2026-01-01T00:00:00Z&to_date=2026-02-01T00:00:00Z'
			)
		} as any);
		expect(listMicroCertifications).toHaveBeenCalledWith(
			expect.objectContaining({
				assignment_id: 'a1',
				trigger_rule_id: 't1',
				from_date: '2026-01-01T00:00:00Z',
				to_date: '2026-02-01T00:00:00Z'
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/governance/micro-certifications', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('bulk-decides with required fields', async () => {
		vi.mocked(bulkDecideMicroCertifications).mockResolvedValue({ success_count: 1 } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ certification_ids: ['mc-1'], decision: 'approve' })) as any
		);
		expect(response.status).toBe(200);
		expect(bulkDecideMicroCertifications).toHaveBeenCalled();
	});

	it('does not bulk-decide on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(bulkDecideMicroCertifications).not.toHaveBeenCalled();
	});

	it('does not bulk-decide when certification_ids is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ decision: 'approve' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(bulkDecideMicroCertifications).not.toHaveBeenCalled();
	});
});
