import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/micro-certifications', () => ({
	delegateMicroCertification: vi.fn()
}));

import { POST } from './+server';
import { delegateMicroCertification } from '$lib/api/micro-certifications';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'mc-1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/micro-certifications/mc-1/delegate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/micro-certifications/:id/delegate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('delegates with required fields', async () => {
		vi.mocked(delegateMicroCertification).mockResolvedValue({ id: 'mc-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ delegate_to: 'u2' })) as any);
		expect(response.status).toBe(200);
		expect(delegateMicroCertification).toHaveBeenCalled();
	});

	it('does not delegate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(delegateMicroCertification).not.toHaveBeenCalled();
	});

	it('does not delegate when delegate_to is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(delegateMicroCertification).not.toHaveBeenCalled();
	});
});
