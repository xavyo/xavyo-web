import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/governance-operations', () => ({
	listFailedOperations: vi.fn(),
	getFailedOperationCount: vi.fn(),
	processFailedOperationRetries: vi.fn()
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

import { hasAdminRole } from '$lib/server/auth';
import {
	listFailedOperations,
	getFailedOperationCount,
	processFailedOperationRetries
} from '$lib/api/governance-operations';

// --- Helpers ---

const TOKEN = 'test-access-token';
const TENANT = 'test-tenant-id';

function makeLocals(opts?: { noToken?: boolean; noTenant?: boolean }) {
	return {
		accessToken: opts?.noToken ? undefined : TOKEN,
		tenantId: opts?.noTenant ? undefined : TENANT,
		user: { roles: ['admin'] }
	};
}

function makeRequestEvent(overrides: Record<string, unknown> = {}): any {
	return {
		locals: makeLocals(),
		fetch: vi.fn(),
		params: {},
		url: new URL('http://localhost/api/governance/failed-operations'),
		request: new Request('http://localhost/api/governance/failed-operations', { method: 'GET' }),
		...overrides
	};
}

// =============================================================================
// 1. /api/governance/failed-operations — GET list
// =============================================================================

describe('GET /api/governance/failed-operations (list)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./+server');
		GET = mod.GET;
	});

	it('returns failed operations list on success', async () => {
		const mockData = { items: [{ id: 'fo-1', operation_type: 'provisioning', status: 'failed' }], total: 1 };
		vi.mocked(listFailedOperations).mockResolvedValue(mockData as any);

		const response = await GET(makeRequestEvent());

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockData);
	});

	it('returns 401 without token', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noToken: true }) }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('returns 403 for non-admin', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		await expect(GET(makeRequestEvent())).rejects.toMatchObject({ status: 403 });
	});
});

// =============================================================================
// 2. /api/governance/failed-operations/count — GET count
// =============================================================================

describe('GET /api/governance/failed-operations/count', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./count/+server');
		GET = mod.GET;
	});

	it('returns failed operation count on success', async () => {
		const mockData = { count: 5 };
		vi.mocked(getFailedOperationCount).mockResolvedValue(mockData);

		const response = await GET(makeRequestEvent());

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockData);
		expect(getFailedOperationCount).toHaveBeenCalledWith(TOKEN, TENANT, expect.any(Function));
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noToken: true }) }))
		).rejects.toMatchObject({ status: 401 });
	});
});

// =============================================================================
// 3. /api/governance/failed-operations/process-retries — POST
// =============================================================================

describe('POST /api/governance/failed-operations/process-retries', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./process-retries/+server');
		POST = mod.POST;
	});

	it('processes retries and returns result', async () => {
		const mockResult = { processed: 3 };
		vi.mocked(processFailedOperationRetries).mockResolvedValue(mockResult);

		const response = await POST(makeRequestEvent());

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(processFailedOperationRetries).toHaveBeenCalledWith(TOKEN, TENANT, expect.any(Function));
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			POST(makeRequestEvent({ locals: makeLocals({ noToken: true }) }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates API errors', async () => {
		vi.mocked(processFailedOperationRetries).mockRejectedValue(new Error('Processing failed'));

		await expect(
			POST(makeRequestEvent())
		).rejects.toThrow('Processing failed');
	});
});
