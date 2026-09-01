import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/personas', () => ({
	listPersonaAudit: vi.fn()
}));

import { GET } from './+server';
import { listPersonaAudit } from '$lib/api/personas';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('GET /api/governance/persona-audit', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('forwards advertised date filters', async () => {
		vi.mocked(listPersonaAudit).mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT },
			fetch: vi.fn(),
			url: new URL(
				'http://localhost/api/governance/persona-audit?persona_id=p-1&from_date=2026-01-01T00:00:00Z&to_date=2026-01-31T23:59:59Z'
			)
		} as any);
		expect(listPersonaAudit).toHaveBeenCalledWith(
			expect.objectContaining({
				persona_id: 'p-1',
				from_date: '2026-01-01T00:00:00Z',
				to_date: '2026-01-31T23:59:59Z'
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
