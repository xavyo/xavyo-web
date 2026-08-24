import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/semi-manual', () => ({
	getSemiManualApplication: vi.fn(),
	configureSemiManual: vi.fn(),
	removeSemiManualConfig: vi.fn()
}));

import { PUT } from './+server';
import { configureSemiManual } from '$lib/api/semi-manual';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'a1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/semi-manual/applications/a1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/governance/semi-manual/applications/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('configures with required fields', async () => {
		vi.mocked(configureSemiManual).mockResolvedValue({ id: 'a1' } as any);
		const response = await PUT(
			makeEvent(JSON.stringify({ is_semi_manual: true, requires_approval_before_ticket: false })) as any
		);
		expect(response.status).toBe(200);
		expect(configureSemiManual).toHaveBeenCalled();
	});

	it('does not configure on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(configureSemiManual).not.toHaveBeenCalled();
	});

	it('does not configure when is_semi_manual is missing', async () => {
		await expect(
			PUT(makeEvent(JSON.stringify({ requires_approval_before_ticket: false })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(configureSemiManual).not.toHaveBeenCalled();
	});
});
