import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/role-mining', () => ({
	dismissConsolidationSuggestion: vi.fn()
}));

import { POST } from './+server';
import { dismissConsolidationSuggestion } from '$lib/api/role-mining';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { suggestionId: 's1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request(
			'http://localhost/api/governance/role-mining/consolidation-suggestions/s1/dismiss',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body
			}
		)
	};
}

describe('POST /api/governance/role-mining/consolidation-suggestions/:suggestionId/dismiss', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('dismisses with known fields', async () => {
		vi.mocked(dismissConsolidationSuggestion).mockResolvedValue({ id: 's1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ reason: 'keep both' })) as any);
		expect(response.status).toBe(200);
		expect(dismissConsolidationSuggestion).toHaveBeenCalled();
	});

	it('does not dismiss on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(dismissConsolidationSuggestion).not.toHaveBeenCalled();
	});

	it('does not dismiss when reason is not a string', async () => {
		await expect(POST(makeEvent(JSON.stringify({ reason: 1 })) as any)).rejects.toMatchObject({
			status: 400
		});
		expect(dismissConsolidationSuggestion).not.toHaveBeenCalled();
	});
});
