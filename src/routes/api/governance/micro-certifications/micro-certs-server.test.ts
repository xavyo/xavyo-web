import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/micro-certifications', () => ({
	listMicroCertifications: vi.fn(),
	bulkDecideMicroCertifications: vi.fn()
}));

import { POST } from './+server';
import { bulkDecideMicroCertifications } from '$lib/api/micro-certifications';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/micro-certifications', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/micro-certifications', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('bulk-decides with required fields', async () => {
		vi.mocked(bulkDecideMicroCertifications).mockResolvedValue({ success_count: 1 } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ certification_ids: ['mc-1'], decision: 'approve' })) as any
		);
		expect(response.status).toBe(200);
		expect(bulkDecideMicroCertifications).toHaveBeenCalled();
	});

	it('does not bulk-decide on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(bulkDecideMicroCertifications).not.toHaveBeenCalled();
	});

	it('does not bulk-decide when certification_ids is missing', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ decision: 'approve' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(bulkDecideMicroCertifications).not.toHaveBeenCalled();
	});
});
