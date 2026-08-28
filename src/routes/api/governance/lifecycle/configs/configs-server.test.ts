import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/lifecycle', () => ({
	listLifecycleConfigs: vi.fn(),
	createLifecycleConfig: vi.fn()
}));

import { POST } from './+server';
import { createLifecycleConfig } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/lifecycle/configs', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/lifecycle/configs', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a config with required fields', async () => {
		vi.mocked(createLifecycleConfig).mockResolvedValue({ id: 'cfg1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'users', object_type: 'user' })) as any);
		expect(response.status).toBe(201);
		expect(createLifecycleConfig).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createLifecycleConfig).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ object_type: 'user' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(createLifecycleConfig).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(createLifecycleConfig).mockResolvedValue({ id: 'cfg1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'users', object_type: 'user' })) as any);
		expect(response.status).toBe(201);
		expect(createLifecycleConfig).toHaveBeenCalled();
	});
});
