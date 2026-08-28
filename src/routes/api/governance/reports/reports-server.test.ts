import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/governance-reporting', () => ({
	listReports: vi.fn(),
	generateReport: vi.fn()
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
import { generateReport, listReports } from '$lib/api/governance-reporting';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/reports', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/reports', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(listReports).mockResolvedValue({ items: [], total: 0 } as any);
		const response = await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/reports')
		} as any);
		expect(response.status).toBe(200);
		expect(listReports).toHaveBeenCalled();
	});

	it('does not forward NaN pagination', async () => {
		vi.mocked(listReports).mockResolvedValue({ items: [], total: 0 } as any);
		await GET({
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
			fetch: vi.fn(),
			url: new URL('http://localhost/api/governance/reports?limit=abc&offset=nope')
		} as any);
		expect(listReports).toHaveBeenCalledWith(
			{
				template_id: undefined,
				status: undefined,
				from_date: undefined,
				to_date: undefined,
				limit: undefined,
				offset: undefined
			},
			TOKEN,
			TENANT,
			expect.any(Function)
		);
	});
});

describe('POST /api/governance/reports', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('generates a report with required fields', async () => {
		vi.mocked(generateReport).mockResolvedValue({ id: 'r1' } as any);
		const response = await POST(
			makeEvent(JSON.stringify({ template_id: 't1', output_format: 'json' })) as any
		);
		expect(response.status).toBe(201);
		expect(generateReport).toHaveBeenCalled();
	});

	it('does not generate on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(generateReport).not.toHaveBeenCalled();
	});

	it('does not generate when output_format is invalid', async () => {
		await expect(
			POST(makeEvent(JSON.stringify({ template_id: 't1', output_format: 'pdf' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(generateReport).not.toHaveBeenCalled();
	});
});
