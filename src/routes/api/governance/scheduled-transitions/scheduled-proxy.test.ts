import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/governance-operations', () => ({
	listScheduledTransitions: vi.fn(),
	getScheduledTransition: vi.fn(),
	cancelScheduledTransition: vi.fn()
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
	listScheduledTransitions,
	getScheduledTransition,
	cancelScheduledTransition
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
		url: new URL('http://localhost/api/governance/scheduled-transitions'),
		request: new Request('http://localhost/api/governance/scheduled-transitions', { method: 'GET' }),
		...overrides
	};
}

// =============================================================================
// 1. /api/governance/scheduled-transitions — GET list
// =============================================================================

describe('GET /api/governance/scheduled-transitions (list)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./+server');
		GET = mod.GET;
	});

	it('returns scheduled transitions list on success', async () => {
		const mockData = {
			items: [{ id: 'st-1', object_type: 'user', target_state: 'disabled', scheduled_at: '2026-03-01T00:00:00Z' }],
			total: 1
		};
		vi.mocked(listScheduledTransitions).mockResolvedValue(mockData as any);

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
// 2. /api/governance/scheduled-transitions/[id] — GET detail
// =============================================================================

describe('GET /api/governance/scheduled-transitions/[id] (detail)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./[id]/+server');
		GET = mod.GET;
	});

	it('returns scheduled transition detail on success', async () => {
		const mockTransition = { id: 'st-1', object_type: 'user', target_state: 'disabled', status: 'pending' };
		vi.mocked(getScheduledTransition).mockResolvedValue(mockTransition as any);

		const response = await GET(makeRequestEvent({ params: { id: 'st-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockTransition);
		expect(getScheduledTransition).toHaveBeenCalledWith('st-1', TOKEN, TENANT, expect.any(Function));
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noTenant: true }), params: { id: 'st-1' } }))
		).rejects.toMatchObject({ status: 401 });
	});
});

// =============================================================================
// 3. /api/governance/scheduled-transitions/[id]/cancel — POST
// =============================================================================

describe('POST /api/governance/scheduled-transitions/[id]/cancel', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./[id]/cancel/+server');
		POST = mod.POST;
	});

	it('cancels scheduled transition and returns result', async () => {
		const mockResult = { id: 'st-1', status: 'cancelled' };
		vi.mocked(cancelScheduledTransition).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ params: { id: 'st-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(cancelScheduledTransition).toHaveBeenCalledWith('st-1', TOKEN, TENANT, expect.any(Function));
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			POST(makeRequestEvent({ locals: makeLocals({ noToken: true }), params: { id: 'st-1' } }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates API errors on cancel', async () => {
		vi.mocked(cancelScheduledTransition).mockRejectedValue(new Error('Already executed'));

		await expect(
			POST(makeRequestEvent({ params: { id: 'st-1' } }))
		).rejects.toThrow('Already executed');
	});
});
