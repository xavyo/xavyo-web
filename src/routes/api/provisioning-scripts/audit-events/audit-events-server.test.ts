import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/script-analytics', () => ({
	listScriptAuditEvents: vi.fn()
}));

import { GET } from './+server';
import { listScriptAuditEvents } from '$lib/api/script-analytics';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/provisioning-scripts/audit-events', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listScriptAuditEvents).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/provisioning-scripts/audit-events?limit=abc&offset=nope')
		} as any);
		expect(listScriptAuditEvents).toHaveBeenCalledWith(
			{ script_id: undefined, action: undefined, limit: undefined, offset: undefined },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
