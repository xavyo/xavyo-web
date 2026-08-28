import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/governance-operations', () => ({
	createBulkStateOperation: vi.fn(),
	listBulkStateOperations: vi.fn(),
	getBulkStateOperation: vi.fn(),
	cancelBulkStateOperation: vi.fn(),
	processPendingBulkStateOperations: vi.fn()
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
	createBulkStateOperation,
	listBulkStateOperations,
	getBulkStateOperation,
	cancelBulkStateOperation,
	processPendingBulkStateOperations
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
		url: new URL('http://localhost/api/governance/bulk-state-operations'),
		request: new Request('http://localhost/api/governance/bulk-state-operations', { method: 'POST' }),
		...overrides
	};
}

function makeJsonRequest(body: unknown): Request {
	return new Request('http://localhost/api/governance/bulk-state-operations', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

// =============================================================================
// 1. /api/governance/bulk-state-operations — POST create, GET list
// =============================================================================

describe('POST /api/governance/bulk-state-operations (create)', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./+server');
		POST = mod.POST;
	});

	it('creates bulk state operation and returns 201', async () => {
		const body = {
			transition_id: '11111111-1111-1111-1111-111111111111',
			object_ids: ['u-1', 'u-2']
		};
		const mockResult = { id: 'bso-new', ...body, status: 'pending' };
		vi.mocked(createBulkStateOperation).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ request: makeJsonRequest(body) }));

		expect(response.status).toBe(201);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(createBulkStateOperation).toHaveBeenCalledWith(body, TOKEN, TENANT, expect.any(Function));
	});

	it('does not create on invalid JSON', async () => {
		await expect(
			POST(
				makeRequestEvent({
					request: new Request('http://localhost/api/governance/bulk-state-operations', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: '{not json'
					})
				})
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createBulkStateOperation).not.toHaveBeenCalled();
	});

	it('does not create when object_ids is missing', async () => {
		await expect(
			POST(
				makeRequestEvent({
					request: makeJsonRequest({ transition_id: '11111111-1111-1111-1111-111111111111' })
				})
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createBulkStateOperation).not.toHaveBeenCalled();
	});

	it('returns 401 without token', async () => {
		await expect(
			POST(makeRequestEvent({ locals: makeLocals({ noToken: true }), request: makeJsonRequest({}) }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		const body = {
			transition_id: '11111111-1111-1111-1111-111111111111',
			object_ids: ['u-1']
		};
		vi.mocked(createBulkStateOperation).mockResolvedValue({ id: 'bso-new', ...body } as any);
		const response = await POST(makeRequestEvent({ request: makeJsonRequest(body) }));
		expect(response.status).toBe(201);
		expect(createBulkStateOperation).toHaveBeenCalled();
	});

	it('propagates API errors on create', async () => {
		vi.mocked(createBulkStateOperation).mockRejectedValue(new Error('Invalid target state'));

		await expect(
			POST(
				makeRequestEvent({
					request: makeJsonRequest({
						transition_id: '11111111-1111-1111-1111-111111111111',
						object_ids: ['u-1']
					})
				})
			)
		).rejects.toThrow('Invalid target state');
	});
});

describe('GET /api/governance/bulk-state-operations (list)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./+server');
		GET = mod.GET;
	});

	it('returns bulk state operations list on success', async () => {
		const mockData = { items: [{ id: 'bso-1', status: 'pending' }], total: 1 };
		vi.mocked(listBulkStateOperations).mockResolvedValue(mockData as any);

		const response = await GET(makeRequestEvent());

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockData);
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listBulkStateOperations).mockResolvedValue({ items: [], total: 0 } as any);
		await GET(
			makeRequestEvent({
				url: new URL('http://localhost/api/governance/bulk-state-operations?page=2&page_size=8')
			})
		);
		expect(listBulkStateOperations).toHaveBeenCalledWith(
			{ status: undefined, transition_id: undefined, limit: 8, offset: 8 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noTenant: true }) }))
		).rejects.toMatchObject({ status: 401 });
	});
});

// =============================================================================
// 2. /api/governance/bulk-state-operations/[id] — GET detail
// =============================================================================

describe('GET /api/governance/bulk-state-operations/[id] (detail)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./[id]/+server');
		GET = mod.GET;
	});

	it('returns bulk state operation detail on success', async () => {
		const mockOp = { id: 'bso-1', target_state: 'disabled', status: 'completed', processed: 10, failed: 0 };
		vi.mocked(getBulkStateOperation).mockResolvedValue(mockOp as any);

		const response = await GET(makeRequestEvent({ params: { id: 'bso-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockOp);
		expect(getBulkStateOperation).toHaveBeenCalledWith('bso-1', TOKEN, TENANT, expect.any(Function));
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noTenant: true }), params: { id: 'bso-1' } }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates not found error', async () => {
		vi.mocked(getBulkStateOperation).mockRejectedValue(new Error('Not found'));

		await expect(
			GET(makeRequestEvent({ params: { id: 'bso-missing' } }))
		).rejects.toThrow('Not found');
	});
});

// =============================================================================
// 3. /api/governance/bulk-state-operations/[id]/cancel — POST
// =============================================================================

describe('POST /api/governance/bulk-state-operations/[id]/cancel', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./[id]/cancel/+server');
		POST = mod.POST;
	});

	it('cancels bulk state operation and returns result', async () => {
		const mockResult = { id: 'bso-1', status: 'cancelled' };
		vi.mocked(cancelBulkStateOperation).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ params: { id: 'bso-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(cancelBulkStateOperation).toHaveBeenCalledWith('bso-1', TOKEN, TENANT, expect.any(Function));
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			POST(makeRequestEvent({ locals: makeLocals({ noToken: true }), params: { id: 'bso-1' } }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates cancellation errors', async () => {
		vi.mocked(cancelBulkStateOperation).mockRejectedValue(new Error('Already completed'));

		await expect(
			POST(makeRequestEvent({ params: { id: 'bso-1' } }))
		).rejects.toThrow('Already completed');
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(cancelBulkStateOperation).mockResolvedValue({ id: 'bso-1', status: 'cancelled' } as any);
		const response = await POST(makeRequestEvent({ params: { id: 'bso-1' } }));
		expect(response.status).toBe(200);
		expect(cancelBulkStateOperation).toHaveBeenCalled();
	});
});

// =============================================================================
// 4. /api/governance/bulk-state-operations/process — POST (global)
// =============================================================================

describe('POST /api/governance/bulk-state-operations/process', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./process/+server');
		POST = mod.POST;
	});

	it('processes pending operations and returns result', async () => {
		const mockResult = { processed: 2 };
		vi.mocked(processPendingBulkStateOperations).mockResolvedValue(mockResult);

		const response = await POST(makeRequestEvent());

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(processPendingBulkStateOperations).toHaveBeenCalledWith(TOKEN, TENANT, expect.any(Function));
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(processPendingBulkStateOperations).mockResolvedValue({ processed: 2 });
		const response = await POST(makeRequestEvent());
		expect(response.status).toBe(200);
		expect(processPendingBulkStateOperations).toHaveBeenCalled();
	});

	it('propagates processing errors', async () => {
		vi.mocked(processPendingBulkStateOperations).mockRejectedValue(new Error('Processing failed'));

		await expect(
			POST(makeRequestEvent())
		).rejects.toThrow('Processing failed');
	});
});
