import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/me', () => ({
	getProfile: vi.fn(),
	updateProfile: vi.fn(),
	getSecurityOverview: vi.fn()
}));

vi.mock('$lib/api/mfa', () => ({
	getMfaStatus: vi.fn()
}));

vi.mock('$lib/api/alerts', () => ({
	fetchAlerts: vi.fn()
}));

vi.mock('$lib/api/auth', () => ({
	resendVerification: vi.fn()
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

import { load, actions } from './+page.server';
import { getProfile, getSecurityOverview } from '$lib/api/me';
import { getMfaStatus } from '$lib/api/mfa';
import { fetchAlerts } from '$lib/api/alerts';
import { resendVerification } from '$lib/api/auth';
import { ApiError } from '$lib/api/client';

const mockLocals = () => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { id: 'u1', email: 'a@b.com', roles: ['user'] }
});

describe('Settings +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getProfile).mockResolvedValue({
			id: 'u1',
			email: 'a@b.com',
			display_name: 'Ada',
			first_name: 'Ada',
			last_name: 'Lovelace',
			avatar_url: null
		} as any);
		vi.mocked(getMfaStatus).mockResolvedValue({ totp_enabled: true } as any);
		vi.mocked(getSecurityOverview).mockResolvedValue({ recent_logins: [] } as any);
		vi.mocked(fetchAlerts).mockResolvedValue({ unacknowledged_count: 3 } as any);
	});

	it('throws 401 when unauthenticated', async () => {
		try {
			await load({
				locals: { accessToken: null, tenantId: 'tid' },
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(401);
		}
	});

	it('returns profile, MFA, security overview, and alerts', async () => {
		const result = (await load({
			locals: mockLocals(),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.profile.display_name).toBe('Ada');
		expect(result.mfaStatus.totp_enabled).toBe(true);
		expect(result.securityOverview).toBeDefined();
		expect(result.unacknowledgedAlertCount).toBe(3);
	});

	it('fails closed when MFA status throws', async () => {
		vi.mocked(getMfaStatus).mockRejectedValue(new Error('network'));

		try {
			await load({
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('fails closed when security overview throws', async () => {
		vi.mocked(getSecurityOverview).mockRejectedValue(new Error('network'));

		try {
			await load({
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('propagates ApiError status from profile', async () => {
		vi.mocked(getProfile).mockRejectedValue(new ApiError('Forbidden', 403));

		try {
			await load({
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(403);
		}
	});

	describe('resendVerification action', () => {
		it('calls auth resend with the session email and tenant', async () => {
			vi.mocked(resendVerification).mockResolvedValue(undefined);

			const result = await actions.resendVerification({
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);

			expect(resendVerification).toHaveBeenCalledWith('a@b.com', 'tid', expect.any(Function));
			expect(result).toEqual({ success: true, action: 'resendVerification' });
		});

		it('returns success even when the API call fails (no enumeration)', async () => {
			vi.mocked(resendVerification).mockRejectedValue(new Error('smtp down'));

			const result = await actions.resendVerification({
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({ success: true, action: 'resendVerification' });
		});

		it('fails when session has no email', async () => {
			const result = await actions.resendVerification({
				locals: { ...mockLocals(), user: { id: 'u1', roles: ['user'] } },
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({
				success: false,
				error: 'Missing email',
				action: 'resendVerification'
			});
			expect(resendVerification).not.toHaveBeenCalled();
		});
	});
});
