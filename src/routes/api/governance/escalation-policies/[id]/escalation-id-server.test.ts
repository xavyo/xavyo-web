import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/approval-workflows', () => ({
	getEscalationPolicy: vi.fn(),
	updateEscalationPolicy: vi.fn(),
	deleteEscalationPolicy: vi.fn()
}));

import { PUT } from './+server';
import { updateEscalationPolicy } from '$lib/api/approval-workflows';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'e1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/escalation-policies/e1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/escalation-policies/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a policy with known fields', async () => {
		vi.mocked(updateEscalationPolicy).mockResolvedValue({ id: 'e1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'n', is_active: false })) as any);
		expect(response.status).toBe(200);
		expect(updateEscalationPolicy).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateEscalationPolicy).not.toHaveBeenCalled();
	});

	it('accepts numeric-string default_timeout_secs', async () => {
		vi.mocked(updateEscalationPolicy).mockResolvedValue({ id: 'e1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ default_timeout_secs: '3600' })) as any);
		expect(response.status).toBe(200);
		expect(updateEscalationPolicy).toHaveBeenCalledWith(
			'e1',
			expect.objectContaining({ default_timeout_secs: 3600 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN default_timeout_secs instead of forwarding it', async () => {
		await expect(
			PUT(makeEvent(JSON.stringify({ default_timeout_secs: Number.NaN })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(updateEscalationPolicy).not.toHaveBeenCalled();
	});

	it('does not update when final_fallback is invalid', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ final_fallback: 'drop' })) as any)).rejects.toMatchObject(
			{ status: 400 }
		);
		expect(updateEscalationPolicy).not.toHaveBeenCalled();
	});
});
