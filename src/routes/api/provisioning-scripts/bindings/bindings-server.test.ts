import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	listHookBindings: vi.fn(),
	createHookBinding: vi.fn()
}));

import { GET, POST } from './+server';
import { createHookBinding, listHookBindings } from '$lib/api/provisioning-scripts';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/provisioning-scripts/bindings', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/provisioning-scripts/bindings', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listHookBindings).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/provisioning-scripts/bindings?page=abc&page_size=nope')
		} as any);
		expect(listHookBindings).toHaveBeenCalledWith(
			{
				connector_id: undefined,
				script_id: undefined,
				hook_phase: undefined,
				operation_type: undefined,
				page: undefined,
				page_size: undefined
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/provisioning-scripts/bindings', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a binding with required fields', async () => {
		vi.mocked(createHookBinding).mockResolvedValue({ id: 'b1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					script_id: 's1',
					connector_id: 'c1',
					hook_phase: 'before',
					operation_type: 'create',
					execution_order: 1
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createHookBinding).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createHookBinding).not.toHaveBeenCalled();
	});

	it('does not create when script_id is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						connector_id: 'c1',
						hook_phase: 'before',
						operation_type: 'create',
						execution_order: 1
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createHookBinding).not.toHaveBeenCalled();
	});

	it('rejects NaN execution_order instead of forwarding it', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						script_id: 's1',
						connector_id: 'c1',
						hook_phase: 'before',
						operation_type: 'create',
						execution_order: Number.NaN
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createHookBinding).not.toHaveBeenCalled();
	});
});
