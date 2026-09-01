import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/governance-operations', () => ({
	listSlaPolicies: vi.fn(),
	createSlaPolicy: vi.fn(),
	getSlaPolicy: vi.fn(),
	updateSlaPolicy: vi.fn(),
	deleteSlaPolicy: vi.fn()
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
	listSlaPolicies,
	createSlaPolicy,
	getSlaPolicy,
	updateSlaPolicy,
	deleteSlaPolicy
} from '$lib/api/governance-operations';

// --- Helpers ---

const TOKEN = 'test-access-token';
const TENANT = 'test-tenant-id';

function makeLocals(opts?: { noToken?: boolean; noTenant?: boolean; noAdmin?: boolean }) {
	return {
		accessToken: opts?.noToken ? undefined : TOKEN,
		tenantId: opts?.noTenant ? undefined : TENANT,
		user: { roles: opts?.noAdmin ? ['viewer'] : ['admin'] }
	};
}

function makeRequestEvent(overrides: Record<string, unknown> = {}): any {
	return {
		locals: makeLocals(),
		fetch: vi.fn(),
		params: {},
		url: new URL('http://localhost/api/governance/sla-policies'),
		request: new Request('http://localhost/api/governance/sla-policies', { method: 'GET' }),
		...overrides
	};
}

function makeJsonRequest(body: unknown, url = 'http://localhost/api/governance/sla-policies'): Request {
	return new Request(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

// =============================================================================
// 1. /api/governance/sla-policies — GET list, POST create
// =============================================================================

describe('GET /api/governance/sla-policies (list)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./+server');
		GET = mod.GET;
	});

	it('returns SLA policies list on success', async () => {
		const mockData = { items: [{ id: 'sla-1', name: 'Gold SLA' }], total: 1 };
		vi.mocked(listSlaPolicies).mockResolvedValue(mockData as any);

		const response = await GET(makeRequestEvent());

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockData);
		expect(listSlaPolicies).toHaveBeenCalledWith(
			{ is_active: undefined, limit: undefined, offset: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('maps page/page_size and status onto limit/offset/is_active', async () => {
		vi.mocked(listSlaPolicies).mockResolvedValue({ items: [], total: 0 } as any);
		await GET(
			makeRequestEvent({
				url: new URL('http://localhost/api/governance/sla-policies?page=2&page_size=10&status=active')
			})
		);
		expect(listSlaPolicies).toHaveBeenCalledWith(
			{ is_active: true, limit: 10, offset: 10 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('returns 401 without token', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noToken: true }) }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(listSlaPolicies).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET(makeRequestEvent());
		expect(response.status).toBe(200);
		expect(listSlaPolicies).toHaveBeenCalled();
	});
});

describe('POST /api/governance/sla-policies (create)', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./+server');
		POST = mod.POST;
	});

	it('creates SLA policy and returns 201', async () => {
		const body = { name: 'Gold SLA', target_duration_seconds: 3600 };
		const mockResult = { id: 'sla-new', ...body };
		vi.mocked(createSlaPolicy).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ request: makeJsonRequest(body) }));

		expect(response.status).toBe(201);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(createSlaPolicy).toHaveBeenCalledWith(
			{
				name: 'Gold SLA',
				target_duration_seconds: 3600,
				warning_threshold_percent: 75,
				breach_notification_enabled: true
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not create on invalid JSON', async () => {
		await expect(
			POST(
				makeRequestEvent({
					request: new Request('http://localhost/api/governance/sla-policies', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: '{not json'
					})
				})
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createSlaPolicy).not.toHaveBeenCalled();
	});

	it('accepts numeric-string target_duration_seconds', async () => {
		vi.mocked(createSlaPolicy).mockResolvedValue({ id: 'sla-new' } as any);
		const response = await POST(
			makeRequestEvent({
				request: makeJsonRequest({ name: 'Gold SLA', target_duration_seconds: '3600' })
			})
		);
		expect(response.status).toBe(201);
		expect(createSlaPolicy).toHaveBeenCalledWith(
			expect.objectContaining({ target_duration_seconds: 3600 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN target_duration_seconds instead of forwarding it', async () => {
		await expect(
			POST(
				makeRequestEvent({
					request: makeJsonRequest({ name: 'Gold SLA', target_duration_seconds: Number.NaN })
				})
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createSlaPolicy).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(makeRequestEvent({ request: makeJsonRequest({ target_duration_seconds: 3600 }) }))
		).rejects.toMatchObject({ status: 400 });
		expect(createSlaPolicy).not.toHaveBeenCalled();
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			POST(makeRequestEvent({ locals: makeLocals({ noToken: true }), request: makeJsonRequest({}) }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(createSlaPolicy).mockResolvedValue({ id: 'sla-new' } as any);
		const response = await POST(
			makeRequestEvent({ request: makeJsonRequest({ name: 'Gold SLA', target_duration_seconds: 3600 }) })
		);
		expect(response.status).toBe(201);
		expect(createSlaPolicy).toHaveBeenCalled();
	});
});

// =============================================================================
// 2. /api/governance/sla-policies/[id] — GET detail, PUT update, DELETE
// =============================================================================

describe('GET /api/governance/sla-policies/[id] (detail)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./[id]/+server');
		GET = mod.GET;
	});

	it('returns SLA policy detail on success', async () => {
		const mockPolicy = { id: 'sla-1', name: 'Gold SLA', status: 'active' };
		vi.mocked(getSlaPolicy).mockResolvedValue(mockPolicy as any);

		const response = await GET(makeRequestEvent({ params: { id: 'sla-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockPolicy);
		expect(getSlaPolicy).toHaveBeenCalledWith('sla-1', TOKEN, TENANT, expect.any(Function));
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noTenant: true }), params: { id: 'sla-1' } }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getSlaPolicy).mockResolvedValue({ id: 'sla-1' } as any);
		const response = await GET(makeRequestEvent({ params: { id: 'sla-1' } }));
		expect(response.status).toBe(200);
		expect(getSlaPolicy).toHaveBeenCalled();
	});
});

describe('PUT /api/governance/sla-policies/[id] (update)', () => {
	let PUT: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./[id]/+server');
		PUT = mod.PUT;
	});

	it('updates SLA policy and returns result', async () => {
		const body = { name: 'Platinum SLA' };
		const mockResult = { id: 'sla-1', name: 'Platinum SLA' };
		vi.mocked(updateSlaPolicy).mockResolvedValue(mockResult as any);

		const response = await PUT(
			makeRequestEvent({ params: { id: 'sla-1' }, request: makeJsonRequest(body) })
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(updateSlaPolicy).toHaveBeenCalledWith('sla-1', body, TOKEN, TENANT, expect.any(Function));
	});

	it('does not update on invalid JSON', async () => {
		await expect(
			PUT(
				makeRequestEvent({
					params: { id: 'sla-1' },
					request: new Request('http://localhost/api/governance/sla-policies/sla-1', {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: '{not json'
					})
				})
			)
		).rejects.toMatchObject({ status: 400 });
		expect(updateSlaPolicy).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(
			PUT(makeRequestEvent({ params: { id: 'sla-1' }, request: makeJsonRequest({ name: '' }) }))
		).rejects.toMatchObject({ status: 400 });
		expect(updateSlaPolicy).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(updateSlaPolicy).mockResolvedValue({ id: 'sla-1' } as any);
		const response = await PUT(
			makeRequestEvent({ params: { id: 'sla-1' }, request: makeJsonRequest({ name: 'Platinum SLA' }) })
		);
		expect(response.status).toBe(200);
		expect(updateSlaPolicy).toHaveBeenCalled();
	});
});

describe('DELETE /api/governance/sla-policies/[id]', () => {
	let DELETE: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./[id]/+server');
		DELETE = mod.DELETE;
	});

	it('deletes SLA policy and returns 204', async () => {
		vi.mocked(deleteSlaPolicy).mockResolvedValue(undefined as any);

		const response = await DELETE(makeRequestEvent({ params: { id: 'sla-1' } }));

		expect(response.status).toBe(204);
		expect(deleteSlaPolicy).toHaveBeenCalledWith('sla-1', TOKEN, TENANT, expect.any(Function));
	});

	it('propagates API errors on delete', async () => {
		vi.mocked(deleteSlaPolicy).mockRejectedValue(new Error('Conflict'));

		await expect(
			DELETE(makeRequestEvent({ params: { id: 'sla-1' } }))
		).rejects.toThrow('Conflict');
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(deleteSlaPolicy).mockResolvedValue(undefined as any);
		const response = await DELETE(makeRequestEvent({ params: { id: 'sla-1' } }));
		expect(response.status).toBe(204);
		expect(deleteSlaPolicy).toHaveBeenCalled();
	});
});
