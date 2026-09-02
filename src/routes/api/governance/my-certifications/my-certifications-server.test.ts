import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/my-certifications', () => ({
	listMyCertifications: vi.fn()
}));

import { GET } from './+server';
import { listMyCertifications } from '$lib/api/my-certifications';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/my-certifications', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listMyCertifications).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/my-certifications?page=abc&page_size=nope')
		} as any);
		expect(listMyCertifications).toHaveBeenCalledWith(
			{ campaign_id: undefined, status: undefined, page: undefined, page_size: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('forwards advertised status filter', async () => {
		vi.mocked(listMyCertifications).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/my-certifications?status=certified')
		} as any);
		expect(listMyCertifications).toHaveBeenCalledWith(
			expect.objectContaining({ status: 'certified' }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
