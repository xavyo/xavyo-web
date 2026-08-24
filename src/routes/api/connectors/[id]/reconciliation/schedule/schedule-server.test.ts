import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/reconciliation', () => ({
	getSchedule: vi.fn(),
	upsertSchedule: vi.fn(),
	deleteSchedule: vi.fn()
}));

import { PUT } from './+server';
import { upsertSchedule } from '$lib/api/reconciliation';

const TOKEN = 'tok';
const TENANT = 'tid';

function makeEvent(body: string) {
	return {
		params: { id: 'c1' },
		locals: { accessToken: TOKEN, tenantId: TENANT },
		fetch: vi.fn(),
		request: new Request('http://localhost/api/connectors/c1/reconciliation/schedule', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body
		})
	};
}

describe('PUT /api/connectors/:id/reconciliation/schedule', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('upserts a schedule with required fields', async () => {
		vi.mocked(upsertSchedule).mockResolvedValue({ id: 'sch1' } as any);
		const response = await PUT(
			makeEvent(
				JSON.stringify({
					mode: 'full',
					frequency: 'daily',
					hour_of_day: 2,
					enabled: true
				})
			) as any
		);
		expect(response.status).toBe(200);
		expect(upsertSchedule).toHaveBeenCalled();
	});

	it('does not upsert on invalid JSON', async () => {
		await expect(PUT(makeEvent('{not json') as any)).rejects.toMatchObject({ status: 400 });
		expect(upsertSchedule).not.toHaveBeenCalled();
	});

	it('does not upsert when enabled is missing', async () => {
		await expect(
			PUT(
				makeEvent(JSON.stringify({ mode: 'full', frequency: 'daily', hour_of_day: 2 })) as any
			)
		).rejects.toMatchObject({ status: 400 });
		expect(upsertSchedule).not.toHaveBeenCalled();
	});
});
