import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(false)
}));

vi.mock('$lib/api/governance-reporting', () => ({
	resumeSchedule: vi.fn()
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

import { POST } from './+server';
import { resumeSchedule } from '$lib/api/governance-reporting';

const TOKEN = 'tok';
const TENANT = 'tid';

describe('POST /api/governance/reports/schedules/:id/resume', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(resumeSchedule).mockResolvedValue({ id: 's1', paused: false } as any);
		const response = await POST({
			params: { id: 's1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(resumeSchedule).toHaveBeenCalledWith('s1', TOKEN, TENANT, expect.any(Function));
	});
});
