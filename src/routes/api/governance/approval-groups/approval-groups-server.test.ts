import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/approval-workflows', () => ({
	listApprovalGroups: vi.fn(),
	createApprovalGroup: vi.fn()
}));

import { GET, POST } from './+server';
import { createApprovalGroup, listApprovalGroups } from '$lib/api/approval-workflows';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/approval-groups', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/approval-groups', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised is_active filter', async () => {
		vi.mocked(listApprovalGroups).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/approval-groups?is_active=false')
		} as any);
		expect(listApprovalGroups).toHaveBeenCalledWith(
			expect.objectContaining({ is_active: false }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/governance/approval-groups', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a group with required fields', async () => {
		vi.mocked(createApprovalGroup).mockResolvedValue({ id: 'g1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'Approvers' })) as any);
		expect(response.status).toBe(201);
		expect(createApprovalGroup).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createApprovalGroup).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(createApprovalGroup).not.toHaveBeenCalled();
	});
});
