import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/lifecycle', () => ({
	updateState: vi.fn(),
	deleteState: vi.fn()
}));

import { PATCH, DELETE } from './+server';
import { updateState, deleteState } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { configId: 'cfg1', stateId: 'st1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/lifecycle/configs/cfg1/states/st1', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PATCH /api/governance/lifecycle/configs/:configId/states/:stateId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a state with known fields', async () => {
		vi.mocked(updateState).mockResolvedValue({ id: 'st1' } as any);
		const response = await PATCH(makeEvent(JSON.stringify({ name: 'active' })) as any);
		expect(response.status).toBe(200);
		expect(updateState).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PATCH(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateState).not.toHaveBeenCalled();
	});

	it('accepts numeric-string position', async () => {
		vi.mocked(updateState).mockResolvedValue({ id: 'st1' } as any);
		const response = await PATCH(makeEvent(JSON.stringify({ position: '3' })) as any);
		expect(response.status).toBe(200);
		expect(updateState).toHaveBeenCalledWith(
			'cfg1',
			'st1',
			expect.objectContaining({ position: 3 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN position instead of forwarding it', async () => {
		await expect(
			PATCH(makeEvent(JSON.stringify({ position: Number.NaN })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(updateState).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PATCH(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateState).not.toHaveBeenCalled();
	});
});

describe('DELETE /api/governance/lifecycle/configs/:configId/states/:stateId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(deleteState).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { configId: 'cfg1', stateId: 'st1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(deleteState).toHaveBeenCalledWith('cfg1', 'st1', TOKEN, TENANT, expect.any(Function));
	});
});
