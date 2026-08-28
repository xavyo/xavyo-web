import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/detection-rules', () => ({
	listDetectionRules: vi.fn(),
	deleteDetectionRule: vi.fn(),
	enableDetectionRule: vi.fn(),
	disableDetectionRule: vi.fn(),
	seedDefaultRules: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { load } from './+page.server';
import { listDetectionRules } from '$lib/api/detection-rules';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('load /governance/detection-rules', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listDetectionRules).mockResolvedValue({ items: [], total: 0 } as any);
		await load({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/governance/detection-rules?limit=abc&offset=nope')
		} as any);
		expect(listDetectionRules).toHaveBeenCalledWith(
			{ rule_type: undefined, is_enabled: undefined, limit: 50, offset: 0 },
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});
