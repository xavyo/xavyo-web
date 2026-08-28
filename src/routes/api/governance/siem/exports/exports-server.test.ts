import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/siem', () => ({
	listSiemExports: vi.fn(),
	createSiemExport: vi.fn()
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
import { createSiemExport, listSiemExports } from '$lib/api/siem';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/siem/exports', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/siem/exports', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(listSiemExports).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/siem/exports')
		} as any);
		expect(response.status).toBe(200);
		expect(listSiemExports).toHaveBeenCalled();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listSiemExports).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/siem/exports?limit=abc&offset=nope')
		} as any);
		expect(listSiemExports).toHaveBeenCalledWith({}, TOKEN, TENANT, expect.any(Function));
	});
});

describe('POST /api/governance/siem/exports', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates an export with required fields', async () => {
		vi.mocked(createSiemExport).mockResolvedValue({ id: 'e1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					date_range_start: '2026-01-01',
					date_range_end: '2026-01-31',
					output_format: 'json'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createSiemExport).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		const response = await POST(makeEvent('{not json') as any);
		expect(response.status).toBe(400);
		expect(createSiemExport).not.toHaveBeenCalled();
	});

	it('does not create when output_format is missing', async () => {
		const response = await POST(
			makeEvent(JSON.stringify({ date_range_start: '2026-01-01', date_range_end: '2026-01-31' })) as any
		);
		expect(response.status).toBe(400);
		expect(createSiemExport).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(createSiemExport).mockResolvedValue({ id: 'e1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					date_range_start: '2026-01-01',
					date_range_end: '2026-01-31',
					output_format: 'json'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createSiemExport).toHaveBeenCalled();
	});
});
