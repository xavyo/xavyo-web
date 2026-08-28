import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/micro-certifications', () => ({
	bulkDecideMicroCertifications: vi.fn()
}));

import { POST } from './+server';
import { bulkDecideMicroCertifications } from '$lib/api/micro-certifications';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/micro-certifications/bulk-decide', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/micro-certifications/bulk-decide', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(bulkDecideMicroCertifications).mockResolvedValue({ success_count: 1 } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ certification_ids: ['mc-1'], decision: 'approve' })) as any
		);
		expect(response.status).toBe(200);
		expect(bulkDecideMicroCertifications).toHaveBeenCalled();
	});

	it('bulk-decides with required fields', async () => {
		vi.mocked(bulkDecideMicroCertifications).mockResolvedValue({ success_count: 1 } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ certification_ids: ['mc-1'], decision: 'approve' })) as any
		);
		expect(response.status).toBe(200);
		expect(bulkDecideMicroCertifications).toHaveBeenCalledWith(
			{ certification_ids: ['mc-1'], decision: 'approve' },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
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
