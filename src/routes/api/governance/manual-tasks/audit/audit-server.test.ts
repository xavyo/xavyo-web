import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/manual-tasks', () => ({
	listManualTaskAudit: vi.fn()
}));

import { GET } from './+server';
import { listManualTaskAudit } from '$lib/api/manual-tasks';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/manual-tasks/audit', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised audit list filters', async () => {
		vi.mocked(listManualTaskAudit).mockResolvedValue({
			items: [],
			total: 0,
			limit: 50,
			offset: 0
		});
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/manual-tasks/audit?task_id=t-1&event_type=task_created&actor_id=u-1&from_date=2026-01-01T00:00:00Z&to_date=2026-01-31T23:59:59Z'
			)
		} as any);
		expect(listManualTaskAudit).toHaveBeenCalledWith(
			expect.objectContaining({
				task_id: 't-1',
				event_type: 'task_created',
				actor_id: 'u-1',
				from_date: '2026-01-01T00:00:00Z',
				to_date: '2026-01-31T23:59:59Z'
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('returns 401 when unauthorized', async () => {
		await expect(
			GET({
				locals: {},
				fetch: vi.fn(),
				url: new URL('http://localhost/api/governance/manual-tasks/audit')
			} as any)
		).rejects.toMatchObject({ status: 401 });
	});
});
