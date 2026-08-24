import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/federation', () => ({
	getServiceProvider: vi.fn(),
	updateServiceProvider: vi.fn(),
	deleteServiceProvider: vi.fn()
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

vi.mock('sveltekit-superforms/adapters', () => ({
	zod: vi.fn((schema: unknown) => schema)
}));

vi.mock('sveltekit-superforms', () => ({
	superValidate: vi.fn().mockResolvedValue({ valid: true, data: {} }),
	message: vi.fn()
}));

vi.mock('$lib/schemas/federation', () => ({
	updateServiceProviderSchema: {}
}));

import { load } from './+page.server';
import { getServiceProvider } from '$lib/api/federation';
import { hasAdminRole } from '$lib/server/auth';

const mockLocals = () => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: ['admin'] }
});

function makeSp() {
	return {
		id: 'sp-1',
		name: 'Acme SP',
		entity_id: 'https://acme.example/saml',
		acs_urls: ['https://acme.example/acs'],
		certificate: null,
		attribute_mapping: null,
		name_id_format: null,
		sign_assertions: true,
		validate_signatures: true,
		assertion_validity_seconds: 300,
		metadata_url: null,
		slo_url: null,
		slo_binding: null,
		enabled: true
	};
}

describe('SAML SP detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
		vi.mocked(getServiceProvider).mockResolvedValue(makeSp() as any);
	});

	it('returns IdP info when the BFF succeeds', async () => {
		const idpInfo = { entity_id: 'https://idp.example', sso_url: 'https://idp.example/sso' };
		const fetchFn = vi.fn().mockResolvedValue({
			ok: true,
			status: 200,
			json: async () => idpInfo
		});

		const result = (await load({
			params: { id: 'sp-1' },
			locals: mockLocals(),
			fetch: fetchFn
		} as any)) as any;

		expect(result.idpInfo).toEqual(idpInfo);
	});

	it('returns null IdP info on 404', async () => {
		const fetchFn = vi.fn().mockResolvedValue({
			ok: false,
			status: 404,
			json: async () => ({})
		});

		const result = (await load({
			params: { id: 'sp-1' },
			locals: mockLocals(),
			fetch: fetchFn
		} as any)) as any;

		expect(result.idpInfo).toBeNull();
	});

	it('fails closed when IdP info returns 500', async () => {
		const fetchFn = vi.fn().mockResolvedValue({
			ok: false,
			status: 500,
			json: async () => ({})
		});

		try {
			await load({
				params: { id: 'sp-1' },
				locals: mockLocals(),
				fetch: fetchFn
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});
});
