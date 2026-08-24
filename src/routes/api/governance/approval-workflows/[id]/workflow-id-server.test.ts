import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/approval-workflows', () => ({
	getApprovalWorkflow: vi.fn(),
	updateApprovalWorkflow: vi.fn(),
	deleteApprovalWorkflow: vi.fn()
}));

import { PUT } from './+server';
import { updateApprovalWorkflow } from '$lib/api/approval-workflows';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'w1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/approval-workflows/w1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/approval-workflows/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a workflow with known fields', async () => {
		vi.mocked(updateApprovalWorkflow).mockResolvedValue({ id: 'w1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'n', is_active: false })) as any);
		expect(response.status).toBe(200);
		expect(updateApprovalWorkflow).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateApprovalWorkflow).not.toHaveBeenCalled();
	});

	it('does not update when name is empty', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ name: '' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(updateApprovalWorkflow).not.toHaveBeenCalled();
	});
});
