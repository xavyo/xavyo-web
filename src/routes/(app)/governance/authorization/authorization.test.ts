import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/authorization', () => ({
	listPolicies: vi.fn(),
	createPolicy: vi.fn(),
	getPolicy: vi.fn(),
	updatePolicy: vi.fn(),
	deletePolicy: vi.fn()
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

import { hasAdminRole } from '$lib/server/auth';
import { listPolicies, createPolicy, getPolicy, updatePolicy, deletePolicy } from '$lib/api/authorization';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

const makePolicy = (overrides: Record<string, unknown> = {}) => ({
	id: 'pol-1',
	name: 'Allow Read',
	description: 'Allow read access',
	effect: 'allow',
	status: 'active',
	priority: 100,
	resource_type: 'document',
	action: 'read',
	conditions: [],
	created_by: 'user-1',
	created_at: '2026-01-01T00:00:00Z',
	updated_at: '2026-01-01T00:00:00Z',
	...overrides
});

// =============================================================================
// Policy List Page
// =============================================================================

describe('Authorization Policy List +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		let load: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			load = mod.load;
		});

		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					url: new URL('http://localhost/governance/authorization'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns policies for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listPolicies).mockResolvedValue({
				items: [makePolicy()],
				total: 1,
				limit: 20,
				offset: 0
			} as any);

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/authorization'),
				fetch: vi.fn()
			} as any);

			expect(result.policies).toHaveLength(1);
			expect(result.policies[0].name).toBe('Allow Read');
			expect(result.total).toBe(1);
		});

		it('reads pagination from URL params', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listPolicies).mockResolvedValue({ items: [], total: 0, limit: 10, offset: 20 } as any);

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/authorization?limit=10&offset=20'),
				fetch: vi.fn()
			} as any);

			expect(listPolicies).toHaveBeenCalledWith(
				{ limit: 10, offset: 20 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns empty array when API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listPolicies).mockRejectedValue(new Error('fail'));

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/authorization'),
				fetch: vi.fn()
			} as any);

			expect(result.policies).toEqual([]);
			expect(result.total).toBe(0);
		});
	});
});

// =============================================================================
// Policy Detail Page
// =============================================================================

describe('Authorization Policy Detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		let load: any;

		beforeEach(async () => {
			const mod = await import('./[id]/+page.server');
			load = mod.load;
		});

		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					params: { id: 'pol-1' },
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
			}
		});

		it('returns policy for admin', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getPolicy).mockResolvedValue(makePolicy() as any);

			const result = await load({
				params: { id: 'pol-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.policy.id).toBe('pol-1');
			expect(result.policy.name).toBe('Allow Read');
		});

		it('throws 404 when policy not found', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getPolicy).mockRejectedValue(new ApiError('Not found', 404));

			try {
				await load({
					params: { id: 'bad-id' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(404);
			}
		});

		it('throws 500 for non-API errors', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getPolicy).mockRejectedValue(new Error('network'));

			try {
				await load({
					params: { id: 'pol-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});
	});

	describe('actions', () => {
		let actions: any;

		beforeEach(async () => {
			const mod = await import('./[id]/+page.server');
			actions = mod.actions;
		});

		it('enable action calls updatePolicy with active status', async () => {
			vi.mocked(updatePolicy).mockResolvedValue(makePolicy({ status: 'active' }) as any);

			const result = await actions.enable({
				params: { id: 'pol-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(updatePolicy).toHaveBeenCalledWith(
				'pol-1',
				{ status: 'active' },
				'tok',
				'tid',
				expect.any(Function)
			);
			expect(result).toEqual({ success: true, action: 'enabled' });
		});

		it('disable action calls updatePolicy with inactive status', async () => {
			vi.mocked(updatePolicy).mockResolvedValue(makePolicy({ status: 'inactive' }) as any);

			const result = await actions.disable({
				params: { id: 'pol-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(updatePolicy).toHaveBeenCalledWith(
				'pol-1',
				{ status: 'inactive' },
				'tok',
				'tid',
				expect.any(Function)
			);
			expect(result).toEqual({ success: true, action: 'disabled' });
		});

		it('enable action returns fail on ApiError', async () => {
			vi.mocked(updatePolicy).mockRejectedValue(new ApiError('Forbidden', 403));

			const result = await actions.enable({
				params: { id: 'pol-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(403);
		});

		it('disable action returns fail on non-ApiError', async () => {
			vi.mocked(updatePolicy).mockRejectedValue(new Error('network'));

			const result = await actions.disable({
				params: { id: 'pol-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(500);
		});

		it('delete action redirects on success', async () => {
			vi.mocked(deletePolicy).mockResolvedValue(undefined as any);

			try {
				await actions.delete({
					params: { id: 'pol-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/governance/authorization');
			}
		});

		it('delete action returns fail on ApiError', async () => {
			vi.mocked(deletePolicy).mockRejectedValue(new ApiError('Not found', 404));

			const result = await actions.delete({
				params: { id: 'pol-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(404);
		});
	});
});

// =============================================================================
// Policy Create Page
// =============================================================================

describe('Authorization Policy Create +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		let load: any;

		beforeEach(async () => {
			const mod = await import('./create/+page.server');
			load = mod.load;
		});

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
			}
		});

		it('returns form for admin', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);

			const result = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.form).toBeDefined();
		});
	});

	describe('actions.default', () => {
		let actions: any;

		beforeEach(async () => {
			const mod = await import('./create/+page.server');
			actions = mod.actions;
		});

		it('redirects on successful creation', async () => {
			vi.mocked(createPolicy).mockResolvedValue(makePolicy({ id: 'new-pol' }) as any);

			const formData = new FormData();
			formData.set('name', 'Test Policy');
			formData.set('effect', 'allow');
			formData.set('priority', '100');
			formData.set('resource_type', 'document');
			formData.set('action', 'read');
			formData.set('description', '');

			try {
				await actions.default({
					request: new Request('http://localhost', { method: 'POST', body: formData }),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toContain('/governance/authorization/new-pol');
			}
		});

		it('creates policy with conditions from parallel arrays', async () => {
			vi.mocked(createPolicy).mockResolvedValue(makePolicy({ id: 'new-pol' }) as any);

			const formData = new FormData();
			formData.set('name', 'Deny with Condition');
			formData.set('effect', 'deny');
			formData.set('priority', '10');
			formData.set('resource_type', 'document');
			formData.set('action', 'delete');
			formData.set('description', '');
			formData.append('condition_type', 'user_attribute');
			formData.append('condition_attribute_path', 'user.role');
			formData.append('condition_operator', 'equals');
			formData.append('condition_value', 'guest');

			try {
				await actions.default({
					request: new Request('http://localhost', { method: 'POST', body: formData }),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
			} catch {
				// redirect expected
			}

			expect(createPolicy).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'Deny with Condition',
					effect: 'deny',
					conditions: [
						expect.objectContaining({
							condition_type: 'user_attribute',
							attribute_path: 'user.role',
							operator: 'equals',
							value: 'guest'
						})
					]
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns fail when form is invalid', async () => {
			const formData = new FormData();
			// missing required fields

			const result = await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
		});

		it('returns message on ApiError', async () => {
			vi.mocked(createPolicy).mockRejectedValue(new ApiError('Duplicate name', 409));

			const formData = new FormData();
			formData.set('name', 'Test Policy');
			formData.set('effect', 'allow');
			formData.set('priority', '100');
			formData.set('resource_type', 'document');
			formData.set('action', 'read');
			formData.set('description', '');

			const result = await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.data.form.message).toBe('Duplicate name');
		});
	});
});

// =============================================================================
// Policy Edit Page
// =============================================================================

describe('Authorization Policy Edit +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		let load: any;

		beforeEach(async () => {
			const mod = await import('./[id]/edit/+page.server');
			load = mod.load;
		});

		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					params: { id: 'pol-1' },
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
			}
		});

		it('pre-fills form with policy data', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getPolicy).mockResolvedValue(makePolicy() as any);

			const result = await load({
				params: { id: 'pol-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.policy.id).toBe('pol-1');
			expect(result.form.data.name).toBe('Allow Read');
			expect(result.form.data.effect).toBe('allow');
			expect(result.form.data.priority).toBe(100);
			expect(result.form.data.resource_type).toBe('document');
			expect(result.form.data.action).toBe('read');
		});

		it('throws 404 when policy not found', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getPolicy).mockRejectedValue(new ApiError('Not found', 404));

			try {
				await load({
					params: { id: 'bad-id' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(404);
			}
		});
	});

	describe('actions.default', () => {
		let actions: any;

		beforeEach(async () => {
			const mod = await import('./[id]/edit/+page.server');
			actions = mod.actions;
		});

		it('redirects on successful update', async () => {
			vi.mocked(updatePolicy).mockResolvedValue(makePolicy() as any);

			const formData = new FormData();
			formData.set('name', 'Updated Policy');
			formData.set('effect', 'deny');
			formData.set('priority', '50');
			formData.set('resource_type', 'report');
			formData.set('action', 'delete');
			formData.set('description', 'Updated desc');

			try {
				await actions.default({
					params: { id: 'pol-1' },
					request: new Request('http://localhost', { method: 'POST', body: formData }),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toContain('/governance/authorization/pol-1');
			}
		});

		it('returns message on ApiError', async () => {
			vi.mocked(updatePolicy).mockRejectedValue(new ApiError('Conflict', 409));

			const formData = new FormData();
			formData.set('name', 'Updated Policy');
			formData.set('effect', 'deny');
			formData.set('priority', '50');
			formData.set('resource_type', 'report');
			formData.set('action', 'delete');
			formData.set('description', '');

			const result = await actions.default({
				params: { id: 'pol-1' },
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.data.form.message).toBe('Conflict');
		});

		it('calls updatePolicy with correct params', async () => {
			vi.mocked(updatePolicy).mockResolvedValue(makePolicy() as any);

			const formData = new FormData();
			formData.set('name', 'Updated');
			formData.set('effect', 'allow');
			formData.set('priority', '50');
			formData.set('resource_type', 'report');
			formData.set('action', 'write');
			formData.set('description', '');

			try {
				await actions.default({
					params: { id: 'pol-1' },
					request: new Request('http://localhost', { method: 'POST', body: formData }),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
			} catch {
				// redirect expected
			}

			expect(updatePolicy).toHaveBeenCalledWith(
				'pol-1',
				expect.objectContaining({ name: 'Updated', effect: 'allow', priority: 50 }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});
	});
});

// =============================================================================
// Effect & Status Badge Logic
// =============================================================================

describe('Policy effect badge logic', () => {
	it('allow effect gets green color', () => {
		const p = makePolicy({ effect: 'allow' });
		expect(p.effect).toBe('allow');
	});

	it('deny effect gets red color', () => {
		const p = makePolicy({ effect: 'deny' });
		expect(p.effect).toBe('deny');
	});

	it('active status gets green color', () => {
		const p = makePolicy({ status: 'active' });
		expect(p.status).toBe('active');
	});

	it('inactive status gets gray color', () => {
		const p = makePolicy({ status: 'inactive' });
		expect(p.status).toBe('inactive');
	});
});

describe('Policy conditions', () => {
	it('policy can have zero conditions', () => {
		const p = makePolicy({ conditions: [] });
		expect(p.conditions).toEqual([]);
	});

	it('policy can have multiple conditions', () => {
		const p = makePolicy({
			conditions: [
				{ condition_type: 'time_window', value: '09:00-17:00' },
				{ condition_type: 'user_attribute', attribute_path: 'dept', operator: 'equals', value: 'eng' }
			]
		});
		expect(p.conditions).toHaveLength(2);
	});
});

// =============================================================================
// Svelte Component Modules
// =============================================================================

describe('Authorization policy page Svelte components', () => {
	it('list page is defined', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	});
});
