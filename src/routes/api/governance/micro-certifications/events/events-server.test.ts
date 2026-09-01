import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/micro-certifications', () => ({
	searchCertificationEvents: vi.fn()
}));

import { GET } from './+server';
import { searchCertificationEvents } from '$lib/api/micro-certifications';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/micro-certifications/events', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin reviewer', async () => {
		vi.mocked(searchCertificationEvents).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/micro-certifications/events')
		} as any);
		expect(response.status).toBe(200);
		expect(searchCertificationEvents).toHaveBeenCalled();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(searchCertificationEvents).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/micro-certifications/events?page=2&page_size=10'
			)
		} as any);
		expect(searchCertificationEvents).toHaveBeenCalledWith(
			expect.objectContaining({ limit: 10, offset: 10 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('forwards advertised micro_certification_id instead of certification_id', async () => {
		vi.mocked(searchCertificationEvents).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/micro-certifications/events?micro_certification_id=mc-1&event_type=approved'
			)
		} as any);
		expect(searchCertificationEvents).toHaveBeenCalledWith(
			expect.objectContaining({
				micro_certification_id: 'mc-1',
				event_type: 'approved'
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('maps certification_id alias onto micro_certification_id', async () => {
		vi.mocked(searchCertificationEvents).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/micro-certifications/events?certification_id=mc-2'
			)
		} as any);
		expect(searchCertificationEvents).toHaveBeenCalledWith(
			expect.objectContaining({ micro_certification_id: 'mc-2' }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
