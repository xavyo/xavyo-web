import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/detection-rules', () => ({
	getDetectionRule: vi.fn(),
	updateDetectionRule: vi.fn(),
	deleteDetectionRule: vi.fn()
}));

import { PUT } from './+server';
import { updateDetectionRule } from '$lib/api/detection-rules';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'd1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/detection-rules/d1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/detection-rules/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a rule with known fields', async () => {
		vi.mocked(updateDetectionRule).mockResolvedValue({ id: 'd1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'no manager' })) as any);
		expect(response.status).toBe(200);
		expect(updateDetectionRule).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateDetectionRule).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateDetectionRule).not.toHaveBeenCalled();
	});

	it('accepts numeric-string priority', async () => {
		vi.mocked(updateDetectionRule).mockResolvedValue({ id: 'd1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ priority: '7' })) as any);
		expect(response.status).toBe(200);
		expect(updateDetectionRule).toHaveBeenCalledWith(
			'd1',
			expect.objectContaining({ priority: 7 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN priority instead of forwarding it', async () => {
		await expect(
			PUT(makeEvent(JSON.stringify({ priority: Number.NaN })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(updateDetectionRule).not.toHaveBeenCalled();
	});
});
