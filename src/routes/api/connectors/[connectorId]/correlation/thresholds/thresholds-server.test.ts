import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/correlation', () => ({
	getCorrelationThresholds: vi.fn(),
	upsertCorrelationThresholds: vi.fn()
}));

import { PUT } from './+server';
import { upsertCorrelationThresholds } from '$lib/api/correlation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { connectorId: 'conn-1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/connectors/conn-1/correlation/thresholds', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/connectors/:connectorId/correlation/thresholds', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('upserts thresholds with known fields', async () => {
		vi.mocked(upsertCorrelationThresholds).mockResolvedValue({ auto_confirm_threshold: 0.9 } as any);
		const response = await PUT(
			makeEvent(JSON.stringify({ auto_confirm_threshold: 0.9, tuning_mode: true })) as any
		);
		expect(response.status).toBe(200);
		expect(upsertCorrelationThresholds).toHaveBeenCalled();
	});

	it('does not upsert on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(upsertCorrelationThresholds).not.toHaveBeenCalled();
	});

	it('does not upsert when batch_size is not a number', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ batch_size: 'big' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(upsertCorrelationThresholds).not.toHaveBeenCalled();
	});
});
