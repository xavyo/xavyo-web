import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	listMiningJobs: vi.fn(),
	createMiningJob: vi.fn()
}));

import { GET, POST } from './+server';
import { createMiningJob, listMiningJobs } from '$lib/api/role-mining';

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

describe('GET /api/governance/role-mining/jobs', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listMiningJobs).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/role-mining/jobs?limit=abc&offset=nope')
		} as any);
		expect(listMiningJobs).toHaveBeenCalledWith(
			{
				status: undefined,
				limit: undefined,
				offset: undefined
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

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

	it('rejects NaN min_users instead of forwarding it', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({ name: 'Q1 mine', parameters: { min_users: Number.NaN } })
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createMiningJob).not.toHaveBeenCalled();
	});
});
