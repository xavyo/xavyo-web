import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/meta-roles', () => ({
	listMetaRoles: vi.fn(),
	createMetaRole: vi.fn()
}));

import { POST } from './+server';
import { createMetaRole } from '$lib/api/meta-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/meta-roles', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/meta-roles', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a meta-role with required fields', async () => {
		vi.mocked(createMetaRole).mockResolvedValue({ id: 'm1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'n', priority: 1 })) as any);
		expect(response.status).toBe(201);
		expect(createMetaRole).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createMetaRole).not.toHaveBeenCalled();
	});

	it('accepts numeric-string priority', async () => {
		vi.mocked(createMetaRole).mockResolvedValue({ id: 'm1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'n', priority: '10' })) as any);
		expect(response.status).toBe(201);
		expect(createMetaRole).toHaveBeenCalledWith(
			expect.objectContaining({ priority: 10 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN priority instead of forwarding it', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ name: 'n', priority: Number.NaN })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createMetaRole).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ priority: 1 })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(createMetaRole).not.toHaveBeenCalled();
	});

	it('forwards advertised entitlements and constraints', async () => {
		vi.mocked(createMetaRole).mockResolvedValue({ id: 'm1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'n',
					priority: 1,
					entitlements: [{ entitlement_id: 'e1', permission_type: 'grant' }],
					constraints: [{ constraint_type: 'require_mfa', constraint_value: { required: true } }]
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createMetaRole).toHaveBeenCalledWith(
			expect.objectContaining({
				entitlements: [{ entitlement_id: 'e1', permission_type: 'grant' }],
				constraints: [{ constraint_type: 'require_mfa', constraint_value: { required: true } }]
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
