import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('./client', () => ({
	apiClient: vi.fn()
}));

import { apiClient } from './client';
import { certifyItem, revokeItem, listMyCertifications } from './my-certifications';

const mockApiClient = vi.mocked(apiClient);

describe('my-certifications API', () => {
	const token = 'tok';
	const tenantId = 'tid';
	const fetchFn = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		mockApiClient.mockResolvedValue({ items: [], total: 0 });
	});

	it('lists with limit/offset, not page/page_size', async () => {
		await listMyCertifications({ page: 2, page_size: 10 }, token, tenantId, fetchFn);
		const path = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
		expect(path).toContain('/governance/my-certifications');
		expect(path).toContain('limit=10');
		expect(path).toContain('offset=10');
		expect(path).not.toContain('page=');
		expect(path).not.toContain('page_size=');
	});

	it('certifies via POST /governance/certification-items/:id/decide', async () => {
		mockApiClient.mockResolvedValue({ id: 'item-1' });
		await certifyItem('item-1', token, tenantId, fetchFn);
		expect(mockApiClient).toHaveBeenCalledWith('/governance/certification-items/item-1/decide', {
			method: 'POST',
			body: { decision_type: 'approved' },
			token,
			tenantId,
			fetch: fetchFn
		});
	});

	it('revokes via POST /governance/certification-items/:id/decide with justification', async () => {
		mockApiClient.mockResolvedValue({ id: 'item-1' });
		await revokeItem('item-1', 'This access is no longer required.', token, tenantId, fetchFn);
		expect(mockApiClient).toHaveBeenCalledWith('/governance/certification-items/item-1/decide', {
			method: 'POST',
			body: {
				decision_type: 'revoked',
				justification: 'This access is no longer required.'
			},
			token,
			tenantId,
			fetch: fetchFn
		});
	});
});
