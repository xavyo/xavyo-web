import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/governance-roles', () => ({
	listRoles: vi.fn(),
	createRole: vi.fn()
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
import { listRoles, createRole } from '$lib/api/governance-roles';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeFormData(data: Record<string, string>): Request {
	const formData = new URLSearchParams();
	for (const [k, v] of Object.entries(data)) {
		formData.set(k, v);
	}
	return new Request('http://localhost/governance/roles/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Governance Roles Create +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	// --- Load function ---

	describe('load', () => {
		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns form and parentRoles for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listRoles).mockResolvedValue({
				items: [
					{ id: 'r1', name: 'Role A' },
					{ id: 'r2', name: 'Role B' }
				],
				total: 2,
				limit: 100,
				offset: 0
			} as any);

			const result: any = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.form).toBeDefined();
			expect(result.parentRoles).toEqual([
				{ id: 'r1', name: 'Role A' },
				{ id: 'r2', name: 'Role B' }
			]);
		});

		it('returns empty parentRoles when listRoles throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listRoles).mockRejectedValue(new Error('network error'));

			const result: any = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.form).toBeDefined();
			expect(result.parentRoles).toEqual([]);
		});
	});

	// --- Action ---

	describe('default action', () => {
		it('exports default action', () => {
			expect(actions).toBeDefined();
			expect(actions.default).toBeDefined();
		});

		it('returns validation error for missing name', async () => {
			const result: any = await actions.default({
				request: makeFormData({ name: '' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('calls createRole and redirects on success', async () => {
			vi.mocked(createRole).mockResolvedValue({} as any);
			try {
				await actions.default({
					request: makeFormData({ name: 'Finance Admin' }),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/governance/roles');
			}
			expect(createRole).toHaveBeenCalledWith(
				{ name: 'Finance Admin', description: undefined, parent_id: undefined },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns API error message on failure', async () => {
			vi.mocked(createRole).mockRejectedValue(new ApiError('Role name exists', 409));
			const result: any = await actions.default({
				request: makeFormData({ name: 'Duplicate Role' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(409);
		});

		it('returns generic error for non-API errors', async () => {
			vi.mocked(createRole).mockRejectedValue(new Error('network error'));
			const result: any = await actions.default({
				request: makeFormData({ name: 'Some Role' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(500);
		});
	});
});
