import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/micro-certifications', () => ({
	getTriggerRule: vi.fn(),
	updateTriggerRule: vi.fn(),
	deleteTriggerRule: vi.fn()
}));

import { GET, PUT } from './+server';
import { getTriggerRule, updateTriggerRule } from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'tr1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/micro-certifications/triggers/tr1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/micro-certifications/triggers/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin reviewer', async () => {
		vi.mocked(getTriggerRule).mockResolvedValue({ id: 'tr1' } as any);
		const response = await GET({
			params: { id: 'tr1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(getTriggerRule).toHaveBeenCalledWith('tr1', TOKEN, TENANT, expect.any(Function));
	});
});

describe('PUT /api/governance/micro-certifications/triggers/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a trigger with known fields', async () => {
		vi.mocked(updateTriggerRule).mockResolvedValue({ id: 'tr1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'high risk' })) as any);
		expect(response.status).toBe(200);
		expect(updateTriggerRule).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateTriggerRule).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateTriggerRule).not.toHaveBeenCalled();
	});
});
