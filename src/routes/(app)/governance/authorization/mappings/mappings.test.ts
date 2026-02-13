import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/authorization', () => ({
	listMappings: vi.fn(),
	createMapping: vi.fn(),
	deleteMapping: vi.fn()
}));

vi.mock('$lib/api/governance', () => ({
	listEntitlements: vi.fn()
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
import { listMappings, createMapping, deleteMapping } from '$lib/api/authorization';
import { listEntitlements } from '$lib/api/governance';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

const makeMapping = (overrides: Record<string, unknown> = {}) => ({
	id: 'map-1',
	entitlement_id: '550e8400-e29b-41d4-a716-446655440000',
	action: 'read',
	resource_type: 'document',
	created_at: '2026-01-01T00:00:00Z',
	...overrides
});

// =============================================================================
// Mappings List Page
// =============================================================================

describe('Mappings List +page.server', () => {
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
					url: new URL('http://localhost/governance/authorization/mappings'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns mappings for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listMappings).mockResolvedValue({
				items: [makeMapping()],
				total: 1,
				limit: 20,
				offset: 0
			} as any);

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/authorization/mappings'),
				fetch: vi.fn()
			} as any);

			expect(result.mappings).toHaveLength(1);
			expect(result.mappings[0].action).toBe('read');
			expect(result.total).toBe(1);
		});

		it('reads pagination from URL params', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listMappings).mockResolvedValue({ items: [], total: 0, limit: 10, offset: 20 } as any);

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/authorization/mappings?limit=10&offset=20'),
				fetch: vi.fn()
			} as any);

			expect(listMappings).toHaveBeenCalledWith(
				{ limit: 10, offset: 20 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns empty array when API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listMappings).mockRejectedValue(new Error('fail'));

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/authorization/mappings'),
				fetch: vi.fn()
			} as any);

			expect(result.mappings).toEqual([]);
			expect(result.total).toBe(0);
		});
	});

	describe('actions', () => {
		let actions: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			actions = mod.actions;
		});

		it('delete action calls deleteMapping with correct params', async () => {
			vi.mocked(deleteMapping).mockResolvedValue(undefined as any);

			const formData = new FormData();
			formData.set('id', 'map-1');

			const result = await actions.delete({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(deleteMapping).toHaveBeenCalledWith('map-1', 'tok', 'tid', expect.any(Function));
			expect(result).toEqual({ success: true, action: 'delete' });
		});

		it('delete action returns error when id is missing', async () => {
			const formData = new FormData();

			const result = await actions.delete({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({ success: false, error: 'Missing mapping ID' });
		});

		it('delete action returns ApiError message', async () => {
			vi.mocked(deleteMapping).mockRejectedValue(new ApiError('Not found', 404));

			const formData = new FormData();
			formData.set('id', 'map-1');

			const result = await actions.delete({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({ success: false, error: 'Not found' });
		});

		it('delete action returns generic error for non-ApiError', async () => {
			vi.mocked(deleteMapping).mockRejectedValue(new Error('network'));

			const formData = new FormData();
			formData.set('id', 'map-1');

			const result = await actions.delete({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result).toEqual({ success: false, error: 'Failed to delete mapping' });
		});
	});
});

// =============================================================================
// Mapping Create Page
// =============================================================================

describe('Mapping Create +page.server', () => {
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

		it('returns form and entitlements for admin', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listEntitlements).mockResolvedValue({
				items: [{ id: 'ent-1', name: 'Admin Access' }],
				total: 1,
				limit: 100,
				offset: 0
			} as any);

			const result = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.form).toBeDefined();
			expect(result.entitlements).toHaveLength(1);
			expect(result.entitlements[0].name).toBe('Admin Access');
		});

		it('returns empty entitlements when API fails', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listEntitlements).mockRejectedValue(new Error('fail'));

			const result = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.entitlements).toEqual([]);
		});
	});

	describe('actions.default', () => {
		let actions: any;

		beforeEach(async () => {
			const mod = await import('./create/+page.server');
			actions = mod.actions;
		});

		it('redirects on successful creation', async () => {
			vi.mocked(createMapping).mockResolvedValue(makeMapping() as any);

			const formData = new FormData();
			formData.set('entitlement_id', '550e8400-e29b-41d4-a716-446655440000');
			formData.set('action', 'read');
			formData.set('resource_type', 'document');

			try {
				await actions.default({
					request: new Request('http://localhost', { method: 'POST', body: formData }),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/governance/authorization/mappings');
			}
		});

		it('returns fail when form is invalid (bad uuid)', async () => {
			const formData = new FormData();
			formData.set('entitlement_id', 'not-a-uuid');
			formData.set('action', 'read');
			formData.set('resource_type', 'document');

			const result = await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
		});

		it('returns fail when required fields missing', async () => {
			const formData = new FormData();

			const result = await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
		});

		it('returns message on ApiError (duplicate)', async () => {
			vi.mocked(createMapping).mockRejectedValue(
				new ApiError('A mapping with this entitlement, action, and resource type already exists', 409)
			);

			const formData = new FormData();
			formData.set('entitlement_id', '550e8400-e29b-41d4-a716-446655440000');
			formData.set('action', 'read');
			formData.set('resource_type', 'document');

			const result = await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.data.form.message).toContain('already exists');
		});

		it('returns message on ApiError (entitlement not found)', async () => {
			vi.mocked(createMapping).mockRejectedValue(
				new ApiError('The specified entitlement does not exist', 422)
			);

			const formData = new FormData();
			formData.set('entitlement_id', '550e8400-e29b-41d4-a716-446655440000');
			formData.set('action', 'read');
			formData.set('resource_type', 'document');

			const result = await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.data.form.message).toContain('entitlement does not exist');
		});

		it('returns generic message on non-ApiError', async () => {
			vi.mocked(createMapping).mockRejectedValue(new Error('network'));

			const formData = new FormData();
			formData.set('entitlement_id', '550e8400-e29b-41d4-a716-446655440000');
			formData.set('action', 'read');
			formData.set('resource_type', 'document');

			const result = await actions.default({
				request: new Request('http://localhost', { method: 'POST', body: formData }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.data.form.message).toBe('An unexpected error occurred');
		});
	});
});

// =============================================================================
// Svelte Component Modules
// =============================================================================

describe('Mapping page Svelte components', () => {
	it('list page is defined', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	}, 15000);

	it('create page is defined', async () => {
		const mod = await import('./create/+page.svelte');
		expect(mod.default).toBeDefined();
	});
});
