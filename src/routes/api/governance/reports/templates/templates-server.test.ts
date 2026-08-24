import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/governance-reporting', () => ({
	listTemplates: vi.fn(),
	createTemplate: vi.fn()
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
import { createTemplate } from '$lib/api/governance-reporting';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/reports/templates', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/reports/templates', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a template with required fields', async () => {
		vi.mocked(createTemplate).mockResolvedValue({ id: 't1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'Access review',
					template_type: 'access_review',
					definition: { data_sources: ['users'], filters: [], columns: [], grouping: [] }
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createTemplate).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createTemplate).not.toHaveBeenCalled();
	});

	it('does not create when definition is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ name: 'Access review', template_type: 'access_review' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createTemplate).not.toHaveBeenCalled();
	});
});
