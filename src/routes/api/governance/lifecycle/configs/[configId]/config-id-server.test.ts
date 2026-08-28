import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/lifecycle', () => ({
	getLifecycleConfig: vi.fn(),
	updateLifecycleConfig: vi.fn(),
	deleteLifecycleConfig: vi.fn()
}));

import { PATCH, DELETE } from './+server';
import { updateLifecycleConfig, deleteLifecycleConfig } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { configId: 'cfg1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/lifecycle/configs/cfg1', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PATCH /api/governance/lifecycle/configs/:configId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a config with known fields', async () => {
		vi.mocked(updateLifecycleConfig).mockResolvedValue({ id: 'cfg1' } as any);
		const response = await PATCH(makeEvent(JSON.stringify({ name: 'users' })) as any);
		expect(response.status).toBe(200);
		expect(updateLifecycleConfig).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PATCH(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateLifecycleConfig).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PATCH(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateLifecycleConfig).not.toHaveBeenCalled();
	});
});

describe('DELETE /api/governance/lifecycle/configs/:configId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(deleteLifecycleConfig).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { configId: 'cfg1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(deleteLifecycleConfig).toHaveBeenCalledWith('cfg1', TOKEN, TENANT, expect.any(Function));
	});
});
