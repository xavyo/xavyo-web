import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/nhi-vault', () => ({
	listSecrets: vi.fn(),
	storeSecret: vi.fn()
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

import { GET, POST } from './+server';
import { listSecrets, storeSecret } from '$lib/api/nhi-vault';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { nhiId: 'n1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/n1/vault/secrets', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/nhi/vault/:nhiId/secrets', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(listSecrets).mockResolvedValue({ items: [] } as any);
		const response = await GET({
			params: { nhiId: 'n1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(listSecrets).toHaveBeenCalledWith('n1', TOKEN, TENANT, expect.any(Function));
	});
});

describe('POST /api/nhi/:nhiId/vault/secrets', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('stores a secret with required fields', async () => {
		vi.mocked(storeSecret).mockResolvedValue({ id: 's1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'k', value: 'v' })) as any);
		expect(response.status).toBe(200);
		expect(storeSecret).toHaveBeenCalled();
	});

	it('does not store on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(storeSecret).not.toHaveBeenCalled();
	});

	it('rejects NaN rotation_interval_days instead of forwarding it', async () => {
		await expect(
			POST(
				makeEvent(JSON.stringify({ name: 'k', value: 'v', rotation_interval_days: Number.NaN })) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(storeSecret).not.toHaveBeenCalled();
	});

	it('does not store when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ value: 'v' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(storeSecret).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(storeSecret).mockResolvedValue({ id: 's1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'k', value: 'v' })) as any);
		expect(response.status).toBe(200);
		expect(storeSecret).toHaveBeenCalled();
	});
});
