import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/governance-roles', () => ({
	getRole: vi.fn(),
	listRoles: vi.fn(),
	updateRole: vi.fn(),
	deleteRole: vi.fn()
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
import { getRole, listRoles } from '$lib/api/governance-roles';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

const mockRole = {
	id: 'role-1',
	name: 'Engineering',
	description: 'Eng team',
	parent_role_id: null,
	is_abstract: false,
	hierarchy_depth: 0,
	version: 1,
	created_by: 'user-1',
	created_at: '2024-01-01T00:00:00Z',
	updated_at: '2024-01-01T00:00:00Z'
};

const mockRolesList = {
	items: [mockRole, { ...mockRole, id: 'role-2', name: 'Sales' }],
	total: 2,
	limit: 100,
	offset: 0
};

describe('Governance Roles Detail +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	// --- Load function ---

	describe('load', () => {
		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					params: { id: 'role-1' },
					locals: mockLocals(false),
					url: new URL('http://localhost/governance/roles/role-1'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns role, form, and availableRoles for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getRole).mockResolvedValue(mockRole as any);
			vi.mocked(listRoles).mockResolvedValue(mockRolesList as any);

			const result: any = await load({
				params: { id: 'role-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/roles/role-1'),
				fetch: vi.fn()
			} as any);

			expect(result.role).toEqual(mockRole);
			expect(result.form).toBeDefined();
			expect(result.availableRoles).toBeDefined();
		});

		it('throws 404 when getRole throws ApiError with status 404', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getRole).mockRejectedValue(new ApiError('Role not found', 404));

			try {
				await load({
					params: { id: 'nonexistent' },
					locals: mockLocals(true),
					url: new URL('http://localhost/governance/roles/nonexistent'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(404);
			}
		});

		it('filters current role from availableRoles', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getRole).mockResolvedValue(mockRole as any);
			vi.mocked(listRoles).mockResolvedValue(mockRolesList as any);

			const result: any = await load({
				params: { id: 'role-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/roles/role-1'),
				fetch: vi.fn()
			} as any);

			// role-1 should be filtered out, only role-2 remains
			expect(result.availableRoles).toHaveLength(1);
			expect(result.availableRoles[0].id).toBe('role-2');
			expect(result.availableRoles[0].name).toBe('Sales');
		});

		it('pre-populates form with role data', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getRole).mockResolvedValue(mockRole as any);
			vi.mocked(listRoles).mockResolvedValue(mockRolesList as any);

			const result: any = await load({
				params: { id: 'role-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/roles/role-1'),
				fetch: vi.fn()
			} as any);

			expect(result.form.data.name).toBe('Engineering');
			expect(result.form.data.version).toBe(1);
		});

		it('calls getRole with correct params', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getRole).mockResolvedValue(mockRole as any);
			vi.mocked(listRoles).mockResolvedValue(mockRolesList as any);

			const mockFetch = vi.fn();
			await load({
				params: { id: 'role-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/roles/role-1'),
				fetch: mockFetch
			} as any);

			expect(getRole).toHaveBeenCalledWith('role-1', 'tok', 'tid', mockFetch);
		});

		it('returns empty availableRoles when listRoles fails', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getRole).mockResolvedValue(mockRole as any);
			vi.mocked(listRoles).mockRejectedValue(new Error('network'));

			const result: any = await load({
				params: { id: 'role-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/roles/role-1'),
				fetch: vi.fn()
			} as any);

			expect(result.availableRoles).toEqual([]);
		});

		it('throws 500 for non-API errors from getRole', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getRole).mockRejectedValue(new Error('network'));

			try {
				await load({
					params: { id: 'role-1' },
					locals: mockLocals(true),
					url: new URL('http://localhost/governance/roles/role-1'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});
	});

	// --- Actions ---

	describe('actions', () => {
		it('exports update action', () => {
			expect(actions.update).toBeDefined();
		});

		it('exports delete action', () => {
			expect(actions.delete).toBeDefined();
		});
	});
});
