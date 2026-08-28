import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/licenses', () => ({
	listLicenseAssignments: vi.fn(),
	createLicenseAssignment: vi.fn()
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
import { createLicenseAssignment, listLicenseAssignments } from '$lib/api/licenses';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/licenses/assignments', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/licenses/assignments', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(listLicenseAssignments).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/licenses/assignments')
		} as any);
		expect(response.status).toBe(200);
		expect(listLicenseAssignments).toHaveBeenCalled();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listLicenseAssignments).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/licenses/assignments?limit=abc&offset=nope'
			)
		} as any);
		expect(listLicenseAssignments).toHaveBeenCalledWith(
			{
				license_pool_id: undefined,
				user_id: undefined,
				status: undefined,
				source: undefined,
				limit: undefined,
				offset: undefined
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/governance/licenses/assignments', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates an assignment with required fields', async () => {
		vi.mocked(createLicenseAssignment).mockResolvedValue({ id: 'a1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ license_pool_id: 'p1', user_id: 'u1' })) as any
		);
		expect(response.status).toBe(201);
		expect(createLicenseAssignment).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(createLicenseAssignment).not.toHaveBeenCalled();
	});

	it('does not create when user_id is missing', async () => {
		const response = await POST(makeEvent(JSON.stringify({ license_pool_id: 'p1' })) as any);
		expect(response.status).toBe(400);
		expect(createLicenseAssignment).not.toHaveBeenCalled();
	});
});
