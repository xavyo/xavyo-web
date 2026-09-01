import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/governance-operations', () => ({
	listTicketingConfigs: vi.fn(),
	createTicketingConfig: vi.fn(),
	getTicketingConfig: vi.fn(),
	updateTicketingConfig: vi.fn(),
	deleteTicketingConfig: vi.fn()
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
	listTicketingConfigs,
	createTicketingConfig,
	getTicketingConfig,
	updateTicketingConfig,
	deleteTicketingConfig
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
		url: new URL('http://localhost/api/governance/ticketing-configuration'),
		request: new Request('http://localhost/api/governance/ticketing-configuration', { method: 'GET' }),
		...overrides
	};
}

function makeJsonRequest(body: unknown): Request {
	return new Request('http://localhost/api/governance/ticketing-configuration', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

// =============================================================================
// 1. /api/governance/ticketing-configuration — GET list, POST create
// =============================================================================

describe('GET /api/governance/ticketing-configuration (list)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./+server');
		GET = mod.GET;
	});

	it('returns ticketing configs list on success', async () => {
		const mockData = { items: [{ id: 'tc-1', name: 'Jira Config' }], total: 1 };
		vi.mocked(listTicketingConfigs).mockResolvedValue(mockData as any);

		const response = await GET(makeRequestEvent());

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockData);
		expect(listTicketingConfigs).toHaveBeenCalledWith(
			{ ticketing_type: undefined, is_active: undefined, limit: undefined, offset: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listTicketingConfigs).mockResolvedValue({ items: [], total: 0 } as any);
		await GET(
			makeRequestEvent({
				url: new URL('http://localhost/api/governance/ticketing-configuration?page=3&page_size=5')
			})
		);
		expect(listTicketingConfigs).toHaveBeenCalledWith(
			{ ticketing_type: undefined, is_active: undefined, limit: 5, offset: 10 },
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
		vi.mocked(listTicketingConfigs).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET(makeRequestEvent());
		expect(response.status).toBe(200);
		expect(listTicketingConfigs).toHaveBeenCalled();
	});
});

describe('POST /api/governance/ticketing-configuration (create)', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./+server');
		POST = mod.POST;
	});

	it('creates ticketing config and returns 201', async () => {
		const body = {
			name: 'Jira Config',
			ticketing_type: 'jira',
			endpoint_url: 'https://jira.example.com',
			credentials: 'secret'
		};
		const mockResult = { id: 'tc-new', ...body };
		vi.mocked(createTicketingConfig).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ request: makeJsonRequest(body) }));

		expect(response.status).toBe(201);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(createTicketingConfig).toHaveBeenCalledWith(
			{ ...body, polling_interval_seconds: 300 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not create on invalid JSON', async () => {
		await expect(
			POST(
				makeRequestEvent({
					request: new Request('http://localhost/api/governance/ticketing-configuration', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: '{not json'
					})
				})
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createTicketingConfig).not.toHaveBeenCalled();
	});

	it('accepts numeric-string polling_interval_seconds', async () => {
		vi.mocked(createTicketingConfig).mockResolvedValue({ id: 'tc-new' } as any);
		const response = await POST(
			makeRequestEvent({
				request: makeJsonRequest({
					name: 'Jira Config',
					ticketing_type: 'jira',
					endpoint_url: 'https://jira.example.com',
					credentials: 'secret',
					polling_interval_seconds: '120'
				})
			})
		);
		expect(response.status).toBe(201);
		expect(createTicketingConfig).toHaveBeenCalledWith(
			expect.objectContaining({ polling_interval_seconds: 120 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN polling_interval_seconds instead of forwarding it', async () => {
		await expect(
			POST(
				makeRequestEvent({
					request: makeJsonRequest({
						name: 'Jira Config',
						ticketing_type: 'jira',
						endpoint_url: 'https://jira.example.com',
						credentials: 'secret',
						polling_interval_seconds: Number.NaN
					})
				})
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createTicketingConfig).not.toHaveBeenCalled();
	});

	it('does not create when ticketing_type is invalid', async () => {
		await expect(
			POST(
				makeRequestEvent({
					request: makeJsonRequest({
						name: 'Jira Config',
						ticketing_type: 'other',
						endpoint_url: 'https://jira.example.com',
						credentials: 'secret'
					})
				})
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createTicketingConfig).not.toHaveBeenCalled();
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			POST(makeRequestEvent({ locals: makeLocals({ noTenant: true }), request: makeJsonRequest({}) }))
		).rejects.toMatchObject({ status: 401 });
	});
});

// =============================================================================
// 2. /api/governance/ticketing-configuration/[id] — GET detail, PUT update, DELETE
// =============================================================================

describe('GET /api/governance/ticketing-configuration/[id] (detail)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./[id]/+server');
		GET = mod.GET;
	});

	it('returns ticketing config detail on success', async () => {
		const mockConfig = { id: 'tc-1', name: 'Jira Config', provider: 'jira' };
		vi.mocked(getTicketingConfig).mockResolvedValue(mockConfig as any);

		const response = await GET(makeRequestEvent({ params: { id: 'tc-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockConfig);
		expect(getTicketingConfig).toHaveBeenCalledWith('tc-1', TOKEN, TENANT, expect.any(Function));
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noToken: true }), params: { id: 'tc-1' } }))
		).rejects.toMatchObject({ status: 401 });
	});
});

describe('PUT /api/governance/ticketing-configuration/[id] (update)', () => {
	let PUT: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./[id]/+server');
		PUT = mod.PUT;
	});

	it('updates ticketing config and returns result', async () => {
		const body = { name: 'Updated Jira Config' };
		const mockResult = { id: 'tc-1', name: 'Updated Jira Config' };
		vi.mocked(updateTicketingConfig).mockResolvedValue(mockResult as any);

		const response = await PUT(
			makeRequestEvent({ params: { id: 'tc-1' }, request: makeJsonRequest(body) })
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(updateTicketingConfig).toHaveBeenCalledWith('tc-1', body, TOKEN, TENANT, expect.any(Function));
	});

	it('forwards advertised is_active on update', async () => {
		vi.mocked(updateTicketingConfig).mockResolvedValue({ id: 'tc-1', is_active: false } as any);

		const response = await PUT(
			makeRequestEvent({
				params: { id: 'tc-1' },
				request: makeJsonRequest({ is_active: false })
			})
		);

		expect(response.status).toBe(200);
		expect(updateTicketingConfig).toHaveBeenCalledWith(
			'tc-1',
			expect.objectContaining({ is_active: false }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not update on invalid JSON', async () => {
		await expect(
			PUT(
				makeRequestEvent({
					params: { id: 'tc-1' },
					request: new Request('http://localhost/api/governance/ticketing-configuration/tc-1', {
						method: 'PUT',
						headers: { 'Content-Type': 'application/json' },
						body: '{not json'
					})
				})
			)
		).rejects.toMatchObject({ status: 400 });
		expect(updateTicketingConfig).not.toHaveBeenCalled();
	});

	it('accepts numeric-string polling_interval_seconds', async () => {
		vi.mocked(updateTicketingConfig).mockResolvedValue({ id: 'tc-1' } as any);
		const response = await PUT(
			makeRequestEvent({
				params: { id: 'tc-1' },
				request: makeJsonRequest({ polling_interval_seconds: '120' })
			})
		);
		expect(response.status).toBe(200);
		expect(updateTicketingConfig).toHaveBeenCalledWith(
			'tc-1',
			expect.objectContaining({ polling_interval_seconds: 120 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN polling_interval_seconds instead of forwarding it', async () => {
		await expect(
			PUT(
				makeRequestEvent({
					params: { id: 'tc-1' },
					request: makeJsonRequest({ polling_interval_seconds: Number.NaN })
				})
			)
		).rejects.toMatchObject({ status: 400 });
		expect(updateTicketingConfig).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(
			PUT(makeRequestEvent({ params: { id: 'tc-1' }, request: makeJsonRequest({ name: '' }) }))
		).rejects.toMatchObject({ status: 400 });
		expect(updateTicketingConfig).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(updateTicketingConfig).mockResolvedValue({ id: 'tc-1' } as any);
		const response = await PUT(
			makeRequestEvent({ params: { id: 'tc-1' }, request: makeJsonRequest({ name: 'Updated Jira Config' }) })
		);
		expect(response.status).toBe(200);
		expect(updateTicketingConfig).toHaveBeenCalled();
	});
});

describe('DELETE /api/governance/ticketing-configuration/[id]', () => {
	let DELETE: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		const mod = await import('./[id]/+server');
		DELETE = mod.DELETE;
	});

	it('deletes ticketing config and returns 204', async () => {
		vi.mocked(deleteTicketingConfig).mockResolvedValue(undefined as any);

		const response = await DELETE(makeRequestEvent({ params: { id: 'tc-1' } }));

		expect(response.status).toBe(204);
		expect(deleteTicketingConfig).toHaveBeenCalledWith('tc-1', TOKEN, TENANT, expect.any(Function));
	});

	it('propagates API errors on delete', async () => {
		vi.mocked(deleteTicketingConfig).mockRejectedValue(new Error('Config in use'));

		await expect(
			DELETE(makeRequestEvent({ params: { id: 'tc-1' } }))
		).rejects.toThrow('Config in use');
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(deleteTicketingConfig).mockResolvedValue(undefined as any);
		const response = await DELETE(makeRequestEvent({ params: { id: 'tc-1' } }));
		expect(response.status).toBe(204);
		expect(deleteTicketingConfig).toHaveBeenCalled();
	});
});
