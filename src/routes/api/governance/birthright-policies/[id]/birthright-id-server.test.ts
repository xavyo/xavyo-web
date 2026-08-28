import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/birthright', () => ({
	getBirthrightPolicy: vi.fn(),
	updateBirthrightPolicy: vi.fn(),
	archiveBirthrightPolicy: vi.fn()
}));

import { PUT } from './+server';
import { updateBirthrightPolicy } from '$lib/api/birthright';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'b1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/birthright-policies/b1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/birthright-policies/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a policy with known fields', async () => {
		vi.mocked(updateBirthrightPolicy).mockResolvedValue({ id: 'b1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'n', priority: 2 })) as any);
		expect(response.status).toBe(200);
		expect(updateBirthrightPolicy).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateBirthrightPolicy).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(updateBirthrightPolicy).mockResolvedValue({ id: 'b1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'n', priority: 2 })) as any);
		expect(response.status).toBe(200);
		expect(updateBirthrightPolicy).toHaveBeenCalled();
	});

	it('does not update when evaluation_mode is invalid', async () => {
		await expect(
			PUT(makeEvent(JSON.stringify({ evaluation_mode: 'any' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(updateBirthrightPolicy).not.toHaveBeenCalled();
	});
});
