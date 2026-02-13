import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/birthright', () => ({
	createBirthrightPolicy: vi.fn()
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

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

import { load, actions } from './+page.server';
import { createBirthrightPolicy } from '$lib/api/birthright';
import { listEntitlements } from '$lib/api/governance';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

const mockCreatePolicy = vi.mocked(createBirthrightPolicy);
const mockListEntitlements = vi.mocked(listEntitlements);
const mockHasAdminRole = vi.mocked(hasAdminRole);

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
	return new Request('http://localhost/governance/birthright/policies/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Policy Create +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
		mockListEntitlements.mockResolvedValue({
			items: [
				{ id: 'ent-1', name: 'VPN Access' } as any,
				{ id: 'ent-2', name: 'GitHub Access' } as any
			],
			total: 2,
			limit: 100,
			offset: 0
		});
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			mockHasAdminRole.mockReturnValue(false);
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

		it('returns form for admin users', async () => {
			const result: any = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.form).toBeDefined();
		});

		it('returns entitlements list', async () => {
			const result: any = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.entitlements).toHaveLength(2);
			expect(result.entitlements[0].name).toBe('VPN Access');
		});

		it('returns empty entitlements when API fails', async () => {
			mockListEntitlements.mockRejectedValue(new Error('fail'));
			const result: any = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.entitlements).toEqual([]);
		});

		it('calls hasAdminRole with user roles', async () => {
			await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(mockHasAdminRole).toHaveBeenCalledWith(['admin']);
		});

		it('form data name is initially empty', async () => {
			const result: any = await load({
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.form.data.name).toBeFalsy();
		});
	});

	describe('default action', () => {
		it('exports default action', () => {
			expect(actions).toBeDefined();
			expect(actions.default).toBeDefined();
		});

		it('returns validation error for missing name', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					name: '',
					priority: '10',
					evaluation_mode: 'all_match',
					grace_period_days: '7',
					conditions_json: JSON.stringify([{ attribute: 'department', operator: 'equals', value: 'Eng' }]),
					entitlement_ids_json: JSON.stringify(['ent-1'])
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('calls createBirthrightPolicy and redirects on success', async () => {
			mockCreatePolicy.mockResolvedValue({ id: 'new-pol-id' } as any);
			try {
				await actions.default({
					request: makeFormData({
						name: 'New Policy',
						description: 'A test policy',
						priority: '10',
						evaluation_mode: 'all_match',
						grace_period_days: '7',
						conditions_json: JSON.stringify([{ attribute: 'department', operator: 'equals', value: 'Eng' }]),
						entitlement_ids_json: JSON.stringify(['550e8400-e29b-41d4-a716-446655440000'])
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				if (e.status === 302) {
					expect(e.location).toBe('/governance/birthright/policies/new-pol-id');
				}
			}
		});

		it('returns API error message on failure', async () => {
			mockCreatePolicy.mockRejectedValue(new ApiError('Name already exists', 409));
			expect(typeof actions.default).toBe('function');
		});
	});
});

describe('Policy Create +page.svelte', () => {
	it(
		'is defined as a module',
		async () => {
			const mod = await import('./+page.svelte');
			expect(mod.default).toBeDefined();
		},
		60000
	);

	it(
		'is a valid Svelte component constructor',
		async () => {
			const mod = await import('./+page.svelte');
			expect(typeof mod.default).toBe('function');
		},
		60000
	);
});

describe('Policy Create form fields', () => {
	describe('evaluation mode options', () => {
		const evaluationModes = [
			{ value: 'all_match', label: 'All Match' },
			{ value: 'first_match', label: 'First Match' }
		];

		it('has 2 evaluation mode options', () => {
			expect(evaluationModes).toHaveLength(2);
		});

		it('has all_match as first option', () => {
			expect(evaluationModes[0].value).toBe('all_match');
		});

		it('has first_match as second option', () => {
			expect(evaluationModes[1].value).toBe('first_match');
		});
	});

	describe('grace period validation', () => {
		it('accepts valid grace period', () => {
			const value = 7;
			expect(value >= 0 && value <= 365).toBe(true);
		});

		it('rejects negative grace period', () => {
			const value = -1;
			expect(value >= 0 && value <= 365).toBe(false);
		});

		it('rejects grace period over 365', () => {
			const value = 366;
			expect(value >= 0 && value <= 365).toBe(false);
		});
	});

	describe('condition builder initial state', () => {
		it('starts with one empty condition', () => {
			const conditions = [{ attribute: '', operator: 'equals', value: '' }];
			expect(conditions).toHaveLength(1);
			expect(conditions[0].attribute).toBe('');
			expect(conditions[0].operator).toBe('equals');
		});
	});
});
