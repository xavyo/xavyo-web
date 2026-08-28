import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/federation', () => ({
	uploadCertificate: vi.fn()
}));

import { POST } from './+server';
import { uploadCertificate } from '$lib/api/federation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/federation/saml/certificates/generate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/federation/saml/certificates/generate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('does not generate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(uploadCertificate).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user before generating', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(uploadCertificate).not.toHaveBeenCalled();
	});

	it('does not generate when common_name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({ organization: 'x' })) as any)).rejects.toMatchObject(
			{ status: 400 }
		);
		expect(uploadCertificate).not.toHaveBeenCalled();
	});

	it('does not generate when validity_days is not a number', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ common_name: 'cn', validity_days: 'year' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(uploadCertificate).not.toHaveBeenCalled();
	});
});
