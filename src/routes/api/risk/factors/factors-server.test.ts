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

import { POST } from './+server';
import { createRiskFactor } from '$lib/api/risk';

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
});
