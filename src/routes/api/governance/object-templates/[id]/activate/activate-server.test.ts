import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/object-templates', () => ({
	activateObjectTemplate: vi.fn()
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

import { POST } from './+server';
import { activateObjectTemplate } from '$lib/api/object-templates';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('POST /api/governance/object-templates/:id/activate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(activateObjectTemplate).mockResolvedValue({ id: 't1', status: 'active' } as any);
		const response = await POST({
			params: { id: 't1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(activateObjectTemplate).toHaveBeenCalledWith('t1', TOKEN, TENANT, expect.any(Function));
	});
});
