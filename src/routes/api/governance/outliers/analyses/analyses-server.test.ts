import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/outliers', () => ({
	listOutlierAnalyses: vi.fn(),
	triggerOutlierAnalysis: vi.fn()
}));

import { GET, POST } from './+server';
import { listOutlierAnalyses, triggerOutlierAnalysis } from '$lib/api/outliers';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/outliers/analyses', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/outliers/analyses', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('maps page/page_size onto limit/offset', async () => {
		vi.mocked(listOutlierAnalyses).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/outliers/analyses?page=2&page_size=20')
		} as any);
		expect(listOutlierAnalyses).toHaveBeenCalledWith(
			{ status: undefined, triggered_by: undefined, limit: 20, offset: 20 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/governance/outliers/analyses', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('triggers an analysis with required fields', async () => {
		vi.mocked(triggerOutlierAnalysis).mockResolvedValue({ id: 'a1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ triggered_by: 'manual' })) as any);
		expect(response.status).toBe(201);
		expect(triggerOutlierAnalysis).toHaveBeenCalled();
	});

	it('does not trigger on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(triggerOutlierAnalysis).not.toHaveBeenCalled();
	});

	it('does not trigger when triggered_by is invalid', async () => {
		await expect(POST(makeEvent(JSON.stringify({ triggered_by: 'other' })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(triggerOutlierAnalysis).not.toHaveBeenCalled();
	});
});
