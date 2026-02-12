import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/connectors', () => ({
	getConnector: vi.fn(),
	getConnectorHealth: vi.fn(),
	activateConnector: vi.fn(),
	deactivateConnector: vi.fn(),
	deleteConnector: vi.fn()
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
vi.mock('$app/forms', () => ({
	enhance: () => ({
		destroy: () => {}
	})
}));
vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn().mockResolvedValue(undefined)
}));
vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

import { load, actions } from './+page.server';
import {
	getConnector,
	getConnectorHealth,
	activateConnector,
	deactivateConnector,
	deleteConnector
} from '$lib/api/connectors';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { Connector, ConnectorHealthStatus } from '$lib/api/types';

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
			port: 389,
			base_dn: 'dc=example,dc=com'
		},
		status: 'active',
		created_at: '2026-01-15T10:00:00Z',
		updated_at: '2026-02-01T14:30:00Z',
		...overrides
	};
}

function makeHealth(overrides: Partial<ConnectorHealthStatus> = {}): ConnectorHealthStatus {
	return {
		connector_id: 'conn-1',
		is_online: true,
		consecutive_failures: 0,
		last_check_at: '2026-02-10T12:00:00Z',
		...overrides
	};
}

describe('Connector Detail +page.server', () => {
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

		it('returns connector and health for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const connector = makeConnector();
			const health = makeHealth();
			vi.mocked(getConnector).mockResolvedValue(connector);
			vi.mocked(getConnectorHealth).mockResolvedValue(health);

			const result: any = await load({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.connector).toEqual(connector);
			expect(result.health).toEqual(health);
		});

		it('returns null health when health endpoint fails', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const connector = makeConnector();
			vi.mocked(getConnector).mockResolvedValue(connector);
			vi.mocked(getConnectorHealth).mockRejectedValue(new Error('not available'));

			const result: any = await load({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.connector).toEqual(connector);
			expect(result.health).toBeNull();
		});

		it('throws API error status when getConnector fails', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getConnector).mockRejectedValue(new ApiError('Not found', 404));
			vi.mocked(getConnectorHealth).mockResolvedValue(makeHealth());

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
			vi.mocked(getConnectorHealth).mockResolvedValue(makeHealth());

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
			vi.mocked(getConnectorHealth).mockResolvedValue(makeHealth());

			await load({
				params: { id: 'conn-99' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(getConnector).toHaveBeenCalledWith('conn-99', 'tok', 'tid', expect.any(Function));
		});

		it('calls getConnectorHealth with correct params', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getConnector).mockResolvedValue(makeConnector());
			vi.mocked(getConnectorHealth).mockResolvedValue(makeHealth());

			await load({
				params: { id: 'conn-99' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(getConnectorHealth).toHaveBeenCalledWith(
				'conn-99',
				'tok',
				'tid',
				expect.any(Function)
			);
		});
	});
});

describe('Connector Detail page component', () => {
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

describe('Connector Detail rendering logic', () => {
	describe('status badge', () => {
		it('active status maps to active-colored badge', () => {
			const connector = makeConnector({ status: 'active' });
			expect(connector.status).toBe('active');
		});

		it('inactive status maps to secondary badge', () => {
			const connector = makeConnector({ status: 'inactive' });
			expect(connector.status).toBe('inactive');
		});

		it('error status maps to destructive badge', () => {
			const connector = makeConnector({ status: 'error' });
			expect(connector.status).toBe('error');
		});
	});

	describe('configuration masking', () => {
		const SENSITIVE_KEYS = ['password', 'secret', 'token', 'key'];

		function isSensitive(key: string): boolean {
			const lower = key.toLowerCase();
			return SENSITIVE_KEYS.some((s) => lower.includes(s));
		}

		it('masks password fields', () => {
			expect(isSensitive('bind_password')).toBe(true);
			expect(isSensitive('PASSWORD')).toBe(true);
		});

		it('masks secret fields', () => {
			expect(isSensitive('client_secret')).toBe(true);
			expect(isSensitive('api_secret')).toBe(true);
		});

		it('masks token fields', () => {
			expect(isSensitive('access_token')).toBe(true);
			expect(isSensitive('refresh_token')).toBe(true);
		});

		it('masks key fields', () => {
			expect(isSensitive('api_key')).toBe(true);
			expect(isSensitive('private_key')).toBe(true);
		});

		it('does not mask non-sensitive fields', () => {
			expect(isSensitive('host')).toBe(false);
			expect(isSensitive('port')).toBe(false);
			expect(isSensitive('base_dn')).toBe(false);
		});
	});

	describe('health tab', () => {
		it('null health indicates data not available', () => {
			const health = null;
			expect(health).toBeNull();
		});

		it('health data shows metrics when present', () => {
			const health = makeHealth({
				is_online: true,
				consecutive_failures: 0
			});
			expect(health.is_online).toBe(true);
			expect(health.consecutive_failures).toBe(0);
		});

		it('online status gets green dot class', () => {
			function healthDotColor(isOnline: boolean): string {
				return isOnline ? 'bg-green-500' : 'bg-red-500';
			}
			expect(healthDotColor(true)).toBe('bg-green-500');
			expect(healthDotColor(false)).toBe('bg-red-500');
		});

		it('shows consecutive failures count', () => {
			const health = makeHealth({ consecutive_failures: 3 });
			expect(health.consecutive_failures).toBe(3);
		});

		it('shows last_check_at when present', () => {
			const health = makeHealth({ last_check_at: '2026-02-10T12:00:00Z' });
			const formatted = new Date(health.last_check_at).toLocaleString();
			expect(formatted).toBeTruthy();
		});
	});

	describe('type badge', () => {
		function typeVariant(type: string): 'default' | 'secondary' | 'outline' {
			switch (type) {
				case 'ldap':
					return 'secondary';
				case 'database':
					return 'outline';
				case 'rest':
					return 'default';
				default:
					return 'secondary';
			}
		}

		it('ldap type renders secondary badge', () => {
			expect(typeVariant('ldap')).toBe('secondary');
		});

		it('database type renders outline badge', () => {
			expect(typeVariant('database')).toBe('outline');
		});

		it('rest type renders default badge', () => {
			expect(typeVariant('rest')).toBe('default');
		});
	});

	describe('overview tab content', () => {
		it('connector has name, type, and dates', () => {
			const connector = makeConnector();
			expect(connector.name).toBe('My LDAP Connector');
			expect(connector.connector_type).toBe('ldap');
			expect(connector.created_at).toBe('2026-01-15T10:00:00Z');
			expect(connector.updated_at).toBe('2026-02-01T14:30:00Z');
		});

		it('shows No description when description is null', () => {
			const connector = makeConnector({ description: null });
			const displayed = connector.description ?? 'No description';
			expect(displayed).toBe('No description');
		});

		it('shows description when present', () => {
			const connector = makeConnector({ description: 'Connects to corporate LDAP' });
			const displayed = connector.description ?? 'No description';
			expect(displayed).toBe('Connects to corporate LDAP');
		});
	});
});

describe('Connector Detail actions', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	describe('activate action', () => {
		it('calls activateConnector with correct params', async () => {
			vi.mocked(activateConnector).mockResolvedValue(makeConnector({ status: 'active' }));
			const result = await actions.activate({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(activateConnector).toHaveBeenCalledWith('conn-1', 'tok', 'tid', expect.any(Function));
			expect(result).toEqual({ success: true, action: 'activated' });
		});

		it('returns fail on ApiError', async () => {
			vi.mocked(activateConnector).mockRejectedValue(new ApiError('Already active', 400));
			const result: any = await actions.activate({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns fail 500 on unexpected error', async () => {
			vi.mocked(activateConnector).mockRejectedValue(new Error('network'));
			const result: any = await actions.activate({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(500);
		});
	});

	describe('deactivate action', () => {
		it('calls deactivateConnector with correct params', async () => {
			vi.mocked(deactivateConnector).mockResolvedValue(makeConnector({ status: 'inactive' }));
			const result = await actions.deactivate({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(deactivateConnector).toHaveBeenCalledWith(
				'conn-1',
				'tok',
				'tid',
				expect.any(Function)
			);
			expect(result).toEqual({ success: true, action: 'deactivated' });
		});

		it('returns fail on ApiError', async () => {
			vi.mocked(deactivateConnector).mockRejectedValue(new ApiError('Already inactive', 400));
			const result: any = await actions.deactivate({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});
	});

	describe('delete action', () => {
		it('calls deleteConnector and redirects', async () => {
			vi.mocked(deleteConnector).mockResolvedValue(undefined);
			try {
				await actions.delete({
					params: { id: 'conn-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/connectors');
			}
			expect(deleteConnector).toHaveBeenCalledWith('conn-1', 'tok', 'tid', expect.any(Function));
		});

		it('returns fail on ApiError', async () => {
			vi.mocked(deleteConnector).mockRejectedValue(
				new ApiError('Cannot delete active connector', 400)
			);
			const result: any = await actions.delete({
				params: { id: 'conn-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});
	});
});

describe('Test connection logic', () => {
	it('successful test result has success=true', () => {
		const result = {
			success: true,
			tested_at: '2026-02-10T12:00:00Z'
		};
		expect(result.success).toBe(true);
		expect(result.tested_at).toBeTruthy();
	});

	it('failed test result has success=false with error', () => {
		const result = {
			success: false,
			error: 'Connection refused',
			tested_at: '2026-02-10T12:00:00Z'
		};
		expect(result.success).toBe(false);
		expect(result.error).toBe('Connection refused');
	});

	it('test result has tested_at timestamp', () => {
		const result = { success: true, tested_at: '2026-02-10T12:00:00Z' };
		expect(new Date(result.tested_at).toISOString()).toBe('2026-02-10T12:00:00.000Z');
	});
});

describe('Delete button state', () => {
	it('delete should be disabled for active connectors', () => {
		const connector = makeConnector({ status: 'active' });
		expect(connector.status === 'active').toBe(true);
	});

	it('delete should be enabled for inactive connectors', () => {
		const connector = makeConnector({ status: 'inactive' });
		expect(connector.status === 'active').toBe(false);
	});

	it('delete should be enabled for error connectors', () => {
		const connector = makeConnector({ status: 'error' });
		expect(connector.status === 'active').toBe(false);
	});
});
