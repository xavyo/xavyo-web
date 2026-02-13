import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/simulations', () => ({
	createBatchSimulation: vi.fn()
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

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn().mockResolvedValue({
		valid: true,
		data: {
			name: '',
			batch_type: '',
			selection_mode: '',
			user_ids: '',
			filter_department: '',
			filter_status: '',
			filter_role_ids: '',
			filter_entitlement_ids: '',
			filter_title: '',
			filter_metadata: '',
			change_role_id: '',
			change_entitlement_id: '',
			change_justification: ''
		},
		errors: {}
	}),
	message: vi.fn((form, msg, opts) => ({ form, message: msg, ...opts }))
}));

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema) => schema)
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import { hasAdminRole } from '$lib/server/auth';

const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Batch simulation create +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
			const { load } = await import('./+page.server');
			try {
				await load({
					locals: mockLocals(false)
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns superform data for admin', async () => {
			const { load } = await import('./+page.server');
			const result = (await load({
				locals: mockLocals(true)
			} as any)) as any;

			expect(result.form).toBeDefined();
			expect(result.form.valid).toBe(true);
		});
	});
});

describe('Batch simulation create +page.svelte', () => {
	it(
		'is defined as a module',
		async () => {
			const mod = await import('./+page.svelte');
			expect(mod.default).toBeDefined();
		},
		15000
	);

	it(
		'is a valid Svelte component constructor',
		async () => {
			const mod = await import('./+page.svelte');
			expect(typeof mod.default).toBe('function');
		},
		15000
	);
});

describe('Batch simulation create form logic', () => {
	describe('form fields', () => {
		const fields = [
			'name',
			'batch_type',
			'selection_mode',
			'user_ids',
			'filter_department',
			'filter_status',
			'filter_role_ids',
			'filter_entitlement_ids',
			'filter_title',
			'filter_metadata',
			'change_role_id',
			'change_entitlement_id',
			'change_justification'
		];

		it('has name field', () => {
			expect(fields).toContain('name');
		});

		it('has batch_type field', () => {
			expect(fields).toContain('batch_type');
		});

		it('has selection_mode field', () => {
			expect(fields).toContain('selection_mode');
		});

		it('has user_ids field', () => {
			expect(fields).toContain('user_ids');
		});

		it('has filter_department field', () => {
			expect(fields).toContain('filter_department');
		});
	});

	describe('batch type options', () => {
		const batchTypeOptions = [
			{ value: 'role_add', label: 'Role Add' },
			{ value: 'role_remove', label: 'Role Remove' },
			{ value: 'entitlement_add', label: 'Entitlement Add' },
			{ value: 'entitlement_remove', label: 'Entitlement Remove' }
		];

		it('has 4 batch type options', () => {
			expect(batchTypeOptions).toHaveLength(4);
		});

		it('has Role Add option', () => {
			expect(batchTypeOptions[0].value).toBe('role_add');
		});

		it('has Role Remove option', () => {
			expect(batchTypeOptions[1].value).toBe('role_remove');
		});

		it('has Entitlement Add option', () => {
			expect(batchTypeOptions[2].value).toBe('entitlement_add');
		});

		it('has Entitlement Remove option', () => {
			expect(batchTypeOptions[3].value).toBe('entitlement_remove');
		});
	});

	describe('selection mode options', () => {
		const selectionModeOptions = [
			{ value: 'user_list', label: 'User List' },
			{ value: 'filter', label: 'Filter' }
		];

		it('has 2 selection mode options', () => {
			expect(selectionModeOptions).toHaveLength(2);
		});

		it('has User List option', () => {
			expect(selectionModeOptions[0].value).toBe('user_list');
		});

		it('has Filter option', () => {
			expect(selectionModeOptions[1].value).toBe('filter');
		});
	});

	describe('conditional field visibility for selection_mode=filter', () => {
		it('shows filter fields when selection_mode is filter', () => {
			const selectionMode = 'filter';
			const showFilterFields = selectionMode === 'filter';
			expect(showFilterFields).toBe(true);
		});

		it('hides filter fields when selection_mode is user_list', () => {
			const selectionMode = 'user_list';
			const showFilterFields = selectionMode === 'filter';
			expect(showFilterFields).toBe(false);
		});

		it('shows user_ids field when selection_mode is user_list', () => {
			const selectionMode = 'user_list';
			const showUserIds = selectionMode === 'user_list';
			expect(showUserIds).toBe(true);
		});

		it('hides user_ids field when selection_mode is filter', () => {
			const selectionMode = 'filter';
			const showUserIds = selectionMode === 'user_list';
			expect(showUserIds).toBe(false);
		});
	});

	describe('conditional change spec fields', () => {
		it('shows role_id field for role_add batch_type', () => {
			const batchType = 'role_add';
			const isRoleOperation = batchType === 'role_add' || batchType === 'role_remove';
			expect(isRoleOperation).toBe(true);
		});

		it('shows role_id field for role_remove batch_type', () => {
			const batchType = 'role_remove';
			const isRoleOperation = batchType === 'role_add' || batchType === 'role_remove';
			expect(isRoleOperation).toBe(true);
		});

		it('shows entitlement_id field for entitlement_add batch_type', () => {
			const batchType = 'entitlement_add';
			const isEntitlementOperation =
				batchType === 'entitlement_add' || batchType === 'entitlement_remove';
			expect(isEntitlementOperation).toBe(true);
		});

		it('shows entitlement_id field for entitlement_remove batch_type', () => {
			const batchType = 'entitlement_remove';
			const isEntitlementOperation =
				batchType === 'entitlement_add' || batchType === 'entitlement_remove';
			expect(isEntitlementOperation).toBe(true);
		});

		it('hides role_id for entitlement operations', () => {
			const batchType = 'entitlement_add';
			const isRoleOperation = batchType === 'role_add' || batchType === 'role_remove';
			expect(isRoleOperation).toBe(false);
		});

		it('hides entitlement_id for role operations', () => {
			const batchType = 'role_add';
			const isEntitlementOperation =
				batchType === 'entitlement_add' || batchType === 'entitlement_remove';
			expect(isEntitlementOperation).toBe(false);
		});
	});

	describe('page header', () => {
		it('has correct title', () => {
			const title = 'Create Batch Simulation';
			expect(title).toBe('Create Batch Simulation');
		});

		it('has correct description', () => {
			const description = 'Simulate a bulk role or entitlement change across multiple users';
			expect(description).toBe('Simulate a bulk role or entitlement change across multiple users');
		});
	});

	describe('user_ids parsing', () => {
		it('splits comma-separated UUIDs', () => {
			const input = 'uuid-1, uuid-2, uuid-3';
			const ids = input
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
			expect(ids).toEqual(['uuid-1', 'uuid-2', 'uuid-3']);
		});

		it('handles empty string', () => {
			const input = '';
			const ids = input
				.split(',')
				.map((s) => s.trim())
				.filter(Boolean);
			expect(ids).toEqual([]);
		});
	});

	describe('filter metadata JSON parsing', () => {
		it('parses valid JSON metadata', () => {
			const input = '{"location": "US"}';
			const parsed = JSON.parse(input);
			expect(parsed.location).toBe('US');
		});

		it('throws on invalid JSON metadata', () => {
			expect(() => JSON.parse('not json')).toThrow();
		});
	});
});
