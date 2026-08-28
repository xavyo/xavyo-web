import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-governance', () => ({
	listOrphanDetections: vi.fn()
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

import { GET } from './+server';
import { listOrphanDetections } from '$lib/api/nhi-governance';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/nhi/governance/orphans', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin self-service user', async () => {
		vi.mocked(listOrphanDetections).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/nhi/governance/orphans')
		} as any);
		expect(response.status).toBe(200);
		expect(listOrphanDetections).toHaveBeenCalled();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listOrphanDetections).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/nhi/governance/orphans?page=3&page_size=10')
		} as any);
		expect(listOrphanDetections).toHaveBeenCalledWith(
			TOKEN,
			TENANT,
			expect.any(Function),
			expect.objectContaining({ limit: 10, offset: 20 })
		);
	});
});
