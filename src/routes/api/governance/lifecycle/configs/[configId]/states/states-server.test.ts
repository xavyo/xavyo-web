import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/lifecycle', () => ({
	createState: vi.fn()
}));

import { POST } from './+server';
import { createState } from '$lib/api/lifecycle';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { configId: 'cfg1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/lifecycle/configs/cfg1/states', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/lifecycle/configs/:configId/states', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a state with required fields', async () => {
		vi.mocked(createState).mockResolvedValue({ id: 'st1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'active',
					is_initial: true,
					is_terminal: false,
					entitlement_action: 'none',
					position: 0
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createState).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createState).not.toHaveBeenCalled();
	});

	it('accepts numeric-string position', async () => {
		vi.mocked(createState).mockResolvedValue({ id: 'st1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'active',
					is_initial: true,
					is_terminal: false,
					entitlement_action: 'none',
					position: '2'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createState).toHaveBeenCalledWith(
			'cfg1',
			expect.objectContaining({ position: 2 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN position instead of forwarding it', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						name: 'active',
						is_initial: true,
						is_terminal: false,
						entitlement_action: 'none',
						position: Number.NaN
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createState).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						is_initial: true,
						is_terminal: false,
						entitlement_action: 'none',
						position: 0
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createState).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(createState).mockResolvedValue({ id: 'st1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'active',
					is_initial: true,
					is_terminal: false,
					entitlement_action: 'none',
					position: 0
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createState).toHaveBeenCalled();
	});
});
