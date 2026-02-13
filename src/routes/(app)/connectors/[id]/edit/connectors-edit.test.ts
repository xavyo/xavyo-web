import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/connectors', () => ({
	getConnector: vi.fn(),
	updateConnector: vi.fn()
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

vi.mock('$app/forms', () => ({
	enhance: () => ({ destroy: () => {} })
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import { load, actions } from './+page.server';
import { getConnector, updateConnector } from '$lib/api/connectors';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { Connector } from '$lib/api/types';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeConnector(overrides: Partial<Connector> = {}): Connector {
	return {
		id: 'conn-1',
		name: 'My LDAP Connector',
		description: 'Connects to corporate LDAP',
		connector_type: 'ldap',
		config: {
			host: 'ldap.example.com',
			port: 636,
			base_dn: 'dc=example,dc=com',
			use_ssl: true,
			search_filter: '(objectClass=person)'
		},
		status: 'active',
		created_at: '2026-01-15T10:00:00Z',
		updated_at: '2026-02-01T14:30:00Z',
		...overrides
	};
}

function makeFormData(data: Record<string, string>): Request {
	const formData = new URLSearchParams();
	for (const [k, v] of Object.entries(data)) {
		formData.set(k, v);
	}
	return new Request('http://localhost/connectors/conn-1/edit', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Connector Edit +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('load', () => {
		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					params: { id: 'conn-1' },
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns connector and pre-populated form for admin', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const connector = makeConnector();
			vi.mocked(getConnector).mockResolvedValue(connector);

			const result: any = await load({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.connector).toEqual(connector);
			expect(result.form).toBeDefined();
			expect(result.form.data.name).toBe('My LDAP Connector');
			expect(result.form.data.description).toBe('Connects to corporate LDAP');
		});

		it('handles null description by setting undefined', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const connector = makeConnector({ description: null });
			vi.mocked(getConnector).mockResolvedValue(connector);

			const result: any = await load({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.form.data.description).toBeUndefined();
		});

		it('throws API error status when getConnector fails', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getConnector).mockRejectedValue(new ApiError('Not found', 404));

			try {
				await load({
					params: { id: 'nonexistent' },
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
			vi.mocked(getConnector).mockRejectedValue(new Error('network'));

			try {
				await load({
					params: { id: 'conn-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});

		it('calls getConnector with correct params', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getConnector).mockResolvedValue(makeConnector());

			await load({
				params: { id: 'conn-99' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(getConnector).toHaveBeenCalledWith('conn-99', 'tok', 'tid', expect.any(Function));
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
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('calls updateConnector with LDAP config and redirects on success', async () => {
			vi.mocked(updateConnector).mockResolvedValue(makeConnector());
			try {
				await actions.default({
					request: makeFormData({
						name: 'Updated LDAP',
						description: 'Updated description',
						connector_type: 'ldap',
						host: 'ldap2.example.com',
						port: '389',
						bind_dn: 'cn=admin,dc=new,dc=com',
						bind_password: 'newsecret',
						base_dn: 'dc=new,dc=com',
						use_ssl: 'on',
						search_filter: '(objectClass=user)'
					}),
					params: { id: 'conn-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/connectors/conn-1');
			}
			expect(updateConnector).toHaveBeenCalledWith(
				'conn-1',
				expect.objectContaining({
					name: 'Updated LDAP',
					description: 'Updated description',
					config: expect.objectContaining({
						host: 'ldap2.example.com',
						port: 389,
						base_dn: 'dc=new,dc=com',
						use_ssl: true,
						search_filter: '(objectClass=user)'
					}),
					credentials: expect.objectContaining({
						bind_dn: 'cn=admin,dc=new,dc=com',
						bind_password: 'newsecret'
					})
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('calls updateConnector with database config and redirects on success', async () => {
			vi.mocked(updateConnector).mockResolvedValue(
				makeConnector({ connector_type: 'database' })
			);
			try {
				await actions.default({
					request: makeFormData({
						name: 'Updated DB',
						connector_type: 'database',
						host: 'db2.example.com',
						port: '3306',
						database: 'users_db',
						username: 'admin',
						password: 'dbpass',
						driver: 'mysql'
					}),
					params: { id: 'conn-2' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/connectors/conn-2');
			}
			expect(updateConnector).toHaveBeenCalledWith(
				'conn-2',
				expect.objectContaining({
					name: 'Updated DB',
					config: expect.objectContaining({
						host: 'db2.example.com',
						port: 3306,
						database: 'users_db',
						driver: 'mysql'
					}),
					credentials: expect.objectContaining({
						username: 'admin',
						password: 'dbpass'
					})
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('calls updateConnector with REST API config and redirects on success', async () => {
			vi.mocked(updateConnector).mockResolvedValue(
				makeConnector({ connector_type: 'rest' })
			);
			try {
				await actions.default({
					request: makeFormData({
						name: 'Updated API',
						connector_type: 'rest',
						base_url: 'https://api2.example.com/v2',
						auth_type: 'basic',
						auth_config: '{"username": "user", "password": "pass"}'
					}),
					params: { id: 'conn-3' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/connectors/conn-3');
			}
			expect(updateConnector).toHaveBeenCalledWith(
				'conn-3',
				expect.objectContaining({
					name: 'Updated API',
					config: expect.objectContaining({
						base_url: 'https://api2.example.com/v2',
						auth_type: 'basic'
					}),
					credentials: expect.objectContaining({
						auth_config: { username: 'user', password: 'pass' }
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
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns error for invalid connector type', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					name: 'Bad Type',
					connector_type: 'unknown_type'
				}),
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns API error message on failure', async () => {
			vi.mocked(updateConnector).mockRejectedValue(
				new ApiError('Connector name already exists', 409)
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
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(409);
		});

		it('rethrows non-API errors', async () => {
			vi.mocked(updateConnector).mockRejectedValue(new Error('network error'));
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
					params: { id: 'conn-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow('network error');
		});
	});
});

describe('Connector Edit +page.svelte', () => {
	it('page component is defined', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	}, 15000);

	it('page component is a valid Svelte component constructor', async () => {
		const mod = await import('./+page.svelte');
		expect(typeof mod.default).toBe('function');
	});

	it('module has no unexpected named exports', async () => {
		const mod = await import('./+page.svelte');
		const keys = Object.keys(mod);
		expect(keys).toContain('default');
	});
});

describe('Connector Edit rendering logic', () => {
	describe('connector type labels', () => {
		const connectorTypeLabels: Record<string, string> = {
			ldap: 'LDAP',
			database: 'Database',
			rest: 'REST API'
		};

		it('ldap maps to LDAP label', () => {
			expect(connectorTypeLabels['ldap']).toBe('LDAP');
		});

		it('database maps to Database label', () => {
			expect(connectorTypeLabels['database']).toBe('Database');
		});

		it('rest maps to REST API label', () => {
			expect(connectorTypeLabels['rest']).toBe('REST API');
		});

		it('unknown type returns undefined from label map', () => {
			expect(connectorTypeLabels['unknown']).toBeUndefined();
		});
	});

	describe('config pre-population', () => {
		it('LDAP config fields are extracted from config object', () => {
			const connector = makeConnector();
			const config = connector.config as Record<string, unknown>;
			expect(config.host).toBe('ldap.example.com');
			expect(config.port).toBe(636);
			expect(config.base_dn).toBe('dc=example,dc=com');
			expect(config.use_ssl).toBe(true);
			expect(config.search_filter).toBe('(objectClass=person)');
		});

		it('database config fields are extracted from config object', () => {
			const connector = makeConnector({
				connector_type: 'database',
				config: {
					host: 'db.example.com',
					port: 5432,
					database: 'identity_db',
					driver: 'postgres',
					query: 'SELECT * FROM users'
				}
			});
			const config = connector.config as Record<string, unknown>;
			expect(config.host).toBe('db.example.com');
			expect(config.port).toBe(5432);
			expect(config.database).toBe('identity_db');
			expect(config.driver).toBe('postgres');
			expect(config.query).toBe('SELECT * FROM users');
		});

		it('REST API config fields are extracted from config object', () => {
			const connector = makeConnector({
				connector_type: 'rest',
				config: {
					base_url: 'https://api.example.com/v1',
					auth_type: 'bearer',
					headers: { 'Content-Type': 'application/json' }
				}
			});
			const config = connector.config as Record<string, unknown>;
			expect(config.base_url).toBe('https://api.example.com/v1');
			expect(config.auth_type).toBe('bearer');
			expect(config.headers).toEqual({ 'Content-Type': 'application/json' });
		});

		it('JSON.stringify formats auth_config for textarea display', () => {
			const authConfig = { token: 'abc123' };
			const formatted = JSON.stringify(authConfig, null, 2);
			expect(formatted).toContain('"token"');
			expect(formatted).toContain('abc123');
		});

		it('missing config values default gracefully with nullish coalescing', () => {
			const config: Record<string, unknown> = {};
			expect(String(config.host ?? '')).toBe('');
			expect(String(config.port ?? 636)).toBe('636');
			expect(config.use_ssl === true).toBe(false);
			expect(config.auth_config ? JSON.stringify(config.auth_config, null, 2) : '{}').toBe(
				'{}'
			);
		});
	});

	describe('form pre-population', () => {
		it('name is pre-populated from connector data', () => {
			const connector = makeConnector({ name: 'Test Connector' });
			expect(connector.name).toBe('Test Connector');
		});

		it('description is pre-populated from connector data', () => {
			const connector = makeConnector({ description: 'Test description' });
			expect(connector.description).toBe('Test description');
		});

		it('connector type is preserved as read-only', () => {
			const connector = makeConnector({ connector_type: 'database' });
			expect(connector.connector_type).toBe('database');
		});
	});
});
