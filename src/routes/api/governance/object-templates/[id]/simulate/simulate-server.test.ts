import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/object-templates', () => ({
	simulateTemplate: vi.fn()
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
import { simulateTemplate } from '$lib/api/object-templates';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 't1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/object-templates/t1/simulate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/object-templates/:id/simulate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(simulateTemplate).mockResolvedValue({ matches: true } as any);
		const response = await POST(makeEvent(JSON.stringify({ department: 'Engineering' })) as any);
		expect(response.status).toBe(200);
		expect(simulateTemplate).toHaveBeenCalled();
	});

	it('simulates with a sample object', async () => {
		vi.mocked(simulateTemplate).mockResolvedValue({ matches: true } as any);
		const sample = { department: 'Engineering' };
		const response = await POST(makeEvent(JSON.stringify(sample)) as any);
		expect(response.status).toBe(200);
		expect(simulateTemplate).toHaveBeenCalledWith(
			't1',
			{ sample_object: sample },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not simulate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(simulateTemplate).not.toHaveBeenCalled();
	});

	it('does not simulate when body is an array', async () => {
		await expect(POST(makeEvent(JSON.stringify(['x'])) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(simulateTemplate).not.toHaveBeenCalled();
	});
});
