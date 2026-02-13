import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/api/provisioning-scripts', () => ({
	listProvisioningScripts: vi.fn(),
	createProvisioningScript: vi.fn(),
	getProvisioningScript: vi.fn(),
	updateProvisioningScript: vi.fn(),
	deleteProvisioningScript: vi.fn(),
	activateProvisioningScript: vi.fn(),
	deactivateProvisioningScript: vi.fn(),
	listScriptVersions: vi.fn(),
	createScriptVersion: vi.fn(),
	getScriptVersion: vi.fn(),
	compareScriptVersions: vi.fn(),
	rollbackScript: vi.fn(),
	dryRunScriptVersion: vi.fn(),
	listHookBindings: vi.fn(),
	createHookBinding: vi.fn(),
	getHookBinding: vi.fn(),
	updateHookBinding: vi.fn(),
	deleteHookBinding: vi.fn(),
	listBindingsByConnector: vi.fn(),
	listScriptTemplates: vi.fn(),
	createScriptTemplate: vi.fn(),
	getScriptTemplate: vi.fn(),
	updateScriptTemplate: vi.fn(),
	deleteScriptTemplate: vi.fn(),
	instantiateTemplate: vi.fn(),
	validateScript: vi.fn(),
	dryRunScript: vi.fn()
}));

vi.mock('$lib/api/script-analytics', () => ({
	getScriptAnalyticsDashboard: vi.fn(),
	getScriptAnalytics: vi.fn(),
	listScriptExecutionLogs: vi.fn(),
	getScriptExecutionLog: vi.fn(),
	listScriptAuditEvents: vi.fn()
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

import {
	listProvisioningScripts,
	createProvisioningScript,
	getProvisioningScript,
	updateProvisioningScript,
	deleteProvisioningScript,
	activateProvisioningScript,
	deactivateProvisioningScript,
	listScriptVersions,
	createScriptVersion,
	getScriptVersion,
	compareScriptVersions,
	rollbackScript,
	dryRunScriptVersion,
	listHookBindings,
	createHookBinding,
	getHookBinding,
	updateHookBinding,
	deleteHookBinding,
	listBindingsByConnector,
	listScriptTemplates,
	createScriptTemplate,
	getScriptTemplate,
	updateScriptTemplate,
	deleteScriptTemplate,
	instantiateTemplate,
	validateScript,
	dryRunScript
} from '$lib/api/provisioning-scripts';

import {
	getScriptAnalyticsDashboard,
	getScriptAnalytics,
	listScriptExecutionLogs,
	getScriptExecutionLog,
	listScriptAuditEvents
} from '$lib/api/script-analytics';

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
		url: new URL('http://localhost/api/provisioning-scripts'),
		request: new Request('http://localhost/api/provisioning-scripts', { method: 'GET' }),
		...overrides
	};
}

function makeJsonRequest(body: unknown, url = 'http://localhost/api/provisioning-scripts'): Request {
	return new Request(url, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body)
	});
}

// =============================================================================
// 1. /api/provisioning-scripts — GET list, POST create
// =============================================================================

describe('GET /api/provisioning-scripts (list)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./+server');
		GET = mod.GET;
	});

	it('returns scripts list on success', async () => {
		const mockData = {
			items: [{ id: 's-1', name: 'Script 1', status: 'active' }],
			total: 1,
			page: 1,
			page_size: 20
		};
		vi.mocked(listProvisioningScripts).mockResolvedValue(mockData as any);

		const response = await GET(makeRequestEvent());

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockData);
		expect(listProvisioningScripts).toHaveBeenCalledWith(
			{ status: undefined, search: undefined, page: undefined, page_size: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('passes query params to API', async () => {
		vi.mocked(listProvisioningScripts).mockResolvedValue({ items: [], total: 0 } as any);

		const url = new URL('http://localhost/api/provisioning-scripts?status=active&search=ldap&page=2&page_size=10');
		await GET(makeRequestEvent({ url }));

		expect(listProvisioningScripts).toHaveBeenCalledWith(
			{ status: 'active', search: 'ldap', page: 2, page_size: 10 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('throws 401 when no access token', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noToken: true }) }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('throws 401 when no tenant id', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noTenant: true }) }))
		).rejects.toMatchObject({ status: 401 });
	});
});

describe('POST /api/provisioning-scripts (create)', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./+server');
		POST = mod.POST;
	});

	it('creates a script and returns 201', async () => {
		const body = { name: 'New Script', script_body: 'console.log("hello")' };
		const mockResult = { id: 's-new', ...body, status: 'draft' };
		vi.mocked(createProvisioningScript).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ request: makeJsonRequest(body) }));

		expect(response.status).toBe(201);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(createProvisioningScript).toHaveBeenCalledWith(body, TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		const body = { name: 'Test' };
		await expect(
			POST(makeRequestEvent({ locals: makeLocals({ noToken: true }), request: makeJsonRequest(body) }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates API errors', async () => {
		const body = { name: '' };
		vi.mocked(createProvisioningScript).mockRejectedValue(new Error('Validation failed'));

		await expect(
			POST(makeRequestEvent({ request: makeJsonRequest(body) }))
		).rejects.toThrow('Validation failed');
	});
});

// =============================================================================
// 2. /api/provisioning-scripts/[id] — GET detail, PUT update, DELETE
// =============================================================================

describe('GET /api/provisioning-scripts/[id] (detail)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./[id]/+server');
		GET = mod.GET;
	});

	it('returns script detail on success', async () => {
		const mockScript = { id: 's-1', name: 'Test Script', status: 'active' };
		vi.mocked(getProvisioningScript).mockResolvedValue(mockScript as any);

		const response = await GET(makeRequestEvent({ params: { id: 's-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockScript);
		expect(getProvisioningScript).toHaveBeenCalledWith('s-1', TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noToken: true }), params: { id: 's-1' } }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates not found error', async () => {
		vi.mocked(getProvisioningScript).mockRejectedValue(new Error('Not Found'));

		await expect(
			GET(makeRequestEvent({ params: { id: 'nonexistent' } }))
		).rejects.toThrow('Not Found');
	});
});

describe('PUT /api/provisioning-scripts/[id] (update)', () => {
	let PUT: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./[id]/+server');
		PUT = mod.PUT;
	});

	it('updates script and returns result', async () => {
		const body = { name: 'Updated Script' };
		const mockResult = { id: 's-1', name: 'Updated Script', status: 'active' };
		vi.mocked(updateProvisioningScript).mockResolvedValue(mockResult as any);

		const response = await PUT(
			makeRequestEvent({ params: { id: 's-1' }, request: makeJsonRequest(body) })
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(updateProvisioningScript).toHaveBeenCalledWith(
			's-1',
			body,
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			PUT(
				makeRequestEvent({
					locals: makeLocals({ noTenant: true }),
					params: { id: 's-1' },
					request: makeJsonRequest({})
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});
});

describe('DELETE /api/provisioning-scripts/[id]', () => {
	let DELETE: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./[id]/+server');
		DELETE = mod.DELETE;
	});

	it('deletes script and returns 204', async () => {
		vi.mocked(deleteProvisioningScript).mockResolvedValue(undefined);

		const response = await DELETE(makeRequestEvent({ params: { id: 's-1' } }));

		expect(response.status).toBe(204);
		expect(deleteProvisioningScript).toHaveBeenCalledWith('s-1', TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			DELETE(makeRequestEvent({ locals: makeLocals({ noToken: true }), params: { id: 's-1' } }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates API errors on delete', async () => {
		vi.mocked(deleteProvisioningScript).mockRejectedValue(new Error('Conflict'));

		await expect(
			DELETE(makeRequestEvent({ params: { id: 's-1' } }))
		).rejects.toThrow('Conflict');
	});
});

// =============================================================================
// 3. /api/provisioning-scripts/[id]/activate — POST
// =============================================================================

describe('POST /api/provisioning-scripts/[id]/activate', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./[id]/activate/+server');
		POST = mod.POST;
	});

	it('activates script and returns result', async () => {
		const mockResult = { id: 's-1', name: 'Script', status: 'active' };
		vi.mocked(activateProvisioningScript).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ params: { id: 's-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(activateProvisioningScript).toHaveBeenCalledWith('s-1', TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			POST(makeRequestEvent({ locals: makeLocals({ noToken: true }), params: { id: 's-1' } }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates activation errors', async () => {
		vi.mocked(activateProvisioningScript).mockRejectedValue(new Error('Invalid state transition'));

		await expect(
			POST(makeRequestEvent({ params: { id: 's-1' } }))
		).rejects.toThrow('Invalid state transition');
	});
});

// =============================================================================
// 4. /api/provisioning-scripts/[id]/deactivate — POST
// =============================================================================

describe('POST /api/provisioning-scripts/[id]/deactivate', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./[id]/deactivate/+server');
		POST = mod.POST;
	});

	it('deactivates script and returns result', async () => {
		const mockResult = { id: 's-1', name: 'Script', status: 'inactive' };
		vi.mocked(deactivateProvisioningScript).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ params: { id: 's-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(deactivateProvisioningScript).toHaveBeenCalledWith('s-1', TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			POST(makeRequestEvent({ locals: makeLocals({ noTenant: true }), params: { id: 's-1' } }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates deactivation errors', async () => {
		vi.mocked(deactivateProvisioningScript).mockRejectedValue(new Error('Already inactive'));

		await expect(
			POST(makeRequestEvent({ params: { id: 's-1' } }))
		).rejects.toThrow('Already inactive');
	});
});

// =============================================================================
// 5. /api/provisioning-scripts/[id]/versions — GET list, POST create
// =============================================================================

describe('GET /api/provisioning-scripts/[id]/versions (list versions)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./[id]/versions/+server');
		GET = mod.GET;
	});

	it('returns versions list', async () => {
		const mockVersions = {
			items: [{ version_number: 1, script_body: 'v1' }],
			total: 1
		};
		vi.mocked(listScriptVersions).mockResolvedValue(mockVersions as any);

		const response = await GET(makeRequestEvent({ params: { id: 's-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockVersions);
		expect(listScriptVersions).toHaveBeenCalledWith('s-1', TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noToken: true }), params: { id: 's-1' } }))
		).rejects.toMatchObject({ status: 401 });
	});
});

describe('POST /api/provisioning-scripts/[id]/versions (create version)', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./[id]/versions/+server');
		POST = mod.POST;
	});

	it('creates version and returns 201', async () => {
		const body = { script_body: 'console.log("v2")', changelog: 'Updated logic' };
		const mockResult = { version_number: 2, ...body };
		vi.mocked(createScriptVersion).mockResolvedValue(mockResult as any);

		const response = await POST(
			makeRequestEvent({ params: { id: 's-1' }, request: makeJsonRequest(body) })
		);

		expect(response.status).toBe(201);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(createScriptVersion).toHaveBeenCalledWith('s-1', body, TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			POST(
				makeRequestEvent({
					locals: makeLocals({ noToken: true }),
					params: { id: 's-1' },
					request: makeJsonRequest({})
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates version creation errors', async () => {
		vi.mocked(createScriptVersion).mockRejectedValue(new Error('Script body required'));

		await expect(
			POST(makeRequestEvent({ params: { id: 's-1' }, request: makeJsonRequest({}) }))
		).rejects.toThrow('Script body required');
	});
});

// =============================================================================
// 6. /api/provisioning-scripts/[id]/versions/[versionNumber] — GET
// =============================================================================

describe('GET /api/provisioning-scripts/[id]/versions/[versionNumber]', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./[id]/versions/[versionNumber]/+server');
		GET = mod.GET;
	});

	it('returns specific version', async () => {
		const mockVersion = { version_number: 3, script_body: 'v3 code' };
		vi.mocked(getScriptVersion).mockResolvedValue(mockVersion as any);

		const response = await GET(
			makeRequestEvent({ params: { id: 's-1', versionNumber: '3' } })
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockVersion);
		expect(getScriptVersion).toHaveBeenCalledWith('s-1', 3, TOKEN, TENANT, expect.any(Function));
	});

	it('parses versionNumber as integer', async () => {
		vi.mocked(getScriptVersion).mockResolvedValue({ version_number: 5 } as any);

		await GET(makeRequestEvent({ params: { id: 's-1', versionNumber: '5' } }));

		expect(getScriptVersion).toHaveBeenCalledWith('s-1', 5, TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			GET(
				makeRequestEvent({
					locals: makeLocals({ noToken: true }),
					params: { id: 's-1', versionNumber: '1' }
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates not found error for version', async () => {
		vi.mocked(getScriptVersion).mockRejectedValue(new Error('Version not found'));

		await expect(
			GET(makeRequestEvent({ params: { id: 's-1', versionNumber: '99' } }))
		).rejects.toThrow('Version not found');
	});
});

// =============================================================================
// 7. /api/provisioning-scripts/[id]/versions/[versionNumber]/dry-run — POST
// =============================================================================

describe('POST /api/provisioning-scripts/[id]/versions/[versionNumber]/dry-run', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./[id]/versions/[versionNumber]/dry-run/+server');
		POST = mod.POST;
	});

	it('runs dry-run for specific version and returns result', async () => {
		const body = { context: { user_id: 'u-1' } };
		const mockResult = { success: true, output: { changes: [] } };
		vi.mocked(dryRunScriptVersion).mockResolvedValue(mockResult as any);

		const response = await POST(
			makeRequestEvent({
				params: { id: 's-1', versionNumber: '2' },
				request: makeJsonRequest(body)
			})
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(dryRunScriptVersion).toHaveBeenCalledWith(
			's-1',
			2,
			body,
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			POST(
				makeRequestEvent({
					locals: makeLocals({ noTenant: true }),
					params: { id: 's-1', versionNumber: '2' },
					request: makeJsonRequest({})
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates dry-run errors', async () => {
		vi.mocked(dryRunScriptVersion).mockRejectedValue(new Error('Script execution failed'));

		await expect(
			POST(
				makeRequestEvent({
					params: { id: 's-1', versionNumber: '1' },
					request: makeJsonRequest({ context: {} })
				})
			)
		).rejects.toThrow('Script execution failed');
	});
});

// =============================================================================
// 8. /api/provisioning-scripts/[id]/versions/compare — GET
// =============================================================================

describe('GET /api/provisioning-scripts/[id]/versions/compare', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./[id]/versions/compare/+server');
		GET = mod.GET;
	});

	it('compares two versions and returns diff', async () => {
		const mockResult = { from_version: 1, to_version: 3, diffs: [{ line: 5, type: 'added' }] };
		vi.mocked(compareScriptVersions).mockResolvedValue(mockResult as any);

		const url = new URL('http://localhost/api/provisioning-scripts/s-1/versions/compare?from=1&to=3');
		const response = await GET(makeRequestEvent({ params: { id: 's-1' }, url }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(compareScriptVersions).toHaveBeenCalledWith(
			's-1',
			1,
			3,
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('throws 401 when unauthorized', async () => {
		const url = new URL('http://localhost/api/provisioning-scripts/s-1/versions/compare?from=1&to=2');
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noToken: true }), params: { id: 's-1' }, url }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates comparison errors', async () => {
		vi.mocked(compareScriptVersions).mockRejectedValue(new Error('Version 5 not found'));

		const url = new URL('http://localhost/api/provisioning-scripts/s-1/versions/compare?from=1&to=5');
		await expect(
			GET(makeRequestEvent({ params: { id: 's-1' }, url }))
		).rejects.toThrow('Version 5 not found');
	});
});

// =============================================================================
// 9. /api/provisioning-scripts/[id]/rollback — POST
// =============================================================================

describe('POST /api/provisioning-scripts/[id]/rollback', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./[id]/rollback/+server');
		POST = mod.POST;
	});

	it('rolls back script and returns result', async () => {
		const body = { target_version: 2 };
		const mockResult = { id: 's-1', name: 'Script', current_version: 2 };
		vi.mocked(rollbackScript).mockResolvedValue(mockResult as any);

		const response = await POST(
			makeRequestEvent({ params: { id: 's-1' }, request: makeJsonRequest(body) })
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(rollbackScript).toHaveBeenCalledWith('s-1', body, TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			POST(
				makeRequestEvent({
					locals: makeLocals({ noToken: true }),
					params: { id: 's-1' },
					request: makeJsonRequest({ target_version: 1 })
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates rollback errors', async () => {
		vi.mocked(rollbackScript).mockRejectedValue(new Error('Cannot rollback to future version'));

		await expect(
			POST(
				makeRequestEvent({
					params: { id: 's-1' },
					request: makeJsonRequest({ target_version: 99 })
				})
			)
		).rejects.toThrow('Cannot rollback to future version');
	});
});

// =============================================================================
// 10. /api/provisioning-scripts/bindings — GET list, POST create
// =============================================================================

describe('GET /api/provisioning-scripts/bindings (list)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./bindings/+server');
		GET = mod.GET;
	});

	it('returns bindings list', async () => {
		const mockData = { items: [{ id: 'b-1', connector_id: 'c-1' }], total: 1 };
		vi.mocked(listHookBindings).mockResolvedValue(mockData as any);

		const response = await GET(makeRequestEvent());

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockData);
		expect(listHookBindings).toHaveBeenCalledWith(
			{
				connector_id: undefined,
				script_id: undefined,
				hook_phase: undefined,
				operation_type: undefined,
				page: undefined,
				page_size: undefined
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('passes filter params to API', async () => {
		vi.mocked(listHookBindings).mockResolvedValue({ items: [], total: 0 } as any);

		const url = new URL(
			'http://localhost/api/provisioning-scripts/bindings?connector_id=c-1&script_id=s-1&hook_phase=pre_create&operation_type=create&page=2&page_size=25'
		);
		await GET(makeRequestEvent({ url }));

		expect(listHookBindings).toHaveBeenCalledWith(
			{
				connector_id: 'c-1',
				script_id: 's-1',
				hook_phase: 'pre_create',
				operation_type: 'create',
				page: 2,
				page_size: 25
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noToken: true }) }))
		).rejects.toMatchObject({ status: 401 });
	});
});

describe('POST /api/provisioning-scripts/bindings (create)', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./bindings/+server');
		POST = mod.POST;
	});

	it('creates binding and returns 201', async () => {
		const body = { connector_id: 'c-1', script_id: 's-1', hook_phase: 'pre_create' };
		const mockResult = { id: 'b-new', ...body };
		vi.mocked(createHookBinding).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ request: makeJsonRequest(body) }));

		expect(response.status).toBe(201);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(createHookBinding).toHaveBeenCalledWith(body, TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			POST(
				makeRequestEvent({
					locals: makeLocals({ noTenant: true }),
					request: makeJsonRequest({})
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates binding creation errors', async () => {
		vi.mocked(createHookBinding).mockRejectedValue(new Error('Duplicate binding'));

		await expect(
			POST(makeRequestEvent({ request: makeJsonRequest({}) }))
		).rejects.toThrow('Duplicate binding');
	});
});

// =============================================================================
// 11. /api/provisioning-scripts/bindings/[bindingId] — GET, PUT, DELETE
// =============================================================================

describe('GET /api/provisioning-scripts/bindings/[bindingId] (detail)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./bindings/[bindingId]/+server');
		GET = mod.GET;
	});

	it('returns binding detail', async () => {
		const mockBinding = { id: 'b-1', connector_id: 'c-1', script_id: 's-1' };
		vi.mocked(getHookBinding).mockResolvedValue(mockBinding as any);

		const response = await GET(makeRequestEvent({ params: { bindingId: 'b-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockBinding);
		expect(getHookBinding).toHaveBeenCalledWith('b-1', TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noToken: true }), params: { bindingId: 'b-1' } }))
		).rejects.toMatchObject({ status: 401 });
	});
});

describe('PUT /api/provisioning-scripts/bindings/[bindingId] (update)', () => {
	let PUT: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./bindings/[bindingId]/+server');
		PUT = mod.PUT;
	});

	it('updates binding and returns result', async () => {
		const body = { hook_phase: 'post_create' };
		const mockResult = { id: 'b-1', hook_phase: 'post_create' };
		vi.mocked(updateHookBinding).mockResolvedValue(mockResult as any);

		const response = await PUT(
			makeRequestEvent({ params: { bindingId: 'b-1' }, request: makeJsonRequest(body) })
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(updateHookBinding).toHaveBeenCalledWith(
			'b-1',
			body,
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			PUT(
				makeRequestEvent({
					locals: makeLocals({ noTenant: true }),
					params: { bindingId: 'b-1' },
					request: makeJsonRequest({})
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates update errors', async () => {
		vi.mocked(updateHookBinding).mockRejectedValue(new Error('Binding not found'));

		await expect(
			PUT(
				makeRequestEvent({
					params: { bindingId: 'nonexistent' },
					request: makeJsonRequest({})
				})
			)
		).rejects.toThrow('Binding not found');
	});
});

describe('DELETE /api/provisioning-scripts/bindings/[bindingId]', () => {
	let DELETE: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./bindings/[bindingId]/+server');
		DELETE = mod.DELETE;
	});

	it('deletes binding and returns 204', async () => {
		vi.mocked(deleteHookBinding).mockResolvedValue(undefined);

		const response = await DELETE(makeRequestEvent({ params: { bindingId: 'b-1' } }));

		expect(response.status).toBe(204);
		expect(deleteHookBinding).toHaveBeenCalledWith('b-1', TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			DELETE(
				makeRequestEvent({
					locals: makeLocals({ noToken: true }),
					params: { bindingId: 'b-1' }
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates delete errors', async () => {
		vi.mocked(deleteHookBinding).mockRejectedValue(new Error('In use'));

		await expect(
			DELETE(makeRequestEvent({ params: { bindingId: 'b-1' } }))
		).rejects.toThrow('In use');
	});
});

// =============================================================================
// 12. /api/provisioning-scripts/connectors/[connectorId]/bindings — GET
// =============================================================================

describe('GET /api/provisioning-scripts/connectors/[connectorId]/bindings', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./connectors/[connectorId]/bindings/+server');
		GET = mod.GET;
	});

	it('returns bindings for connector', async () => {
		const mockData = { items: [{ id: 'b-1', connector_id: 'c-1' }], total: 1 };
		vi.mocked(listBindingsByConnector).mockResolvedValue(mockData as any);

		const response = await GET(makeRequestEvent({ params: { connectorId: 'c-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockData);
		expect(listBindingsByConnector).toHaveBeenCalledWith(
			'c-1',
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			GET(
				makeRequestEvent({
					locals: makeLocals({ noTenant: true }),
					params: { connectorId: 'c-1' }
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates connector not found error', async () => {
		vi.mocked(listBindingsByConnector).mockRejectedValue(new Error('Connector not found'));

		await expect(
			GET(makeRequestEvent({ params: { connectorId: 'invalid' } }))
		).rejects.toThrow('Connector not found');
	});
});

// =============================================================================
// 13. /api/provisioning-scripts/templates — GET list, POST create
// =============================================================================

describe('GET /api/provisioning-scripts/templates (list)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./templates/+server');
		GET = mod.GET;
	});

	it('returns templates list', async () => {
		const mockData = {
			items: [{ id: 't-1', name: 'LDAP Sync', category: 'provisioning' }],
			total: 1
		};
		vi.mocked(listScriptTemplates).mockResolvedValue(mockData as any);

		const response = await GET(makeRequestEvent());

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockData);
		expect(listScriptTemplates).toHaveBeenCalledWith(
			{ category: undefined, search: undefined, page: undefined, page_size: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('passes filter params to API', async () => {
		vi.mocked(listScriptTemplates).mockResolvedValue({ items: [], total: 0 } as any);

		const url = new URL(
			'http://localhost/api/provisioning-scripts/templates?category=provisioning&search=ldap&page=1&page_size=50'
		);
		await GET(makeRequestEvent({ url }));

		expect(listScriptTemplates).toHaveBeenCalledWith(
			{ category: 'provisioning', search: 'ldap', page: 1, page_size: 50 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noToken: true }) }))
		).rejects.toMatchObject({ status: 401 });
	});
});

describe('POST /api/provisioning-scripts/templates (create)', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./templates/+server');
		POST = mod.POST;
	});

	it('creates template and returns 201', async () => {
		const body = { name: 'New Template', category: 'reconciliation', script_body: 'code' };
		const mockResult = { id: 't-new', ...body };
		vi.mocked(createScriptTemplate).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ request: makeJsonRequest(body) }));

		expect(response.status).toBe(201);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(createScriptTemplate).toHaveBeenCalledWith(body, TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			POST(
				makeRequestEvent({
					locals: makeLocals({ noToken: true }),
					request: makeJsonRequest({})
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates template creation errors', async () => {
		vi.mocked(createScriptTemplate).mockRejectedValue(new Error('Template name required'));

		await expect(
			POST(makeRequestEvent({ request: makeJsonRequest({}) }))
		).rejects.toThrow('Template name required');
	});
});

// =============================================================================
// 14. /api/provisioning-scripts/templates/[templateId] — GET, PUT, DELETE
// =============================================================================

describe('GET /api/provisioning-scripts/templates/[templateId] (detail)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./templates/[templateId]/+server');
		GET = mod.GET;
	});

	it('returns template detail', async () => {
		const mockTemplate = { id: 't-1', name: 'LDAP Sync', category: 'provisioning' };
		vi.mocked(getScriptTemplate).mockResolvedValue(mockTemplate as any);

		const response = await GET(makeRequestEvent({ params: { templateId: 't-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockTemplate);
		expect(getScriptTemplate).toHaveBeenCalledWith('t-1', TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			GET(
				makeRequestEvent({
					locals: makeLocals({ noTenant: true }),
					params: { templateId: 't-1' }
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});
});

describe('PUT /api/provisioning-scripts/templates/[templateId] (update)', () => {
	let PUT: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./templates/[templateId]/+server');
		PUT = mod.PUT;
	});

	it('updates template and returns result', async () => {
		const body = { name: 'Updated Template' };
		const mockResult = { id: 't-1', name: 'Updated Template' };
		vi.mocked(updateScriptTemplate).mockResolvedValue(mockResult as any);

		const response = await PUT(
			makeRequestEvent({ params: { templateId: 't-1' }, request: makeJsonRequest(body) })
		);

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(updateScriptTemplate).toHaveBeenCalledWith(
			't-1',
			body,
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			PUT(
				makeRequestEvent({
					locals: makeLocals({ noToken: true }),
					params: { templateId: 't-1' },
					request: makeJsonRequest({})
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});
});

describe('DELETE /api/provisioning-scripts/templates/[templateId]', () => {
	let DELETE: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./templates/[templateId]/+server');
		DELETE = mod.DELETE;
	});

	it('deletes template and returns 204', async () => {
		vi.mocked(deleteScriptTemplate).mockResolvedValue(undefined);

		const response = await DELETE(makeRequestEvent({ params: { templateId: 't-1' } }));

		expect(response.status).toBe(204);
		expect(deleteScriptTemplate).toHaveBeenCalledWith('t-1', TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			DELETE(
				makeRequestEvent({
					locals: makeLocals({ noTenant: true }),
					params: { templateId: 't-1' }
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates delete errors', async () => {
		vi.mocked(deleteScriptTemplate).mockRejectedValue(new Error('Template in use'));

		await expect(
			DELETE(makeRequestEvent({ params: { templateId: 't-1' } }))
		).rejects.toThrow('Template in use');
	});
});

// =============================================================================
// 15. /api/provisioning-scripts/templates/[templateId]/instantiate — POST
// =============================================================================

describe('POST /api/provisioning-scripts/templates/[templateId]/instantiate', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./templates/[templateId]/instantiate/+server');
		POST = mod.POST;
	});

	it('instantiates template and returns 201', async () => {
		const body = { name: 'My Custom Script', variables: { org: 'acme' } };
		const mockResult = { id: 's-inst', name: 'My Custom Script', status: 'draft' };
		vi.mocked(instantiateTemplate).mockResolvedValue(mockResult as any);

		const response = await POST(
			makeRequestEvent({ params: { templateId: 't-1' }, request: makeJsonRequest(body) })
		);

		expect(response.status).toBe(201);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(instantiateTemplate).toHaveBeenCalledWith(
			't-1',
			body,
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			POST(
				makeRequestEvent({
					locals: makeLocals({ noToken: true }),
					params: { templateId: 't-1' },
					request: makeJsonRequest({})
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates instantiation errors', async () => {
		vi.mocked(instantiateTemplate).mockRejectedValue(new Error('Missing required variables'));

		await expect(
			POST(
				makeRequestEvent({
					params: { templateId: 't-1' },
					request: makeJsonRequest({})
				})
			)
		).rejects.toThrow('Missing required variables');
	});
});

// =============================================================================
// 16. /api/provisioning-scripts/validate — POST
// =============================================================================

describe('POST /api/provisioning-scripts/validate', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./validate/+server');
		POST = mod.POST;
	});

	it('validates script and returns result', async () => {
		const body = { script_body: 'function onPreCreate(ctx) { return ctx; }' };
		const mockResult = { valid: true, errors: [], warnings: [] };
		vi.mocked(validateScript).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ request: makeJsonRequest(body) }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(validateScript).toHaveBeenCalledWith(body, TOKEN, TENANT, expect.any(Function));
	});

	it('returns validation errors in result', async () => {
		const body = { script_body: 'invalid code {{{{' };
		const mockResult = {
			valid: false,
			errors: ['Syntax error at line 1'],
			warnings: []
		};
		vi.mocked(validateScript).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ request: makeJsonRequest(body) }));

		const data = await response.json();
		expect(data.valid).toBe(false);
		expect(data.errors).toHaveLength(1);
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			POST(
				makeRequestEvent({
					locals: makeLocals({ noTenant: true }),
					request: makeJsonRequest({})
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates validation API errors', async () => {
		vi.mocked(validateScript).mockRejectedValue(new Error('Server error'));

		await expect(
			POST(makeRequestEvent({ request: makeJsonRequest({}) }))
		).rejects.toThrow('Server error');
	});
});

// =============================================================================
// 17. /api/provisioning-scripts/dry-run — POST
// =============================================================================

describe('POST /api/provisioning-scripts/dry-run', () => {
	let POST: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./dry-run/+server');
		POST = mod.POST;
	});

	it('runs dry-run and returns result', async () => {
		const body = { context: { operation: 'create', identity: { email: 'test@example.com' } } };
		const mockResult = { success: true, output: { attributes_modified: ['email'] } };
		vi.mocked(dryRunScript).mockResolvedValue(mockResult as any);

		const response = await POST(makeRequestEvent({ request: makeJsonRequest(body) }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockResult);
		expect(dryRunScript).toHaveBeenCalledWith(body, TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			POST(
				makeRequestEvent({
					locals: makeLocals({ noToken: true }),
					request: makeJsonRequest({})
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates dry-run errors', async () => {
		vi.mocked(dryRunScript).mockRejectedValue(new Error('Execution timeout'));

		await expect(
			POST(makeRequestEvent({ request: makeJsonRequest({}) }))
		).rejects.toThrow('Execution timeout');
	});
});

// =============================================================================
// 18. /api/provisioning-scripts/analytics/dashboard — GET
// =============================================================================

describe('GET /api/provisioning-scripts/analytics/dashboard', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./analytics/dashboard/+server');
		GET = mod.GET;
	});

	it('returns analytics dashboard data', async () => {
		const mockData = {
			total_scripts: 15,
			active_scripts: 10,
			total_executions: 5000,
			success_rate: 98.5,
			recent_failures: []
		};
		vi.mocked(getScriptAnalyticsDashboard).mockResolvedValue(mockData as any);

		const response = await GET(makeRequestEvent());

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockData);
		expect(getScriptAnalyticsDashboard).toHaveBeenCalledWith(TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noToken: true }) }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates dashboard API errors', async () => {
		vi.mocked(getScriptAnalyticsDashboard).mockRejectedValue(new Error('Service unavailable'));

		await expect(GET(makeRequestEvent())).rejects.toThrow('Service unavailable');
	});
});

// =============================================================================
// 19. /api/provisioning-scripts/analytics/scripts/[scriptId] — GET
// =============================================================================

describe('GET /api/provisioning-scripts/analytics/scripts/[scriptId]', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./analytics/scripts/[scriptId]/+server');
		GET = mod.GET;
	});

	it('returns per-script analytics', async () => {
		const mockData = {
			script_id: 's-1',
			total_executions: 200,
			success_count: 195,
			failure_count: 5,
			avg_duration_ms: 42
		};
		vi.mocked(getScriptAnalytics).mockResolvedValue(mockData as any);

		const response = await GET(makeRequestEvent({ params: { scriptId: 's-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockData);
		expect(getScriptAnalytics).toHaveBeenCalledWith('s-1', TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			GET(
				makeRequestEvent({
					locals: makeLocals({ noTenant: true }),
					params: { scriptId: 's-1' }
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates script analytics errors', async () => {
		vi.mocked(getScriptAnalytics).mockRejectedValue(new Error('Script not found'));

		await expect(
			GET(makeRequestEvent({ params: { scriptId: 'nonexistent' } }))
		).rejects.toThrow('Script not found');
	});
});

// =============================================================================
// 20. /api/provisioning-scripts/execution-logs — GET list
// =============================================================================

describe('GET /api/provisioning-scripts/execution-logs (list)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./execution-logs/+server');
		GET = mod.GET;
	});

	it('returns execution logs list', async () => {
		const mockData = {
			items: [{ id: 'log-1', script_id: 's-1', status: 'success' }],
			total: 1
		};
		vi.mocked(listScriptExecutionLogs).mockResolvedValue(mockData as any);

		const response = await GET(makeRequestEvent());

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockData);
		expect(listScriptExecutionLogs).toHaveBeenCalledWith(
			{
				script_id: undefined,
				connector_id: undefined,
				binding_id: undefined,
				status: undefined,
				dry_run: undefined,
				from_date: undefined,
				to_date: undefined,
				page: undefined,
				page_size: undefined
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('passes all filter params to API', async () => {
		vi.mocked(listScriptExecutionLogs).mockResolvedValue({ items: [], total: 0 } as any);

		const url = new URL(
			'http://localhost/api/provisioning-scripts/execution-logs?script_id=s-1&connector_id=c-2&binding_id=b-3&status=failed&dry_run=true&from_date=2026-01-01&to_date=2026-01-31&page=3&page_size=10'
		);
		await GET(makeRequestEvent({ url }));

		expect(listScriptExecutionLogs).toHaveBeenCalledWith(
			{
				script_id: 's-1',
				connector_id: 'c-2',
				binding_id: 'b-3',
				status: 'failed',
				dry_run: true,
				from_date: '2026-01-01',
				to_date: '2026-01-31',
				page: 3,
				page_size: 10
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('parses dry_run=false correctly', async () => {
		vi.mocked(listScriptExecutionLogs).mockResolvedValue({ items: [], total: 0 } as any);

		const url = new URL('http://localhost/api/provisioning-scripts/execution-logs?dry_run=false');
		await GET(makeRequestEvent({ url }));

		const calledParams = vi.mocked(listScriptExecutionLogs).mock.calls[0][0];
		expect(calledParams.dry_run).toBe(false);
	});

	it('leaves dry_run undefined when not provided', async () => {
		vi.mocked(listScriptExecutionLogs).mockResolvedValue({ items: [], total: 0 } as any);

		await GET(makeRequestEvent());

		const calledParams = vi.mocked(listScriptExecutionLogs).mock.calls[0][0];
		expect(calledParams.dry_run).toBeUndefined();
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noToken: true }) }))
		).rejects.toMatchObject({ status: 401 });
	});
});

// =============================================================================
// 21. /api/provisioning-scripts/execution-logs/[logId] — GET detail
// =============================================================================

describe('GET /api/provisioning-scripts/execution-logs/[logId] (detail)', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./execution-logs/[logId]/+server');
		GET = mod.GET;
	});

	it('returns execution log detail', async () => {
		const mockLog = {
			id: 'log-1',
			script_id: 's-1',
			status: 'success',
			started_at: '2026-01-15T10:00:00Z',
			completed_at: '2026-01-15T10:00:01Z',
			output: { result: 'ok' }
		};
		vi.mocked(getScriptExecutionLog).mockResolvedValue(mockLog as any);

		const response = await GET(makeRequestEvent({ params: { logId: 'log-1' } }));

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockLog);
		expect(getScriptExecutionLog).toHaveBeenCalledWith('log-1', TOKEN, TENANT, expect.any(Function));
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			GET(
				makeRequestEvent({
					locals: makeLocals({ noTenant: true }),
					params: { logId: 'log-1' }
				})
			)
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates log not found error', async () => {
		vi.mocked(getScriptExecutionLog).mockRejectedValue(new Error('Log not found'));

		await expect(
			GET(makeRequestEvent({ params: { logId: 'invalid' } }))
		).rejects.toThrow('Log not found');
	});
});

// =============================================================================
// 22. /api/provisioning-scripts/audit-events — GET
// =============================================================================

describe('GET /api/provisioning-scripts/audit-events', () => {
	let GET: any;

	beforeEach(async () => {
		vi.clearAllMocks();
		const mod = await import('./audit-events/+server');
		GET = mod.GET;
	});

	it('returns audit events list', async () => {
		const mockData = {
			items: [
				{
					id: 'ae-1',
					script_id: 's-1',
					action: 'script_created',
					actor_id: 'u-1',
					timestamp: '2026-01-15T10:00:00Z'
				}
			],
			total: 1
		};
		vi.mocked(listScriptAuditEvents).mockResolvedValue(mockData as any);

		const response = await GET(makeRequestEvent());

		expect(response.status).toBe(200);
		const data = await response.json();
		expect(data).toEqual(mockData);
		expect(listScriptAuditEvents).toHaveBeenCalledWith(
			{ script_id: undefined, action: undefined, limit: undefined, offset: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('passes filter params to API', async () => {
		vi.mocked(listScriptAuditEvents).mockResolvedValue({ items: [], total: 0 } as any);

		const url = new URL(
			'http://localhost/api/provisioning-scripts/audit-events?script_id=s-1&action=script_activated&limit=50&offset=10'
		);
		await GET(makeRequestEvent({ url }));

		expect(listScriptAuditEvents).toHaveBeenCalledWith(
			{ script_id: 's-1', action: 'script_activated', limit: 50, offset: 10 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('throws 401 when unauthorized', async () => {
		await expect(
			GET(makeRequestEvent({ locals: makeLocals({ noToken: true }) }))
		).rejects.toMatchObject({ status: 401 });
	});

	it('propagates audit event API errors', async () => {
		vi.mocked(listScriptAuditEvents).mockRejectedValue(new Error('Internal server error'));

		await expect(GET(makeRequestEvent())).rejects.toThrow('Internal server error');
	});
});
