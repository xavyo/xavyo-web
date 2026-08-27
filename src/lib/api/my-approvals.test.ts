import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
	apiClient: vi.fn()
}));

import { apiClient } from './client';
import { approveApproval, rejectApproval } from './my-approvals';

const mockApiClient = vi.mocked(apiClient);

describe('my-approvals API', () => {
	const token = 'tok';
	const tenantId = 'tid';
	const fetchFn = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockApiClient.mockResolvedValue({ id: 'req-1' });
	});

	it('approves via POST /governance/access-requests/:id/approve with comments', async () => {
		await approveApproval('req-1', { comment: 'ok' }, token, tenantId, fetchFn);
		expect(mockApiClient).toHaveBeenCalledWith('/governance/access-requests/req-1/approve', {
			method: 'POST',
			body: { comments: 'ok' },
			token,
			tenantId,
			fetch: fetchFn
		});
	});

	it('rejects via POST /governance/access-requests/:id/reject with comments', async () => {
		await rejectApproval('req-1', { comment: 'nope' }, token, tenantId, fetchFn);
		expect(mockApiClient).toHaveBeenCalledWith('/governance/access-requests/req-1/reject', {
			method: 'POST',
			body: { comments: 'nope' },
			token,
			tenantId,
			fetch: fetchFn
		});
	});
});
