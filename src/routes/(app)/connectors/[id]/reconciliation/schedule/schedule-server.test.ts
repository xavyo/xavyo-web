import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/reconciliation', () => ({
	getSchedule: vi.fn(),
	upsertSchedule: vi.fn(),
	deleteSchedule: vi.fn(),
	enableSchedule: vi.fn(),
	disableSchedule: vi.fn()
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

import { actions, load } from './+page.server';
import { getSchedule, upsertSchedule } from '$lib/api/reconciliation';
import { hasAdminRole } from '$lib/server/auth';
import { ApiError } from '$lib/api/client';

function makeFormData(data: Record<string, string>): Request {
	const formData = new URLSearchParams();
	for (const [k, v] of Object.entries(data)) {
		formData.set(k, v);
	}
	return new Request('http://localhost/connectors/conn-1/reconciliation/schedule', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

const mockLocals = () => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: ['admin'] }
});

describe('Reconciliation schedule +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	it('returns schedule when found', async () => {
		vi.mocked(getSchedule).mockResolvedValue({ id: 'sch-1', enabled: true } as any);

		const result = (await load({
			params: { id: 'conn-1' },
			locals: mockLocals(),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.schedule.id).toBe('sch-1');
	});

	it('returns null schedule on 404', async () => {
		vi.mocked(getSchedule).mockRejectedValue(new ApiError('Schedule not found', 404));

		const result = (await load({
			params: { id: 'conn-1' },
			locals: mockLocals(),
			fetch: vi.fn()
		} as any)) as any;

		expect(result.schedule).toBeNull();
	});

	it('fails closed on 500', async () => {
		vi.mocked(getSchedule).mockRejectedValue(new ApiError('boom', 500));

		try {
			await load({
				params: { id: 'conn-1' },
				locals: mockLocals(),
				fetch: vi.fn()
			} as any);
			expect.fail('should have thrown');
		} catch (e: any) {
			expect(e.status).toBe(500);
		}
	});

	it('saves finite schedule fields', async () => {
		vi.mocked(upsertSchedule).mockResolvedValue({} as any);
		const result: any = await actions.save({
			params: { id: 'conn-1' },
			request: makeFormData({
				mode: 'full',
				frequency: 'weekly',
				day_of_week: '1',
				hour_of_day: '9',
				enabled: 'on'
			}),
			locals: mockLocals(),
			fetch: vi.fn()
		} as any);
		expect(result.success).toBe(true);
		expect(upsertSchedule).toHaveBeenCalledWith(
			'conn-1',
			expect.objectContaining({
				day_of_week: 1,
				day_of_month: undefined,
				hour_of_day: 9,
				enabled: true
			}),
			'tok',
			'tid',
			expect.any(Function)
		);
	});

	it('rejects non-numeric day_of_week instead of posting NaN', async () => {
		const result: any = await actions.save({
			params: { id: 'conn-1' },
			request: makeFormData({
				mode: 'full',
				frequency: 'weekly',
				day_of_week: 'abc',
				hour_of_day: '9'
			}),
			locals: mockLocals(),
			fetch: vi.fn()
		} as any);
		expect(result.status).toBe(400);
		expect(upsertSchedule).not.toHaveBeenCalled();
	});

	it('rejects non-numeric day_of_month instead of posting NaN', async () => {
		const result: any = await actions.save({
			params: { id: 'conn-1' },
			request: makeFormData({
				mode: 'full',
				frequency: 'monthly',
				day_of_month: 'nope',
				hour_of_day: '9'
			}),
			locals: mockLocals(),
			fetch: vi.fn()
		} as any);
		expect(result.status).toBe(400);
		expect(upsertSchedule).not.toHaveBeenCalled();
	});

	it('rejects non-numeric hour_of_day instead of posting NaN', async () => {
		const result: any = await actions.save({
			params: { id: 'conn-1' },
			request: makeFormData({
				mode: 'full',
				frequency: 'daily',
				hour_of_day: 'abc'
			}),
			locals: mockLocals(),
			fetch: vi.fn()
		} as any);
		expect(result.status).toBe(400);
		expect(upsertSchedule).not.toHaveBeenCalled();
	});
});
