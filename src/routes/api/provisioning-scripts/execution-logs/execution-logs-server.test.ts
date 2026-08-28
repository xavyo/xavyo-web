import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/script-analytics', () => ({
	listScriptExecutionLogs: vi.fn()
}));

import { GET } from './+server';
import { listScriptExecutionLogs } from '$lib/api/script-analytics';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/provisioning-scripts/execution-logs', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listScriptExecutionLogs).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/provisioning-scripts/execution-logs?page=abc&page_size=nope'
			)
		} as any);
		expect(listScriptExecutionLogs).toHaveBeenCalledWith(
			{
				script_id: undefined,
				connector_id: undefined,
				binding_id: undefined,
				status: undefined,
				dry_run: undefined,
				from_date: undefined,
				to_date: undefined,
				page: undefined,
				page_size: undefined
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
