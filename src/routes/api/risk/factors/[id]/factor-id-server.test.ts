import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/risk', () => ({
	getRiskFactor: vi.fn(),
	updateRiskFactor: vi.fn(),
	deleteRiskFactor: vi.fn()
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

import { PUT } from './+server';
import { updateRiskFactor } from '$lib/api/risk';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'f1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/risk/factors/f1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/risk/factors/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a factor with known fields', async () => {
		vi.mocked(updateRiskFactor).mockResolvedValue({ id: 'f1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'n', weight: 2 })) as any);
		expect(response.status).toBe(200);
		expect(updateRiskFactor).toHaveBeenCalledWith(
			'f1',
			{ name: 'n', weight: 2 },
			TOKEN,
			TENANT,
			expect.anything()
		);
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateRiskFactor).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateRiskFactor).not.toHaveBeenCalled();
	});

	it('rejects NaN weight instead of forwarding it', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ weight: Number.NaN })) as any)).rejects.toMatchObject(
			{ status: 400 }
		);
		expect(updateRiskFactor).not.toHaveBeenCalled();
	});
});
