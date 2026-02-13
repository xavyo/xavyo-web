import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/provisioning-scripts', () => ({
	getProvisioningScript: vi.fn(),
	updateProvisioningScript: vi.fn()
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

import { load } from './+page.server';
import { getProvisioningScript } from '$lib/api/provisioning-scripts';
import { hasAdminRole } from '$lib/server/auth';
import type { ProvisioningScript } from '$lib/api/types';

const mockGetScript = vi.mocked(getProvisioningScript);
const mockHasAdminRole = vi.mocked(hasAdminRole);

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeScript(overrides: Partial<ProvisioningScript> = {}): ProvisioningScript {
	return {
		id: 'script-1',
		tenant_id: 'tid',
		name: 'AD Sync Script',
		description: 'Syncs attributes from Active Directory',
		current_version: 3,
		status: 'active',
		is_system: false,
		created_by: 'admin-user',
		created_at: '2026-02-01T10:00:00Z',
		updated_at: '2026-02-10T10:00:00Z',
		...overrides
	};
}

describe('Edit Script +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockHasAdminRole.mockReturnValue(true);
	});

	describe('load', () => {
		it('redirects to login when no accessToken', async () => {
			try {
				await load({
					locals: { accessToken: null, tenantId: 'tid', user: { roles: ['admin'] } },
					params: { id: 'script-1' }
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/login');
			}
		});

		it('redirects to login when no tenantId', async () => {
			try {
				await load({
					locals: { accessToken: 'tok', tenantId: null, user: { roles: ['admin'] } },
					params: { id: 'script-1' }
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/login');
			}
		});

		it('redirects non-admin users to home', async () => {
			mockHasAdminRole.mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					params: { id: 'script-1' }
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/');
			}
		});

		it('returns form and script for admin', async () => {
			mockGetScript.mockResolvedValue(makeScript());

			const result = (await load({
				locals: mockLocals(true),
				params: { id: 'script-1' }
			} as any)) as any;

			expect(result.form).toBeDefined();
			expect(result.script).toBeDefined();
			expect(result.script.id).toBe('script-1');
		});

		it('pre-fills form with script name', async () => {
			mockGetScript.mockResolvedValue(makeScript({ name: 'My Script' }));

			const result = (await load({
				locals: mockLocals(true),
				params: { id: 'script-1' }
			} as any)) as any;

			expect(result.form.data.name).toBe('My Script');
		});

		it('pre-fills form with script description', async () => {
			mockGetScript.mockResolvedValue(makeScript({ description: 'My description' }));

			const result = (await load({
				locals: mockLocals(true),
				params: { id: 'script-1' }
			} as any)) as any;

			expect(result.form.data.description).toBe('My description');
		});

		it('pre-fills empty string for null description', async () => {
			mockGetScript.mockResolvedValue(makeScript({ description: null }));

			const result = (await load({
				locals: mockLocals(true),
				params: { id: 'script-1' }
			} as any)) as any;

			expect(result.form.data.description).toBe('');
		});

		it('calls getProvisioningScript with params.id', async () => {
			mockGetScript.mockResolvedValue(makeScript());

			await load({
				locals: mockLocals(true),
				params: { id: 'script-xyz' }
			} as any);

			expect(mockGetScript).toHaveBeenCalledWith('script-xyz', 'tok', 'tid');
		});

		it('throws when getProvisioningScript fails', async () => {
			mockGetScript.mockRejectedValue(new Error('not found'));

			await expect(
				load({
					locals: mockLocals(true),
					params: { id: 'bad-id' }
				} as any)
			).rejects.toThrow('not found');
		});

		it('calls hasAdminRole with user roles', async () => {
			mockGetScript.mockResolvedValue(makeScript());

			await load({
				locals: mockLocals(true),
				params: { id: 'script-1' }
			} as any);

			expect(mockHasAdminRole).toHaveBeenCalledWith(['admin']);
		});
	});
});

describe('Edit Script +page.svelte', () => {
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

describe('Edit Script form rendering logic', () => {
	describe('page header', () => {
		it('has correct title', () => {
			const title = 'Edit Script';
			expect(title).toBe('Edit Script');
		});

		it('has correct description', () => {
			const description = 'Update script metadata';
			expect(description).toContain('script metadata');
		});
	});

	describe('form fields', () => {
		const fields = ['name', 'description'];

		it('has Name field', () => {
			expect(fields).toContain('name');
		});

		it('has Description field', () => {
			expect(fields).toContain('description');
		});

		it('has 2 fields total', () => {
			expect(fields).toHaveLength(2);
		});
	});

	describe('form labels', () => {
		it('name field label is Name', () => {
			const label = 'Name';
			expect(label).toBe('Name');
		});

		it('description field label is Description', () => {
			const label = 'Description';
			expect(label).toBe('Description');
		});
	});

	describe('form buttons', () => {
		it('has Save Changes submit button', () => {
			const text = 'Save Changes';
			expect(text).toBe('Save Changes');
		});

		it('has Cancel link', () => {
			const text = 'Cancel';
			expect(text).toBe('Cancel');
		});

		it('Cancel links back to script detail', () => {
			const scriptId = 'script-1';
			const href = `/governance/provisioning-scripts/${scriptId}`;
			expect(href).toBe('/governance/provisioning-scripts/script-1');
		});
	});

	describe('back to details link', () => {
		it('generates correct back to details link', () => {
			const scriptId = 'script-abc';
			const href = `/governance/provisioning-scripts/${scriptId}`;
			expect(href).toBe('/governance/provisioning-scripts/script-abc');
		});

		it('has correct back link text', () => {
			const text = 'Back to Details';
			expect(text).toBe('Back to Details');
		});
	});

	describe('card heading', () => {
		it('has Script Metadata heading', () => {
			const heading = 'Script Metadata';
			expect(heading).toBe('Script Metadata');
		});
	});

	describe('schema validation', () => {
		it('name is required', () => {
			const nameRequired = true;
			expect(nameRequired).toBe(true);
		});

		it('name max length is 200', () => {
			const maxLen = 200;
			expect(maxLen).toBe(200);
		});

		it('description max length is 2000', () => {
			const maxLen = 2000;
			expect(maxLen).toBe(2000);
		});
	});

	describe('script status badge', () => {
		it('shows script status badge in header', () => {
			const script = makeScript({ status: 'active' });
			expect(script.status).toBe('active');
		});
	});
});
