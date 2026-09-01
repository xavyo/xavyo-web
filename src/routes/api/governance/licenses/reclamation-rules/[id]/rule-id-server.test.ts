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

import { DELETE, PUT } from './+server';
import { deleteReclamationRule, updateReclamationRule } from '$lib/api/licenses';
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

	it('accepts numeric-string threshold_days', async () => {
		vi.mocked(updateReclamationRule).mockResolvedValue({ id: 'r1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ threshold_days: '14' })) as any);
		expect(response.status).toBe(200);
		expect(updateReclamationRule).toHaveBeenCalledWith(
			'r1',
			expect.objectContaining({ threshold_days: 14 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN threshold_days instead of forwarding it', async () => {
		const response = await PUT(makeEvent(JSON.stringify({ threshold_days: Number.NaN })) as any);
		expect(response.status).toBe(400);
		expect(updateReclamationRule).not.toHaveBeenCalled();
	});

	it('does not update when enabled is not a boolean', async () => {
		const response = await PUT(makeEvent(JSON.stringify({ enabled: 'no' })) as any);
		expect(response.status).toBe(400);
		expect(updateReclamationRule).not.toHaveBeenCalled();
	});
});

describe('DELETE /api/governance/licenses/reclamation-rules/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(deleteReclamationRule).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { id: 'r1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(deleteReclamationRule).toHaveBeenCalledWith('r1', TOKEN, TENANT, expect.any(Function));
	});
});
