import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn().mockReturnValue(true)
}));

vi.mock('$lib/api/governance-reporting', () => ({
	getSchedule: vi.fn(),
	updateSchedule: vi.fn(),
	deleteSchedule: vi.fn()
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

import { GET, PUT } from './+server';
import { getSchedule, updateSchedule } from '$lib/api/governance-reporting';
import { hasAdminRole } from '$lib/server/auth';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 's1' },
		locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['admin'] } },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/governance/reports/schedules/s1', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('GET /api/governance/reports/schedules/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(false);
	});

	it('does not 403 a non-admin JWT user', async () => {
		vi.mocked(getSchedule).mockResolvedValue({ id: 's1' } as any);
		const response = await GET({
			params: { id: 's1' },
			locals: { accessToken: TOKEN, tenantId: TENANT, user: { roles: ['user'] } },
			fetch: vi.fn()
		} as any);
		expect(response.status).toBe(200);
		expect(getSchedule).toHaveBeenCalledWith('s1', TOKEN, TENANT, expect.any(Function));
	});
});

describe('PUT /api/governance/reports/schedules/:id', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('updates a schedule with known fields', async () => {
		vi.mocked(updateSchedule).mockResolvedValue({ id: 's1' } as any);
		const response = await PUT(makeEvent(JSON.stringify({ name: 'Weekly' })) as any);
		expect(response.status).toBe(200);
		expect(updateSchedule).toHaveBeenCalled();
	});

	it('does not update on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(updateSchedule).not.toHaveBeenCalled();
	});

	it('does not update when frequency is invalid', async () => {
		await expect(
			PUT(makeEvent(JSON.stringify({ frequency: 'hourly' })) as any)
		).rejects.toMatchObject({ status: 400 });
		expect(updateSchedule).not.toHaveBeenCalled();
	});
});
