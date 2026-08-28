import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/federation', () => ({
	listCertificates: vi.fn(),
	uploadCertificate: vi.fn()
}));

import { GET, POST } from './+server';
import { listCertificates, uploadCertificate } from '$lib/api/federation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/federation/saml/certificates', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/federation/saml/certificates', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(listCertificates).mockResolvedValue({ items: [] } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(listCertificates).toHaveBeenCalledWith(TOKEN, TENANT, expect.any(Function));
	});
});

describe('POST /api/federation/saml/certificates', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('uploads a certificate with required fields', async () => {
		vi.mocked(uploadCertificate).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ certificate: 'cert', private_key: 'key', key_id: 'k1' })) as any
		);
		expect(response.status).toBe(201);
		expect(uploadCertificate).toHaveBeenCalled();
	});

	it('does not upload on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(uploadCertificate).not.toHaveBeenCalled();
	});

	it('does not upload when certificate is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ private_key: 'key', key_id: 'k1' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(uploadCertificate).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(uploadCertificate).mockResolvedValue({ id: 'c1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ certificate: 'cert', private_key: 'key', key_id: 'k1' })) as any
		);
		expect(response.status).toBe(201);
		expect(uploadCertificate).toHaveBeenCalled();
	});
});
