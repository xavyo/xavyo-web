import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/operations', () => ({
	listOperations: vi.fn(),
	triggerOperation: vi.fn()
}));

import { GET, POST } from './+server';
import { listOperations, triggerOperation } from '$lib/api/operations';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/operations', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/operations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listOperations).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/operations?limit=abc&offset=nope')
		} as any);
		expect(listOperations).toHaveBeenCalledWith(
			{
				connector_id: undefined,
				user_id: undefined,
				status: undefined,
				operation_type: undefined,
				from_date: undefined,
				to_date: undefined,
				limit: undefined,
				offset: undefined
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/operations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('triggers an operation with required fields', async () => {
		vi.mocked(triggerOperation).mockResolvedValue({ id: 'op1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					connector_id: 'c1',
					user_id: 'u1',
					operation_type: 'create',
					object_class: 'user',
					payload: { mail: 'a@b.c' }
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(triggerOperation).toHaveBeenCalled();
	});

	it('does not trigger on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(triggerOperation).not.toHaveBeenCalled();
	});

	it('does not trigger when connector_id is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						user_id: 'u1',
						operation_type: 'create',
						object_class: 'user',
						payload: {}
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(triggerOperation).not.toHaveBeenCalled();
	});

	it('rejects NaN priority instead of forwarding it', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						connector_id: 'c1',
						user_id: 'u1',
						operation_type: 'create',
						object_class: 'user',
						payload: { mail: 'a@b.c' },
						priority: Number.NaN
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(triggerOperation).not.toHaveBeenCalled();
	});
});
