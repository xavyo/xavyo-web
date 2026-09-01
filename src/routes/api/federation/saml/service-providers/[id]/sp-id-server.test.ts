import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/federation', () => ({
	getServiceProvider: vi.fn(),
	updateServiceProvider: vi.fn(),
	deleteServiceProvider: vi.fn()
}));

import { GET, PUT, DELETE } from './+server';
import { getServiceProvider, updateServiceProvider, deleteServiceProvider } from '$lib/api/federation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'sp1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/federation/saml/service-providers/sp1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/federation/saml/service-providers/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(getServiceProvider).mockResolvedValue({ id: 'sp1' } as any);
		const response = await GET({
			params: { id: 'sp1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(getServiceProvider).toHaveBeenCalledWith('sp1', TOKEN, TENANT, expect.any(Function));
	});
});

describe('PUT /api/federation/saml/service-providers/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a service provider with known fields', async () => {
		vi.mocked(updateServiceProvider).mockResolvedValue({ id: 'sp1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'app', enabled: false })) as any);
		expect(response.status).toBe(200);
		expect(updateServiceProvider).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateServiceProvider).not.toHaveBeenCalled();
	});

	it('does not update when acs_urls is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ acs_urls: [] })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateServiceProvider).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(updateServiceProvider).mockResolvedValue({ id: 'sp1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'app' })) as any);
		expect(response.status).toBe(200);
		expect(updateServiceProvider).toHaveBeenCalled();
	});

	it('rejects NaN assertion_validity_seconds instead of forwarding it', async () => {
		await expect(
			PUT(makeEvent(JSON.stringify({ assertion_validity_seconds: Number.NaN })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(updateServiceProvider).not.toHaveBeenCalled();
	});
});

describe('DELETE /api/federation/saml/service-providers/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(deleteServiceProvider).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { id: 'sp1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(deleteServiceProvider).toHaveBeenCalledWith('sp1', TOKEN, TENANT, expect.any(Function));
	});
});
