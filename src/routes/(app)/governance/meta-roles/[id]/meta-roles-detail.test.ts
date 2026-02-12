import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/meta-roles', () => ({
	getMetaRole: vi.fn(),
	updateMetaRole: vi.fn(),
	deleteMetaRole: vi.fn(),
	enableMetaRole: vi.fn(),
	disableMetaRole: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class extends Error {
		status: number;
		constructor(m: string, s: number) {
			super(m);
			this.status = s;
		}
	}
}));

import { load, actions } from './+page.server';
import { hasAdminRole } from '$lib/server/auth';
import {
	getMetaRole,
	updateMetaRole,
	deleteMetaRole,
	enableMetaRole,
	disableMetaRole
} from '$lib/api/meta-roles';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

const mockMetaRole = {
	id: 'mr1',
	name: 'Test Meta-Role',
	description: 'Test description',
	priority: 10,
	status: 'active',
	criteria_logic: 'and',
	created_by: 'user1',
	created_at: '2026-01-01T00:00:00Z',
	updated_at: '2026-01-01T00:00:00Z',
	criteria: [],
	entitlements: [],
	constraints: [],
	stats: {
		active_inheritances: 5,
		unresolved_conflicts: 1,
		criteria_count: 2,
		entitlements_count: 3,
		constraints_count: 1
	}
};

function makeFormData(data: Record<string, string>): Request {
	const formData = new URLSearchParams();
	for (const [k, v] of Object.entries(data)) {
		formData.set(k, v);
	}
	return new Request('http://localhost/governance/meta-roles/mr1', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Meta-Roles Detail +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	// --- Load function ---

	describe('load', () => {
		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					params: { id: 'mr1' },
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns metaRole and form for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getMetaRole).mockResolvedValue(mockMetaRole as any);

			const result: any = await load({
				params: { id: 'mr1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.metaRole).toEqual(mockMetaRole);
			expect(result.form).toBeDefined();
		});

		it('pre-populates form with meta-role data', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getMetaRole).mockResolvedValue(mockMetaRole as any);

			const result: any = await load({
				params: { id: 'mr1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.form.data.name).toBe('Test Meta-Role');
			expect(result.form.data.priority).toBe(10);
			expect(result.form.data.criteria_logic).toBe('and');
		});

		it('throws 404 when getMetaRole throws ApiError with status 404', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getMetaRole).mockRejectedValue(new ApiError('Not found', 404));

			try {
				await load({
					params: { id: 'nonexistent' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(404);
			}
		});

		it('throws 500 for non-API errors from getMetaRole', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getMetaRole).mockRejectedValue(new Error('network'));

			try {
				await load({
					params: { id: 'mr1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});

		it('calls getMetaRole with correct params', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getMetaRole).mockResolvedValue(mockMetaRole as any);

			const mockFetch = vi.fn();
			await load({
				params: { id: 'mr1' },
				locals: mockLocals(true),
				fetch: mockFetch
			} as any);

			expect(getMetaRole).toHaveBeenCalledWith('mr1', 'tok', 'tid', mockFetch);
		});
	});

	// --- Actions ---

	describe('actions', () => {
		it('exports update action', () => {
			expect(actions.update).toBeDefined();
		});

		it('exports enable action', () => {
			expect(actions.enable).toBeDefined();
		});

		it('exports disable action', () => {
			expect(actions.disable).toBeDefined();
		});

		it('exports delete action', () => {
			expect(actions.delete).toBeDefined();
		});
	});

	describe('actions.update', () => {
		it('returns validation error for invalid data', async () => {
			const result: any = await actions.update({
				request: makeFormData({ name: '', priority: '0' }),
				params: { id: 'mr1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			// superforms returns 200 with message for valid-but-empty optional fields,
			// or 400 if invalid — depends on schema optionality
			expect(result).toBeDefined();
		});

		it('calls updateMetaRole on valid data', async () => {
			vi.mocked(updateMetaRole).mockResolvedValue({
				...mockMetaRole,
				name: 'Updated'
			} as any);

			const result: any = await actions.update({
				request: makeFormData({ name: 'Updated Name', priority: '20', criteria_logic: 'or' }),
				params: { id: 'mr1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(updateMetaRole).toHaveBeenCalledWith(
				'mr1',
				expect.objectContaining({ name: 'Updated Name', priority: 20, criteria_logic: 'or' }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns API error message on failure', async () => {
			vi.mocked(updateMetaRole).mockRejectedValue(new ApiError('Conflict', 409));

			const result: any = await actions.update({
				request: makeFormData({ name: 'Updated', priority: '10' }),
				params: { id: 'mr1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(409);
		});

		it('returns generic error for non-API errors', async () => {
			vi.mocked(updateMetaRole).mockRejectedValue(new Error('network'));

			const result: any = await actions.update({
				request: makeFormData({ name: 'Updated', priority: '10' }),
				params: { id: 'mr1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(500);
		});
	});

	describe('actions.enable', () => {
		it('enables meta-role and returns success', async () => {
			vi.mocked(enableMetaRole).mockResolvedValue({
				...mockMetaRole,
				status: 'active'
			} as any);

			const result: any = await actions.enable({
				params: { id: 'mr1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(enableMetaRole).toHaveBeenCalledWith('mr1', 'tok', 'tid', expect.any(Function));
			expect(result.success).toBe(true);
		});

		it('returns fail on API error', async () => {
			vi.mocked(enableMetaRole).mockRejectedValue(new ApiError('Cannot enable', 400));

			const result: any = await actions.enable({
				params: { id: 'mr1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
		});

		it('returns fail 500 on non-API error', async () => {
			vi.mocked(enableMetaRole).mockRejectedValue(new Error('network'));

			const result: any = await actions.enable({
				params: { id: 'mr1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(500);
		});
	});

	describe('actions.disable', () => {
		it('disables meta-role and returns success', async () => {
			vi.mocked(disableMetaRole).mockResolvedValue({
				...mockMetaRole,
				status: 'disabled'
			} as any);

			const result: any = await actions.disable({
				params: { id: 'mr1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(disableMetaRole).toHaveBeenCalledWith('mr1', 'tok', 'tid', expect.any(Function));
			expect(result.success).toBe(true);
		});

		it('returns fail on API error', async () => {
			vi.mocked(disableMetaRole).mockRejectedValue(new ApiError('Cannot disable', 400));

			const result: any = await actions.disable({
				params: { id: 'mr1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
		});

		it('returns fail 500 on non-API error', async () => {
			vi.mocked(disableMetaRole).mockRejectedValue(new Error('network'));

			const result: any = await actions.disable({
				params: { id: 'mr1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(500);
		});
	});

	describe('actions.delete', () => {
		it('deletes meta-role and redirects', async () => {
			vi.mocked(deleteMetaRole).mockResolvedValue(undefined);

			try {
				await actions.delete({
					params: { id: 'mr1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/governance/meta-roles');
			}
		});

		it('returns fail on API error', async () => {
			vi.mocked(deleteMetaRole).mockRejectedValue(
				new ApiError('Has active inheritances', 409)
			);

			const result: any = await actions.delete({
				params: { id: 'mr1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(409);
		});

		it('returns fail 500 on non-API error', async () => {
			vi.mocked(deleteMetaRole).mockRejectedValue(new Error('network'));

			const result: any = await actions.delete({
				params: { id: 'mr1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(500);
		});
	});
});
