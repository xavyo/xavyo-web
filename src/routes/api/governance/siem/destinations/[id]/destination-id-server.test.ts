import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/siem', () => ({
	getSiemDestination: vi.fn(),
	updateSiemDestination: vi.fn(),
	deleteSiemDestination: vi.fn()
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

import { GET, PUT, DELETE } from './+server';
import { getSiemDestination, updateSiemDestination, deleteSiemDestination } from '$lib/api/siem';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'd1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/siem/destinations/d1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/siem/destinations/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(getSiemDestination).mockResolvedValue({ id: 'd1' } as any);
		const response = await GET({
			params: { id: 'd1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(getSiemDestination).toHaveBeenCalledWith('d1', TOKEN, TENANT, expect.any(Function));
	});
});

describe('PUT /api/governance/siem/destinations/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a destination with known fields', async () => {
		vi.mocked(updateSiemDestination).mockResolvedValue({ id: 'd1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'n', enabled: false })) as any);
		expect(response.status).toBe(200);
		expect(updateSiemDestination).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		const response = await PUT(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(updateSiemDestination).not.toHaveBeenCalled();
	});

	it('accepts numeric-string endpoint_port', async () => {
		vi.mocked(updateSiemDestination).mockResolvedValue({ id: 'd1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ endpoint_port: '514' })) as any);
		expect(response.status).toBe(200);
		expect(updateSiemDestination).toHaveBeenCalledWith(
			'd1',
			expect.objectContaining({ endpoint_port: 514 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN endpoint_port instead of forwarding it', async () => {
		const response = await PUT(makeEvent(JSON.stringify({ endpoint_port: Number.NaN })) as any);
		expect(response.status).toBe(400);
		expect(updateSiemDestination).not.toHaveBeenCalled();
	});

	it('does not update when enabled is not a boolean', async () => {
		const response = await PUT(makeEvent(JSON.stringify({ enabled: 'yes' })) as any);
		expect(response.status).toBe(400);
		expect(updateSiemDestination).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(updateSiemDestination).mockResolvedValue({ id: 'd1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'n', enabled: false })) as any);
		expect(response.status).toBe(200);
		expect(updateSiemDestination).toHaveBeenCalled();
	});

	it('forwards advertised destination config fields', async () => {
		vi.mocked(updateSiemDestination).mockResolvedValue({ id: 'd1' } as any);
		const response = await PUT(
			makeEvent(
				JSON.stringify({
					auth_config_b64: 'YWI=',
					rate_limit_per_second: 250,
					queue_buffer_size: 5000,
					circuit_breaker_threshold: 7,
					circuit_breaker_cooldown_secs: 90,
					splunk_source: 'xavyo',
					splunk_sourcetype: '_json',
					splunk_index: 'main',
					splunk_ack_enabled: true,
					syslog_facility: 14,
					tls_verify_cert: false
				})
			) as any
		);
		expect(response.status).toBe(200);
		expect(updateSiemDestination).toHaveBeenCalledWith(
			'd1',
			expect.objectContaining({
				auth_config_b64: 'YWI=',
				rate_limit_per_second: 250,
				queue_buffer_size: 5000,
				circuit_breaker_threshold: 7,
				circuit_breaker_cooldown_secs: 90,
				splunk_source: 'xavyo',
				splunk_sourcetype: '_json',
				splunk_index: 'main',
				splunk_ack_enabled: true,
				syslog_facility: 14,
				tls_verify_cert: false
			}),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects invalid syslog_facility instead of dropping it', async () => {
		const response = await PUT(makeEvent(JSON.stringify({ syslog_facility: 24 })) as any);
		expect(response.status).toBe(400);
		expect(updateSiemDestination).not.toHaveBeenCalled();
	});
});

describe('DELETE /api/governance/siem/destinations/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(deleteSiemDestination).mockResolvedValue(undefined as any);
		const response = await DELETE({
			params: { id: 'd1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(204);
		expect(deleteSiemDestination).toHaveBeenCalledWith('d1', TOKEN, TENANT, expect.any(Function));
	});
});
