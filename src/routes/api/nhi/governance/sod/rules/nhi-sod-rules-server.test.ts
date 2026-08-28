import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/nhi-governance', () => ({
	listNhiSodRules: vi.fn(),
	createNhiSodRule: vi.fn()
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

import { GET, POST } from './+server';
import { createNhiSodRule, listNhiSodRules } from '$lib/api/nhi-governance';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/governance/sod/rules', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/nhi/governance/sod/rules', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(listNhiSodRules).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/nhi/governance/sod/rules')
		} as any);
		expect(response.status).toBe(200);
		expect(listNhiSodRules).toHaveBeenCalled();
	});
});

describe('POST /api/nhi/governance/sod/rules', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a rule with required fields', async () => {
		vi.mocked(createNhiSodRule).mockResolvedValue({ id: 'r1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ tool_id_a: 'a', tool_id_b: 'b', enforcement: 'prevent' })) as any
		);
		expect(response.status).toBe(201);
		expect(createNhiSodRule).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createNhiSodRule).not.toHaveBeenCalled();
	});

	it('does not create when enforcement is invalid', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ tool_id_a: 'a', tool_id_b: 'b', enforcement: 'block' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createNhiSodRule).not.toHaveBeenCalled();
	});
});
