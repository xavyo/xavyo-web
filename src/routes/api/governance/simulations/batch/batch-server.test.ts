import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/simulations', () => ({
	listBatchSimulations: vi.fn(),
	createBatchSimulation: vi.fn()
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
import { createBatchSimulation } from '$lib/api/simulations';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/simulations/batch', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/simulations/batch', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a batch simulation with required fields', async () => {
		vi.mocked(createBatchSimulation).mockResolvedValue({ id: 'b1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'n',
					batch_type: 'role_add',
					selection_mode: 'user_list',
					change_spec: { operation: 'role_add' }
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createBatchSimulation).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createBatchSimulation).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						batch_type: 'role_add',
						selection_mode: 'user_list',
						change_spec: { operation: 'role_add' }
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createBatchSimulation).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(createBatchSimulation).mockResolvedValue({ id: 'b1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'n',
					batch_type: 'role_add',
					selection_mode: 'user_list',
					change_spec: { operation: 'role_add' }
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createBatchSimulation).toHaveBeenCalled();
	});
});
