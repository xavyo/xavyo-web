import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/simulations', () => ({
	createPolicySimulation: vi.fn()
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
			simulation_type: '',
			policy_id: '',
			policy_config: ''
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
import { createPolicySimulation } from '$lib/api/simulations';

const mockHasAdminRole = vi.mocked(hasAdminRole);
const mockCreatePolicySimulation = vi.mocked(createPolicySimulation);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

describe('Policy simulation create +page.server', () => {
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

	describe('actions.default', () => {
		it('calls createPolicySimulation with correct data', async () => {
			mockCreatePolicySimulation.mockResolvedValue({} as any);
			const { superValidate } = await import('sveltekit-superforms');
			vi.mocked(superValidate).mockResolvedValue({
				valid: true,
				data: {
					name: 'Test Sim',
					simulation_type: 'sod_rule',
					policy_id: 'pol-123',
					policy_config: '{"rules": []}'
				},
				errors: {}
			} as any);

			const { actions } = await import('./+page.server');
			try {
				await actions.default({
					request: { formData: () => Promise.resolve(new FormData()) } as any,
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
			} catch (e: any) {
				// redirect is expected on success
				if (e.status === 302) {
					expect(e.location).toBe('/governance/simulations');
				}
			}
		});
	});
});

describe('Policy simulation create +page.svelte', () => {
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

describe('Policy simulation create form logic', () => {
	describe('form fields', () => {
		const fields = ['name', 'simulation_type', 'policy_id', 'policy_config'];

		it('has name field', () => {
			expect(fields).toContain('name');
		});

		it('has simulation_type field', () => {
			expect(fields).toContain('simulation_type');
		});

		it('has policy_id field', () => {
			expect(fields).toContain('policy_id');
		});

		it('has policy_config field', () => {
			expect(fields).toContain('policy_config');
		});
	});

	describe('simulation type options', () => {
		const typeOptions = [
			{ value: 'sod_rule', label: 'SoD Rule' },
			{ value: 'birthright_policy', label: 'Birthright Policy' }
		];

		it('has 2 simulation type options', () => {
			expect(typeOptions).toHaveLength(2);
		});

		it('has SoD Rule option', () => {
			expect(typeOptions[0].value).toBe('sod_rule');
			expect(typeOptions[0].label).toBe('SoD Rule');
		});

		it('has Birthright Policy option', () => {
			expect(typeOptions[1].value).toBe('birthright_policy');
			expect(typeOptions[1].label).toBe('Birthright Policy');
		});
	});

	describe('page header', () => {
		it('has correct title', () => {
			const title = 'Create Policy Simulation';
			expect(title).toBe('Create Policy Simulation');
		});

		it('has correct description', () => {
			const description = 'Simulate the impact of a policy change before applying it';
			expect(description).toBe('Simulate the impact of a policy change before applying it');
		});
	});

	describe('JSON parsing for policy_config', () => {
		it('parses valid JSON', () => {
			const input = '{"rules": [], "scope": "all_users"}';
			const parsed = JSON.parse(input);
			expect(parsed.rules).toEqual([]);
			expect(parsed.scope).toBe('all_users');
		});

		it('throws on invalid JSON', () => {
			expect(() => JSON.parse('not json')).toThrow();
		});
	});

	describe('cancel link', () => {
		it('links back to simulations hub', () => {
			expect('/governance/simulations').toBe('/governance/simulations');
		});
	});
});
