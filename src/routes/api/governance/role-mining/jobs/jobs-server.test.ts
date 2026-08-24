import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	listMiningJobs: vi.fn(),
	createMiningJob: vi.fn()
}));

import { POST } from './+server';
import { createMiningJob } from '$lib/api/role-mining';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/role-mining/jobs', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/role-mining/jobs', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('creates a job with required fields', async () => {
		vi.mocked(createMiningJob).mockResolvedValue({ id: 'j1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ name: 'Q1 mine' })) as any);
		expect(response.status).toBe(201);
		expect(createMiningJob).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createMiningJob).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		await expect(POST(makeEvent(JSON.stringify({})) as any)).rejects.toMatchObject({ status: 400 });
		expect(createMiningJob).not.toHaveBeenCalled();
	});
});
