import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/outliers', () => ({
	getOutlierConfig: vi.fn(),
	updateOutlierConfig: vi.fn()
}));

import { PUT } from './+server';
import { updateOutlierConfig } from '$lib/api/outliers';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/outliers/config', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/outliers/config', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates config with known fields', async () => {
		vi.mocked(updateOutlierConfig).mockResolvedValue({ id: 'c1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ is_enabled: true })) as any);
		expect(response.status).toBe(200);
		expect(updateOutlierConfig).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateOutlierConfig).not.toHaveBeenCalled();
	});

	it('does not update when is_enabled is not a boolean', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ is_enabled: 'yes' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateOutlierConfig).not.toHaveBeenCalled();
	});

	it('rejects NaN confidence_threshold instead of forwarding it', async () => {
		await expect(
			PUT(makeEvent(JSON.stringify({ confidence_threshold: Number.NaN })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(updateOutlierConfig).not.toHaveBeenCalled();
	});
});
