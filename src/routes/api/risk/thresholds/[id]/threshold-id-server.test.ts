import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/risk', () => ({
	getRiskThreshold: vi.fn(),
	updateRiskThreshold: vi.fn(),
	deleteRiskThreshold: vi.fn()
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
import { updateRiskThreshold } from '$lib/api/risk';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 't1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/risk/thresholds/t1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/risk/thresholds/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a threshold with known fields', async () => {
		vi.mocked(updateRiskThreshold).mockResolvedValue({ id: 't1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'n', score_value: 80 })) as any);
		expect(response.status).toBe(200);
		expect(updateRiskThreshold).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateRiskThreshold).not.toHaveBeenCalled();
	});

	it('does not update when severity is invalid', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ severity: 'loud' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateRiskThreshold).not.toHaveBeenCalled();
	});

	it('rejects NaN score_value instead of forwarding it', async () => {
		await expect(
			PUT(makeEvent(JSON.stringify({ score_value: Number.NaN })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(updateRiskThreshold).not.toHaveBeenCalled();
	});

	it('rejects NaN cooldown_hours instead of forwarding it', async () => {
		await expect(
			PUT(makeEvent(JSON.stringify({ cooldown_hours: Number.NaN })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(updateRiskThreshold).not.toHaveBeenCalled();
	});
});
