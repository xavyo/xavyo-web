import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/object-templates', () => ({
	getObjectTemplate: vi.fn(),
	updateObjectTemplate: vi.fn(),
	deleteObjectTemplate: vi.fn()
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
import { updateObjectTemplate, deleteObjectTemplate } from '$lib/api/object-templates';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 't1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/object-templates/t1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/object-templates/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a template with known fields', async () => {
		vi.mocked(updateObjectTemplate).mockResolvedValue({ id: 't1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'Updated' })) as any);
		expect(response.status).toBe(200);
		expect(updateObjectTemplate).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateObjectTemplate).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateObjectTemplate).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(updateObjectTemplate).mockResolvedValue({ id: 't1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'Updated' })) as any);
		expect(response.status).toBe(200);
		expect(updateObjectTemplate).toHaveBeenCalled();
	});
});

describe('DELETE /api/governance/object-templates/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(deleteObjectTemplate).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { id: 't1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(deleteObjectTemplate).toHaveBeenCalledWith('t1', TOKEN, TENANT, expect.any(Function));
	});
});
