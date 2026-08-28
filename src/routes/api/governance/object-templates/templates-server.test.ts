import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/object-templates', () => ({
	listObjectTemplates: vi.fn(),
	createObjectTemplate: vi.fn()
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
import { createObjectTemplate } from '$lib/api/object-templates';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/object-templates', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/object-templates', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a template with required fields', async () => {
		vi.mocked(createObjectTemplate).mockResolvedValue({ id: 't1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ name: 'User Template', object_type: 'user' })) as any
		);
		expect(response.status).toBe(201);
		expect(createObjectTemplate).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createObjectTemplate).not.toHaveBeenCalled();
	});

	it('does not create when object_type is invalid', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ name: 'User Template', object_type: 'group' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createObjectTemplate).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(createObjectTemplate).mockResolvedValue({ id: 't1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ name: 'User Template', object_type: 'user' })) as any
		);
		expect(response.status).toBe(201);
		expect(createObjectTemplate).toHaveBeenCalled();
	});
});
