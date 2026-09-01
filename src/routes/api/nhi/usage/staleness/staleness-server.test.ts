import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-usage', () => ({
	getNhiStalenessReport: vi.fn()
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
import { getNhiStalenessReport } from '$lib/api/nhi-usage';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(url = 'http://localhost/api/nhi/usage/staleness') {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
		fetch: vi.fn(),
		url: new URL(url)
	};
}

describe('GET /api/nhi/usage/staleness', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin self-service user', async () => {
		vi.mocked(getNhiStalenessReport).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET(makeEvent() as any);
		expect(response.status).toBe(200);
		expect(getNhiStalenessReport).toHaveBeenCalled();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(getNhiStalenessReport).mockResolvedValue({ items: [], total: 0 } as any);
		await GET(makeEvent('http://localhost/api/nhi/usage/staleness?page=3&page_size=5') as any);
		expect(getNhiStalenessReport).toHaveBeenCalledWith(
			{ min_inactive_days: undefined, limit: 5, offset: 10 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('forwards advertised min_inactive_days', async () => {
		vi.mocked(getNhiStalenessReport).mockResolvedValue({ items: [], total: 0 } as any);
		await GET(makeEvent('http://localhost/api/nhi/usage/staleness?min_inactive_days=60') as any);
		expect(getNhiStalenessReport).toHaveBeenCalledWith(
			expect.objectContaining({ min_inactive_days: 60 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not forward NaN min_inactive_days', async () => {
		vi.mocked(getNhiStalenessReport).mockResolvedValue({ items: [], total: 0 } as any);
		await GET(makeEvent('http://localhost/api/nhi/usage/staleness?min_inactive_days=abc') as any);
		expect(getNhiStalenessReport).toHaveBeenCalledWith(
			expect.objectContaining({ min_inactive_days: undefined }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
