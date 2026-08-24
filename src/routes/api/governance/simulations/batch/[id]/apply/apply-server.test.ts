import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/simulations', () => ({
	applyBatchSimulation: vi.fn()
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
import { applyBatchSimulation } from '$lib/api/simulations';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { id: 'batch-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/simulations/batch/batch-1/apply', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/simulations/batch/:id/apply', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('applies with justification and acknowledged scope', async () => {
		vi.mocked(applyBatchSimulation).mockResolvedValue({ id: 'batch-1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ justification: 'ok', acknowledge_scope: true })) as any
		);
		expect(response.status).toBe(200);
		expect(applyBatchSimulation).toHaveBeenCalledWith(
			'batch-1',
			{ justification: 'ok', acknowledge_scope: true },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not apply on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(applyBatchSimulation).not.toHaveBeenCalled();
	});

	it('does not apply without acknowledge_scope', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ justification: 'ok' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(applyBatchSimulation).not.toHaveBeenCalled();
	});
});
