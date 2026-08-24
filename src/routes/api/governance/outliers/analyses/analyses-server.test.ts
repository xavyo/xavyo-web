import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/outliers', () => ({
	listOutlierAnalyses: vi.fn(),
	triggerOutlierAnalysis: vi.fn()
}));

import { POST } from './+server';
import { triggerOutlierAnalysis } from '$lib/api/outliers';

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
