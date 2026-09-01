import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-permissions', () => ({
	listCallers: vi.fn()
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
import { listCallers } from '$lib/api/nhi-permissions';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(url: string) {
	return {
		params: { id: 'nhi-1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
		fetch: vi.fn(),
		url: new URL(url)
	};
}

describe('GET /api/nhi/permissions/:id/callers', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised permission_type', async () => {
		vi.mocked(listCallers).mockResolvedValue({ data: [], total: 0, limit: 20, offset: 0 } as any);
		await GET(
			makeEvent('http://localhost/api/nhi/permissions/nhi-1/callers?permission_type=call') as any
		);
		expect(listCallers).toHaveBeenCalledWith(
			'nhi-1',
			expect.objectContaining({ permission_type: 'call' }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
