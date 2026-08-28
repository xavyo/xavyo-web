import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/object-templates', () => ({
	listTemplateMergePolicies: vi.fn(),
	createTemplateMergePolicy: vi.fn()
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
import { createTemplateMergePolicy } from '$lib/api/object-templates';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 't1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/object-templates/t1/merge-policies', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/object-templates/:id/merge-policies', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a merge policy with required fields', async () => {
		vi.mocked(createTemplateMergePolicy).mockResolvedValue({ id: 'm1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ attribute: 'email', strategy: 'first_wins' })) as any
		);
		expect(response.status).toBe(201);
		expect(createTemplateMergePolicy).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createTemplateMergePolicy).not.toHaveBeenCalled();
	});

	it('does not create when strategy is invalid', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ attribute: 'email', strategy: 'random' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createTemplateMergePolicy).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(createTemplateMergePolicy).mockResolvedValue({ id: 'm1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ attribute: 'email', strategy: 'first_wins' })) as any
		);
		expect(response.status).toBe(201);
		expect(createTemplateMergePolicy).toHaveBeenCalled();
	});
});
