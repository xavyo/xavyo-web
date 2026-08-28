import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/governance-reporting', () => ({
	listSchedules: vi.fn(),
	createSchedule: vi.fn()
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

import { POST } from './+server';
import { createSchedule } from '$lib/api/governance-reporting';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/reports/schedules', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('POST /api/governance/reports/schedules', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('creates a schedule with required fields', async () => {
		vi.mocked(createSchedule).mockResolvedValue({ id: 's1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					template_id: 't1',
					name: 'Nightly',
					frequency: 'daily',
					schedule_hour: 2,
					recipients: ['ops@example.com'],
					output_format: 'csv'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createSchedule).toHaveBeenCalled();
	});

	it('does not create on invalid JSON', async () => {
		await expect(POST(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(createSchedule).not.toHaveBeenCalled();
	});

	it('does not create when recipients is missing', async () => {
		await expect(
			POST(
				makeEvent(
					JSON.stringify({
						template_id: 't1',
						name: 'Nightly',
						frequency: 'daily',
						schedule_hour: 2,
						output_format: 'csv'
					})
				) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(createSchedule).not.toHaveBeenCalled();
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(hasAdminRole).mockReturnValue(false);
		vi.mocked(createSchedule).mockResolvedValue({ id: 's1' } as any);
		const response = await POST(
			makeEvent(
				JSON.stringify({
					template_id: 't1',
					name: 'Nightly',
					frequency: 'daily',
					schedule_hour: 2,
					recipients: ['ops@example.com'],
					output_format: 'csv'
				})
			) as any
		);
		expect(response.status).toBe(201);
		expect(createSchedule).toHaveBeenCalled();
	});
});
