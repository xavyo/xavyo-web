import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/federation', () => ({
	activateCertificate: vi.fn()
}));

import { POST } from './+server';
import { activateCertificate } from '$lib/api/federation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('POST /api/federation/saml/certificates/:id/activate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(activateCertificate).mockResolvedValue(undefined as any);
		const response = await POST({
			params: { id: 'cert-1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(activateCertificate).toHaveBeenCalledWith('cert-1', TOKEN, TENANT, expect.any(Function));
	});
});
