import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-delegations', () => ({
	listIncomingDelegations: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { GET } from './+server';
import { listIncomingDelegations } from '$lib/api/nhi-delegations';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(url: string) {
	return {
		params: { nhiId: 'nhi-1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		url: new URL(url)
	};
}

describe('GET /api/nhi/delegations/entity/:nhiId/incoming', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised principal_id', async () => {
		vi.mocked(listIncomingDelegations).mockResolvedValue({
			data: [],
			total: 0,
			limit: 20,
			offset: 0
		} as any);
		await GET(
			makeEvent(
				'http://localhost/api/nhi/delegations/entity/nhi-1/incoming?principal_id=user-1'
			) as any
		);
		expect(listIncomingDelegations).toHaveBeenCalledWith(
			'nhi-1',
			expect.objectContaining({ principal_id: 'user-1' }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
