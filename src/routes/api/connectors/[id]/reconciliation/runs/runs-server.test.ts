import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/reconciliation', () => ({
	listRuns: vi.fn(),
	triggerRun: vi.fn()
}));

import { GET, POST } from './+server';
import { listRuns, triggerRun } from '$lib/api/reconciliation';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'c1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/connectors/c1/reconciliation/runs', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/connectors/:id/reconciliation/runs', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listRuns).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			params: { id: 'c1' },
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/connectors/c1/reconciliation/runs?limit=abc&offset=nope'
			)
		} as any);
		expect(listRuns).toHaveBeenCalledWith(
			'c1',
			{
				mode: undefined,
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

describe('POST /api/connectors/:id/reconciliation/runs', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('triggers a run with required fields', async () => {
		vi.mocked(triggerRun).mockResolvedValue({ id: 'r1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ mode: 'full', dry_run: true })) as any);
		expect(response.status).toBe(202);
		expect(triggerRun).toHaveBeenCalled();
	});

	it('does not trigger on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(triggerRun).not.toHaveBeenCalled();
	});

	it('does not trigger when mode is invalid', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ mode: 'other', dry_run: true })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(triggerRun).not.toHaveBeenCalled();
	});
});
