import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/correlation', () => ({
	triggerCorrelation: vi.fn()
}));

import { POST } from './+server';
import { triggerCorrelation } from '$lib/api/correlation';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string | undefined) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		params: { connectorId: 'conn-1' },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/connectors/conn-1/correlation/evaluate', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: body ?? ''
		})
	};
}

describe('POST /api/connectors/:connectorId/correlation/evaluate', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('triggers with account_ids when JSON is valid', async () => {
		vi.mocked(triggerCorrelation).mockResolvedValue({ id: 'job-1' } as any);
		const response = await POST(makeEvent(JSON.stringify({ account_ids: ['a1'] })) as any);
		expect(response.status).toBe(202);
		expect(triggerCorrelation).toHaveBeenCalledWith(
			'conn-1',
			{ account_ids: ['a1'] },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('triggers with an empty body as no filter', async () => {
		vi.mocked(triggerCorrelation).mockResolvedValue({ id: 'job-1' } as any);
		const response = await POST(makeEvent('') as any);
		expect(response.status).toBe(202);
		expect(triggerCorrelation).toHaveBeenCalledWith(
			'conn-1',
			undefined,
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('does not trigger on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(triggerCorrelation).not.toHaveBeenCalled();
	});
});
