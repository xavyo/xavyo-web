import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/approval-workflows', () => ({
	addEscalationLevel: vi.fn()
}));

import { POST } from './+server';
import { addEscalationLevel } from '$lib/api/approval-workflows';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'e1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/escalation-policies/e1/levels', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/escalation-policies/:id/levels', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('adds a level with required fields', async () => {
		vi.mocked(addEscalationLevel).mockResolvedValue({ id: 'l1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ level_order: 1, timeout_secs: 60, target_type: 'manager' })) as any
		);
		expect(response.status).toBe(201);
		expect(addEscalationLevel).toHaveBeenCalled();
	});

	it('does not add on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(addEscalationLevel).not.toHaveBeenCalled();
	});

	it('accepts numeric-string level_order and timeout_secs', async () => {
		vi.mocked(addEscalationLevel).mockResolvedValue({ id: 'l1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({ level_order: '1', timeout_secs: '60', target_type: 'manager' })
			) as any
		);
		expect(response.status).toBe(201);
		expect(addEscalationLevel).toHaveBeenCalledWith(
			'e1',
			expect.objectContaining({ level_order: 1, timeout_secs: 60 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN timeout_secs instead of forwarding it', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({ level_order: 1, timeout_secs: Number.NaN, target_type: 'manager' })
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(addEscalationLevel).not.toHaveBeenCalled();
	});

	it('does not add when target_type is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ level_order: 1, timeout_secs: 60 })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(addEscalationLevel).not.toHaveBeenCalled();
	});
});
