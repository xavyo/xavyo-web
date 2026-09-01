import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/risk', () => ({
	listRiskThresholds: vi.fn(),
	createRiskThreshold: vi.fn()
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
import { createRiskThreshold } from '$lib/api/risk';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/risk/thresholds', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/risk/thresholds', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a threshold with required fields', async () => {
		vi.mocked(createRiskThreshold).mockResolvedValue({ id: 't1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ name: 'n', score_value: 80, severity: 'critical' })) as any
		);
		expect(response.status).toBe(201);
		expect(createRiskThreshold).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createRiskThreshold).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ score_value: 80, severity: 'warning' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(createRiskThreshold).not.toHaveBeenCalled();
	});

	it('rejects NaN score_value instead of forwarding it', async () => {
		await expect(
			POST(
				makeEvent(JSON.stringify({ name: 'n', score_value: Number.NaN, severity: 'critical' })) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createRiskThreshold).not.toHaveBeenCalled();
	});
});
