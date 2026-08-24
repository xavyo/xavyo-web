import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/approval-workflows', () => ({
	getApprovalGroup: vi.fn(),
	updateApprovalGroup: vi.fn(),
	deleteApprovalGroup: vi.fn()
}));

import { PUT } from './+server';
import { updateApprovalGroup } from '$lib/api/approval-workflows';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'g1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/approval-groups/g1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/approval-groups/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('updates a group with known fields', async () => {
		vi.mocked(updateApprovalGroup).mockResolvedValue({ id: 'g1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'Approvers' })) as any);
		expect(response.status).toBe(200);
		expect(updateApprovalGroup).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateApprovalGroup).not.toHaveBeenCalled();
	});

	it('does not update when is_active is not a boolean', async () => {
		await expect(PUT(makeEvent(JSON.stringify({ is_active: 'yes' })) as any)).rejects.toMatchObject(
			{ status: 400 }
		);
		expect(updateApprovalGroup).not.toHaveBeenCalled();
	});
});
