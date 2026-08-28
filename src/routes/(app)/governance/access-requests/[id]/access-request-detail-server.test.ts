import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/access-requests', () => ({
	getAccessRequest: vi.fn(),
	approveAccessRequest: vi.fn(),
	rejectAccessRequest: vi.fn()
}));

vi.mock('$lib/api/approval-workflows', () => ({
	getEscalationHistory: vi.fn(),
	cancelEscalation: vi.fn(),
	resetEscalation: vi.fn()
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

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load } from './+page.server';
import { getAccessRequest } from '$lib/api/access-requests';
import { getEscalationHistory } from '$lib/api/approval-workflows';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Access request detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(getAccessRequest).mockResolvedValue({ id: 'req-1' } as any);
		vi.mocked(getEscalationHistory).mockResolvedValue({ events: [{ id: 'e1' }] } as any);
	});

	it('returns request and escalation history', async () => {
		const result = (await load({
			params: { id: 'req-1' },
			locals: mockLocals(true),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.request.id).toBe('req-1');
		expect(result.escalationHistory.events).toHaveLength(1);
	});

	it('does not redirect a non-admin requester or approver', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(getEscalationHistory).mockRejectedValue(new ApiError('Forbidden', 403));
		const result = (await load({
			params: { id: 'req-1' },
			locals: mockLocals(false),
			fetch: vi.fn()
		} as any)) as any;
		expect(result.request.id).toBe('req-1');
		expect(result.escalationHistory.events).toEqual([]);
	});

	it('fails closed when escalation history throws', async () => {
		vi.mocked(getEscalationHistory).mockRejectedValue(new Error('network'));

		try {
			await load({
				params: { id: 'req-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates non-403 ApiError status from escalation history', async () => {
		vi.mocked(getEscalationHistory).mockRejectedValue(new ApiError('Unavailable', 502));

		try {
			await load({
				params: { id: 'req-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(502);
		}
	});
});
