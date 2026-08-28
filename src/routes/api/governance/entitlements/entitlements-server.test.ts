import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance', () => ({
	listEntitlements: vi.fn(),
	createEntitlement: vi.fn()
}));

import { GET, POST } from './+server';
import { createEntitlement, listEntitlements } from '$lib/api/governance';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/entitlements', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/entitlements', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listEntitlements).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/entitlements?page=2&page_size=10')
		} as any);
		expect(response.status).toBe(200);
		expect(listEntitlements).toHaveBeenCalledWith(
			expect.objectContaining({ limit: 10, offset: 10 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/governance/entitlements', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates an entitlement with required fields', async () => {
		vi.mocked(createEntitlement).mockResolvedValue({ id: 'e1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					application_id: 'a1',
					name: 'Admin',
					risk_level: 'high',
					data_protection_classification: 'none'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createEntitlement).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createEntitlement).not.toHaveBeenCalled();
	});

	it('does not create when application_id is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						name: 'Admin',
						risk_level: 'high',
						data_protection_classification: 'none'
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createEntitlement).not.toHaveBeenCalled();
	});
});
