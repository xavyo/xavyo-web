import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/micro-certifications', () => ({
	skipMicroCertification: vi.fn()
}));

import { POST } from './+server';
import { skipMicroCertification } from '$lib/api/micro-certifications';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'mc-1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/micro-certifications/mc-1/skip', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/micro-certifications/:id/skip', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('skips with required fields', async () => {
		vi.mocked(skipMicroCertification).mockResolvedValue({ id: 'mc-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ reason: 'n/a' })) as any);
		expect(response.status).toBe(200);
		expect(skipMicroCertification).toHaveBeenCalled();
	});

	it('does not skip on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(skipMicroCertification).not.toHaveBeenCalled();
	});

	it('does not skip when reason is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(skipMicroCertification).not.toHaveBeenCalled();
	});
});
