import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/nhi-governance', () => ({
	decideNhiCertItem: vi.fn()
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
import { decideNhiCertItem } from '$lib/api/nhi-governance';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { itemId: 'item-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/nhi/governance/certifications/items/item-1/decide', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/nhi/governance/certifications/items/:itemId/decide', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('decides with a valid decision', async () => {
		vi.mocked(decideNhiCertItem).mockResolvedValue({ id: 'item-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ decision: 'certify' })) as any);
		expect(response.status).toBe(200);
		expect(decideNhiCertItem).toHaveBeenCalledWith(
			'item-1',
			'certify',
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not decide on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(decideNhiCertItem).not.toHaveBeenCalled();
	});

	it('does not decide when decision is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(decideNhiCertItem).not.toHaveBeenCalled();
	});
});
