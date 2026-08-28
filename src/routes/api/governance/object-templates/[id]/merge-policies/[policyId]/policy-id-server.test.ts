import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/object-templates', () => ({
	updateTemplateMergePolicy: vi.fn(),
	deleteTemplateMergePolicy: vi.fn()
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

import { PUT, DELETE } from './+server';
import { updateTemplateMergePolicy, deleteTemplateMergePolicy } from '$lib/api/object-templates';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 't1', policyId: 'p1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/object-templates/t1/merge-policies/p1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/object-templates/:id/merge-policies/:policyId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a merge policy with known fields', async () => {
		vi.mocked(updateTemplateMergePolicy).mockResolvedValue({ id: 'p1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ strategy: 'first_wins' })) as any);
		expect(response.status).toBe(200);
		expect(updateTemplateMergePolicy).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateTemplateMergePolicy).not.toHaveBeenCalled();
	});

	it('does not update when strategy is invalid', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ strategy: 'random' })) as any)).rejects.toMatchObject(
			{ status: 400 }
		);
		expect(updateTemplateMergePolicy).not.toHaveBeenCalled();
	});
});

describe('DELETE /api/governance/object-templates/:id/merge-policies/:policyId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(deleteTemplateMergePolicy).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { id: 't1', policyId: 'p1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(deleteTemplateMergePolicy).toHaveBeenCalledWith('t1', 'p1', TOKEN, TENANT, expect.any(Function));
	});
});
