import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/siem', () => ({
	listSiemDestinations: vi.fn(),
	createSiemDestination: vi.fn()
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

import { GET, POST } from './+server';
import { createSiemDestination, listSiemDestinations } from '$lib/api/siem';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/siem/destinations', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/siem/destinations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(listSiemDestinations).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/siem/destinations')
		} as any);
		expect(response.status).toBe(200);
		expect(listSiemDestinations).toHaveBeenCalled();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listSiemDestinations).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/siem/destinations?limit=abc&offset=nope')
		} as any);
		expect(listSiemDestinations).toHaveBeenCalledWith({}, TOKEN, TENANT, expect.any(Function));
	});
});

describe('POST /api/governance/siem/destinations', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a destination with required fields', async () => {
		vi.mocked(createSiemDestination).mockResolvedValue({ id: 'd1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'splunk',
					destination_type: 'splunk_hec',
					endpoint_host: 'siem.example',
					export_format: 'json'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createSiemDestination).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(createSiemDestination).not.toHaveBeenCalled();
	});

	it('accepts numeric-string endpoint_port', async () => {
		vi.mocked(createSiemDestination).mockResolvedValue({ id: 'd1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'splunk',
					destination_type: 'splunk_hec',
					endpoint_host: 'siem.example',
					export_format: 'json',
					endpoint_port: '8088'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createSiemDestination).toHaveBeenCalledWith(
			expect.objectContaining({ endpoint_port: 8088 }),
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});

	it('rejects NaN endpoint_port instead of forwarding it', async () => {
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'splunk',
					destination_type: 'splunk_hec',
					endpoint_host: 'siem.example',
					export_format: 'json',
					endpoint_port: Number.NaN
				})
			) as any
		);
		expect(response.status).toBe(400);
		expect(createSiemDestination).not.toHaveBeenCalled();
	});

	it('does not create when name is missing', async () => {
		const response = await POST(
			makeEvent(
				JSON.stringify({
					destination_type: 'webhook',
					endpoint_host: 'siem.example',
					export_format: 'json'
				})
			) as any
		);
		expect(response.status).toBe(400);
		expect(createSiemDestination).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(createSiemDestination).mockResolvedValue({ id: 'd1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					name: 'splunk',
					destination_type: 'splunk_hec',
					endpoint_host: 'siem.example',
					export_format: 'json'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createSiemDestination).toHaveBeenCalled();
	});
});
