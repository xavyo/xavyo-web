import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/meta-roles', () => ({
	simulateMetaRole: vi.fn()
}));

import { POST } from './+server';
import { simulateMetaRole } from '$lib/api/meta-roles';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'm1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/meta-roles/m1/simulate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/meta-roles/:id/simulate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('simulates with required fields', async () => {
		vi.mocked(simulateMetaRole).mockResolvedValue({ summary: { is_safe: true } } as any);
		const response = await POST(makeEvent(JSON.stringify({ simulation_type: 'update' })) as any);
		expect(response.status).toBe(200);
		expect(simulateMetaRole).toHaveBeenCalled();
	});

	it('does not simulate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(simulateMetaRole).not.toHaveBeenCalled();
	});

	it('does not simulate when simulation_type is invalid', async () => {
		await expect(POST(makeEvent(JSON.stringify({ simulation_type: 'preview' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(simulateMetaRole).not.toHaveBeenCalled();
	});
});
