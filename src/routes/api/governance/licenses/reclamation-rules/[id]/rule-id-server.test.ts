import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/licenses', () => ({
	getReclamationRule: vi.fn(),
	updateReclamationRule: vi.fn(),
	deleteReclamationRule: vi.fn()
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

import { PUT } from './+server';
import { updateReclamationRule } from '$lib/api/licenses';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'r1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/licenses/reclamation-rules/r1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/licenses/reclamation-rules/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a rule with known fields', async () => {
		vi.mocked(updateReclamationRule).mockResolvedValue({ id: 'r1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ enabled: false })) as any);
		expect(response.status).toBe(200);
		expect(updateReclamationRule).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		const response = await PUT(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(updateReclamationRule).not.toHaveBeenCalled();
	});

	it('does not update when enabled is not a boolean', async () => {
		const response = await PUT(makeEvent(JSON.stringify({ enabled: 'no' })) as any);
		expect(response.status).toBe(400);
		expect(updateReclamationRule).not.toHaveBeenCalled();
	});
});
