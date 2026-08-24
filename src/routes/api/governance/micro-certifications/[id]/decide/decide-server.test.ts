import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/micro-certifications', () => ({
	decideMicroCertification: vi.fn()
}));

import { POST } from './+server';
import { decideMicroCertification } from '$lib/api/micro-certifications';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { id: 'mc-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/micro-certifications/mc-1/decide', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/micro-certifications/:id/decide', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('decides with a valid decision', async () => {
		vi.mocked(decideMicroCertification).mockResolvedValue({ id: 'mc-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ decision: 'approve' })) as any);
		expect(response.status).toBe(200);
		expect(decideMicroCertification).toHaveBeenCalledWith(
			'mc-1',
			{ decision: 'approve', comment: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not decide on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(decideMicroCertification).not.toHaveBeenCalled();
	});

	it('does not decide when decision is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(decideMicroCertification).not.toHaveBeenCalled();
	});
});
