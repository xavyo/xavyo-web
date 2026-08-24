import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/nhi-governance', () => ({
	certifyNhi: vi.fn()
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

import { POST } from './+server';
import { certifyNhi } from '$lib/api/nhi-governance';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent() {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { campaignId: 'camp-1', nhiId: 'nhi-1' },
		fetch: vi.fn()
	};
}

describe('POST /api/nhi/governance/certifications/:campaignId/certify/:nhiId', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('certifies using campaign and NHI ids', async () => {
		vi.mocked(certifyNhi).mockResolvedValue({ nhi_id: 'nhi-1' } as any);
		const response = await POST(makeEvent() as any);
		expect(response.status).toBe(200);
		expect(certifyNhi).toHaveBeenCalledWith('camp-1', 'nhi-1', TOKEN, TENANT, expect.any(Function));
		expect(certifyNhi).not.toHaveBeenCalledWith(
			'nhi-1',
			'certify',
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
