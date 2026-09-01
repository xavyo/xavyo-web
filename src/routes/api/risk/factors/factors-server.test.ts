import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/risk', () => ({
	listRiskFactors: vi.fn(),
	createRiskFactor: vi.fn()
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
import { createRiskFactor, listRiskFactors } from '$lib/api/risk';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/risk/factors', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/risk/factors', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listRiskFactors).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/risk/factors?page=2&page_size=10')
		} as any);
		expect(listRiskFactors).toHaveBeenCalledWith(
			{
				category: undefined,
				is_enabled: undefined,
				factor_type: undefined,
				limit: 10,
				offset: 10
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/risk/factors', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a factor with required fields', async () => {
		vi.mocked(createRiskFactor).mockResolvedValue({ id: 'f1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ name: 'n', category: 'static', factor_type: 't', weight: 1 })) as any
		);
		expect(response.status).toBe(201);
		expect(createRiskFactor).toHaveBeenCalled();
	});

	it('forwards advertised is_enabled', async () => {
		vi.mocked(createRiskFactor).mockResolvedValue({ id: 'f1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'n',
					category: 'static',
					factor_type: 't',
					weight: 1,
					description: 'd',
					is_enabled: false
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createRiskFactor).toHaveBeenCalledWith(
			{
				name: 'n',
				category: 'static',
				factor_type: 't',
				weight: 1,
				description: 'd',
				is_enabled: false
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createRiskFactor).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ category: 'static', factor_type: 't', weight: 1 })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createRiskFactor).not.toHaveBeenCalled();
	});

	it('rejects NaN weight instead of forwarding it', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({ name: 'n', category: 'static', factor_type: 't', weight: Number.NaN })
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createRiskFactor).not.toHaveBeenCalled();
	});
});
