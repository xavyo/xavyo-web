import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/object-templates', () => ({
	listObjectTemplates: vi.fn()
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
import { listObjectTemplates } from '$lib/api/object-templates';
import { hasAdminRole } from '$lib/server/auth';

describe('Object templates +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not redirect a non-admin JWT user', async () => {
		vi.mocked(listObjectTemplates).mockResolvedValue({ items: [], total: 0 } as any);
		const result = await load({
			locals: { accessToken: 'tok', tenantId: 'tid', user: { roles: ['user'] } },
			url: new URL('http://localhost/governance/object-templates')
		} as any);
		expect(result.templates).toEqual([]);
		expect(listObjectTemplates).toHaveBeenCalled();
	});
});
