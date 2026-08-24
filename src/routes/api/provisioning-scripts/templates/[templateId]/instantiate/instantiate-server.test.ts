import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	instantiateTemplate: vi.fn()
}));

import { POST } from './+server';
import { instantiateTemplate } from '$lib/api/provisioning-scripts';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { templateId: 't1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/provisioning-scripts/templates/t1/instantiate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/provisioning-scripts/templates/:templateId/instantiate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('instantiates with required fields', async () => {
		vi.mocked(instantiateTemplate).mockResolvedValue({ id: 's1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'from-template' })) as any);
		expect(response.status).toBe(201);
		expect(instantiateTemplate).toHaveBeenCalled();
	});

	it('does not instantiate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(instantiateTemplate).not.toHaveBeenCalled();
	});

	it('does not instantiate when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(instantiateTemplate).not.toHaveBeenCalled();
	});
});
