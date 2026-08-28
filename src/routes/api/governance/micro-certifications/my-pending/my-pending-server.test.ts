import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/micro-certifications', () => ({
	getMyPendingCertifications: vi.fn()
}));

import { GET } from './+server';
import { getMyPendingCertifications } from '$lib/api/micro-certifications';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(url: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
		fetch: vi.fn(),
		url: new URL(url)
	};
}

describe('GET /api/governance/micro-certifications/my-pending', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getMyPendingCertifications).mockResolvedValue({ items: [], total: 0 } as any);
	});

	it('maps page/page_size onto limit/offset', async () => {
		const response = await GET(
			makeEvent('http://localhost/api/governance/micro-certifications/my-pending?page=2&page_size=10') as any
		);
		expect(response.status).toBe(200);
		expect(getMyPendingCertifications).toHaveBeenCalledWith(
			{ limit: 10, offset: 10 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
