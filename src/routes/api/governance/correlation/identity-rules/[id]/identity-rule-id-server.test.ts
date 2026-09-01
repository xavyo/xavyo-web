import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/correlation', () => ({
	getIdentityCorrelationRule: vi.fn(),
	updateIdentityCorrelationRule: vi.fn(),
	deleteIdentityCorrelationRule: vi.fn()
}));

import { PUT, DELETE } from './+server';
import { updateIdentityCorrelationRule, deleteIdentityCorrelationRule } from '$lib/api/correlation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'r1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/correlation/identity-rules/r1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/correlation/identity-rules/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a rule with known fields', async () => {
		vi.mocked(updateIdentityCorrelationRule).mockResolvedValue({ id: 'r1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'email' })) as any);
		expect(response.status).toBe(200);
		expect(updateIdentityCorrelationRule).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateIdentityCorrelationRule).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateIdentityCorrelationRule).not.toHaveBeenCalled();
	});

	it('accepts numeric-string threshold, weight, and priority', async () => {
		vi.mocked(updateIdentityCorrelationRule).mockResolvedValue({ id: 'r1' } as any);
		const response = await PUT(
			makeEvent(JSON.stringify({ threshold: '0.8', weight: '2', priority: '3' })) as any
		);
		expect(response.status).toBe(200);
		expect(updateIdentityCorrelationRule).toHaveBeenCalledWith(
			'r1',
			expect.objectContaining({ threshold: 0.8, weight: 2, priority: 3 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN weight instead of forwarding it', async () => {
		await expect(
			PUT(makeEvent(JSON.stringify({ weight: Number.NaN })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(updateIdentityCorrelationRule).not.toHaveBeenCalled();
	});
});

describe('DELETE /api/governance/correlation/identity-rules/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(deleteIdentityCorrelationRule).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { id: 'r1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(deleteIdentityCorrelationRule).toHaveBeenCalledWith('r1', TOKEN, TENANT, expect.any(Function));
	});
});
