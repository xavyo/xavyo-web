import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/governance-operations', () => ({
	listBulkActions: vi.fn(),
	createBulkAction: vi.fn(),
	getBulkAction: vi.fn(),
	deleteBulkAction: vi.fn(),
	cancelBulkAction: vi.fn(),
	previewBulkAction: vi.fn(),
	executeBulkAction: vi.fn(),
	validateBulkActionExpression: vi.fn()
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
import { ApiError } from '$lib/api/client';
import {
	listBulkActions,
	createBulkAction,
	getBulkAction,
	deleteBulkAction,
	cancelBulkAction,
	previewBulkAction,
	executeBulkAction,
	validateBulkActionExpression
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
		url: new URL('http://localhost/api/governance/bulk-actions'),
		request: new Request('http://localhost/api/governance/bulk-actions', { method: 'GET' }),
		...overrides
	};
}

function makeJsonRequest(body: unknown): Request {
	return new Request('http://localhost/api/governance/bulk-actions', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

// =============================================================================
// 1. /api/governance/bulk-actions — GET list, POST create
// =============================================================================

describe('GET /api/governance/bulk-actions (list)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./+server');
		GET = mod.GET;
	});

	it('returns bulk actions list on success', async () => {
		const mockData = { items: [{ id: 'ba-1', action_type: 'disable' }], total: 1 };
		vi.mocked(listBulkActions).mockResolvedValue(mockData as any);

		const response = await GET(makeRequestEvent());

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockData);
		expect(listBulkActions).toHaveBeenCalledWith({}, TOKEN, TENANT, expect.any(Function));
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

	it('returns error JSON on ApiError', async () => {
		vi.mocked(listBulkActions).mockRejectedValue(new ApiError('Service down', 503));

		const response = await GET(makeRequestEvent());

		expect(response.status).toBe(503);
		const data = await response.json();
		expect(data.error).toBe('Service down');
	});
});

describe('POST /api/governance/bulk-actions (create)', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./+server');
		POST = mod.POST;
	});

	it('creates bulk action and returns 201', async () => {
		const body = { action_type: 'disable', filter_expression: 'status=inactive' };
		const mockResult = { id: 'ba-new', ...body, status: 'pending' };
		vi.mocked(createBulkAction).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ request: makeJsonRequest(body) }));

		expect(response.status).toBe(201);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(createBulkAction).toHaveBeenCalledWith(body, TOKEN, TENANT, expect.any(Function));
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			POST(makeRequestEvent({ locals: makeLocals({ noToken: true }), request: makeJsonRequest({}) }))
		).rejects.toMatchObject({ status: 401 });
	});
});

// =============================================================================
// 2. /api/governance/bulk-actions/[id] — GET detail, DELETE
// =============================================================================

describe('GET /api/governance/bulk-actions/[id] (detail)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./[id]/+server');
		GET = mod.GET;
	});

	it('returns bulk action detail on success', async () => {
		const mockAction = { id: 'ba-1', action_type: 'disable', status: 'completed' };
		vi.mocked(getBulkAction).mockResolvedValue(mockAction as any);

		const response = await GET(makeRequestEvent({ params: { id: 'ba-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockAction);
		expect(getBulkAction).toHaveBeenCalledWith('ba-1', TOKEN, TENANT, expect.any(Function));
	});

	it('returns error JSON on ApiError', async () => {
		vi.mocked(getBulkAction).mockRejectedValue(new ApiError('Not found', 404));

		const response = await GET(makeRequestEvent({ params: { id: 'ba-missing' } }));

		expect(response.status).toBe(404);
		const data = await response.json();
		expect(data.error).toBe('Not found');
	});
});

describe('DELETE /api/governance/bulk-actions/[id]', () => {
	let DELETE: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./[id]/+server');
		DELETE = mod.DELETE;
	});

	it('deletes bulk action and returns 204', async () => {
		vi.mocked(deleteBulkAction).mockResolvedValue(undefined as any);

		const response = await DELETE(makeRequestEvent({ params: { id: 'ba-1' } }));

		expect(response.status).toBe(204);
		expect(deleteBulkAction).toHaveBeenCalledWith('ba-1', TOKEN, TENANT, expect.any(Function));
	});

	it('returns 403 for non-admin', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		await expect(
			DELETE(makeRequestEvent({ params: { id: 'ba-1' } }))
		).rejects.toMatchObject({ status: 403 });
	});
});

// =============================================================================
// 2b. /api/governance/bulk-actions/[id]/cancel — POST
// =============================================================================

describe('POST /api/governance/bulk-actions/[id]/cancel', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./[id]/cancel/+server');
		POST = mod.POST;
	});

	it('cancels bulk action and returns result', async () => {
		const mockResult = { id: 'ba-1', status: 'cancelled' };
		vi.mocked(cancelBulkAction).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ params: { id: 'ba-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(cancelBulkAction).toHaveBeenCalledWith('ba-1', TOKEN, TENANT, expect.any(Function));
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			POST(makeRequestEvent({ locals: makeLocals({ noToken: true }), params: { id: 'ba-1' } }))
		).rejects.toMatchObject({ status: 401 });
	});
});

// =============================================================================
// 3. /api/governance/bulk-actions/[id]/preview — POST
// =============================================================================

describe('POST /api/governance/bulk-actions/[id]/preview', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./[id]/preview/+server');
		POST = mod.POST;
	});

	it('previews bulk action and returns result', async () => {
		const mockResult = { affected_count: 15, sample_entities: [{ id: 'u-1' }] };
		vi.mocked(previewBulkAction).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ params: { id: 'ba-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(previewBulkAction).toHaveBeenCalledWith('ba-1', TOKEN, TENANT, expect.any(Function));
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			POST(makeRequestEvent({ locals: makeLocals({ noToken: true }), params: { id: 'ba-1' } }))
		).rejects.toMatchObject({ status: 401 });
	});
});

// =============================================================================
// 4. /api/governance/bulk-actions/[id]/execute — POST
// =============================================================================

describe('POST /api/governance/bulk-actions/[id]/execute', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./[id]/execute/+server');
		POST = mod.POST;
	});

	it('executes bulk action and returns result', async () => {
		const mockResult = { id: 'ba-1', status: 'executing', affected_count: 15 };
		vi.mocked(executeBulkAction).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ params: { id: 'ba-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(executeBulkAction).toHaveBeenCalledWith('ba-1', TOKEN, TENANT, expect.any(Function));
	});

	it('returns 403 for non-admin', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		await expect(
			POST(makeRequestEvent({ params: { id: 'ba-1' } }))
		).rejects.toMatchObject({ status: 403 });
	});
});

// =============================================================================
// 5. /api/governance/bulk-actions/validate — POST
// =============================================================================

describe('POST /api/governance/bulk-actions/validate', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./validate/+server');
		POST = mod.POST;
	});

	it('validates expression and returns result', async () => {
		const body = { expression: 'status=inactive AND created_before=2025-01-01' };
		const mockResult = { valid: true, matched_count: 42 };
		vi.mocked(validateBulkActionExpression).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ request: makeJsonRequest(body) }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(validateBulkActionExpression).toHaveBeenCalledWith(body, TOKEN, TENANT, expect.any(Function));
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			POST(makeRequestEvent({ locals: makeLocals({ noTenant: true }), request: makeJsonRequest({}) }))
		).rejects.toMatchObject({ status: 401 });
	});
});
