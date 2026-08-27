import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/nhi-requests', () => ({
	getNhiRequest: vi.fn(),
	approveNhiRequest: vi.fn(),
	rejectNhiRequest: vi.fn(),
	cancelNhiRequest: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { actions } from './+page.server';
import { approveNhiRequest, rejectNhiRequest } from '$lib/api/nhi-requests';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function formRequest(fields: Record<string, string>) {
	const body = new URLSearchParams(fields);
	return new Request('http://localhost/nhi/requests/req-1', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body
	});
}

describe('NHI request detail actions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin reviewer on approve', async () => {
		vi.mocked(approveNhiRequest).mockResolvedValue({ id: 'req-1' } as any);
		try {
			await actions.approve({
				locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
				params: { id: 'req-1' },
				request: formRequest({ comments: 'ok' }),
				fetch: vi.fn()
			} as any);
			expect.fail('should redirect');
		} catch (e: any) {
			expect(e.status).toBe(303);
		}
		expect(approveNhiRequest).toHaveBeenCalled();
	});

	it('does not 403 a non-admin reviewer on reject', async () => {
		vi.mocked(rejectNhiRequest).mockResolvedValue({ id: 'req-1' } as any);
		try {
			await actions.reject({
				locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
				params: { id: 'req-1' },
				request: formRequest({ reason: 'not needed' }),
				fetch: vi.fn()
			} as any);
			expect.fail('should redirect');
		} catch (e: any) {
			expect(e.status).toBe(303);
		}
		expect(rejectNhiRequest).toHaveBeenCalled();
	});
});
