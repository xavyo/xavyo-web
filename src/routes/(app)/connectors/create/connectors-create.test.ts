import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/connectors', () => ({
	createConnector: vi.fn()
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
import { createConnector } from '$lib/api/connectors';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

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
	return new Request('http://localhost/connectors/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Connectors Create +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
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

		it('returns form for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true)
			} as any);
			expect(result.form).toBeDefined();
		});

		it('form data is initially empty', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true)
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
				request: makeFormData({ name: '', connector_type: 'ldap' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for invalid connector_type', async () => {
			const result: any = await actions.default({
				request: makeFormData({ name: 'My Connector', connector_type: 'invalid_type' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('calls createConnector with LDAP config and redirects on success', async () => {
			vi.mocked(createConnector).mockResolvedValue({ id: 'conn-123' } as any);
			try {
				await actions.default({
					request: makeFormData({
						name: 'Corp LDAP',
						connector_type: 'ldap',
						host: 'ldap.example.com',
						port: '636',
						bind_dn: 'cn=admin,dc=example,dc=com',
						bind_password: 'secret',
						base_dn: 'dc=example,dc=com',
						use_ssl: 'on'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/connectors/conn-123');
			}
			expect(createConnector).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'Corp LDAP',
					connector_type: 'ldap',
					config: expect.objectContaining({
						host: 'ldap.example.com',
						port: 636,
						base_dn: 'dc=example,dc=com',
						use_ssl: true
					}),
					credentials: expect.objectContaining({
						bind_dn: 'cn=admin,dc=example,dc=com',
						bind_password: 'secret'
					})
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('calls createConnector with database config and redirects on success', async () => {
			vi.mocked(createConnector).mockResolvedValue({ id: 'conn-456' } as any);
			try {
				await actions.default({
					request: makeFormData({
						name: 'User DB',
						connector_type: 'database',
						host: 'db.example.com',
						port: '5432',
						database: 'identity_db',
						username: 'db_user',
						password: 'db_pass',
						driver: 'postgres'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/connectors/conn-456');
			}
			expect(createConnector).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'User DB',
					connector_type: 'database',
					config: expect.objectContaining({
						host: 'db.example.com',
						port: 5432,
						database: 'identity_db',
						driver: 'postgres'
					}),
					credentials: expect.objectContaining({
						username: 'db_user',
						password: 'db_pass'
					})
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('calls createConnector with REST API config and redirects on success', async () => {
			vi.mocked(createConnector).mockResolvedValue({ id: 'conn-789' } as any);
			try {
				await actions.default({
					request: makeFormData({
						name: 'Users API',
						connector_type: 'rest',
						base_url: 'https://api.example.com/v1',
						auth_type: 'bearer',
						auth_config: '{"token": "abc123"}'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/connectors/conn-789');
			}
			expect(createConnector).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'Users API',
					connector_type: 'rest',
					config: expect.objectContaining({
						base_url: 'https://api.example.com/v1',
						auth_type: 'bearer'
					}),
					credentials: expect.objectContaining({
						auth_config: { token: 'abc123' }
					})
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns error for invalid JSON in auth_config', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					name: 'Bad API',
					connector_type: 'rest',
					base_url: 'https://api.example.com',
					auth_type: 'bearer',
					auth_config: 'not valid json'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns API error message on failure', async () => {
			vi.mocked(createConnector).mockRejectedValue(
				new ApiError('Connector already exists', 409)
			);
			const result: any = await actions.default({
				request: makeFormData({
					name: 'Dup Connector',
					connector_type: 'ldap',
					host: 'ldap.example.com',
					port: '636',
					bind_dn: 'cn=admin,dc=example,dc=com',
					bind_password: 'secret',
					base_dn: 'dc=example,dc=com'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(409);
		});

		it('rethrows non-API errors', async () => {
			vi.mocked(createConnector).mockRejectedValue(new Error('network error'));
			await expect(
				actions.default({
					request: makeFormData({
						name: 'Fail Connector',
						connector_type: 'ldap',
						host: 'ldap.example.com',
						port: '636',
						bind_dn: 'cn=admin,dc=example,dc=com',
						bind_password: 'secret',
						base_dn: 'dc=example,dc=com'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow('network error');
		});
	});
});

describe('Connectors Create +page.svelte', () => {
	it('page module exists', () => {
		// Verify the page server module exports are correct
		expect(typeof load).toBe('function');
		expect(typeof actions.default).toBe('function');
	});
});
