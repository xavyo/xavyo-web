import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/governance-operations', () => ({
	listBulkActions: vi.fn(),
	createBulkAction: vi.fn()
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
import { createBulkAction } from '$lib/api/governance-operations';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/bulk-actions', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/bulk-actions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a bulk action from valid JSON', async () => {
		vi.mocked(createBulkAction).mockResolvedValue({ id: 'ba-1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					filter_expression: 'dept=eng',
					action_type: 'disable',
					justification: 'offboarding'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createBulkAction).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(createBulkAction).not.toHaveBeenCalled();
	});

	it('does not create when action_type is missing', async () => {
		const response = await POST(
			makeEvent(JSON.stringify({ filter_expression: 'x', justification: 'y' })) as any
		);
		expect(response.status).toBe(400);
		expect(createBulkAction).not.toHaveBeenCalled();
	});
});
