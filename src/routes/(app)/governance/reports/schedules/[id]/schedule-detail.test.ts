import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-reporting', () => ({
	getSchedule: vi.fn(),
	updateSchedule: vi.fn(),
	deleteSchedule: vi.fn(),
	pauseSchedule: vi.fn(),
	resumeSchedule: vi.fn()
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

import { load, actions } from './+page.server';
import {
	getSchedule,
	updateSchedule,
	deleteSchedule,
	pauseSchedule,
	resumeSchedule
} from '$lib/api/governance-reporting';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { ReportSchedule } from '$lib/api/types';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeSchedule(overrides: Partial<ReportSchedule> = {}): ReportSchedule {
	return {
		id: 'sch-1',
		tenant_id: 'tid',
		template_id: 'tpl-1',
		name: 'Weekly Access Report',
		frequency: 'weekly',
		schedule_hour: 8,
		schedule_day_of_week: 1,
		schedule_day_of_month: null,
		parameters: {},
		recipients: ['admin@example.com', 'reviewer@example.com'],
		output_format: 'json',
		status: 'active',
		last_run_at: '2026-01-07T08:00:00Z',
		next_run_at: '2026-01-14T08:00:00Z',
		consecutive_failures: 0,
		last_error: null,
		created_by: 'user-1',
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-07T08:00:00Z',
		...overrides
	};
}

function makeFormData(data: Record<string, string>): Request {
	const formData = new URLSearchParams();
	for (const [k, v] of Object.entries(data)) {
		formData.set(k, v);
	}
	return new Request('http://localhost/governance/reports/schedules/sch-1', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Schedule Detail +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	// --- Load function ---

	describe('load', () => {
		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					params: { id: 'sch-1' },
					locals: mockLocals(false),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('throws 401 when not authenticated', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			try {
				await load({
					params: { id: 'sch-1' },
					locals: { accessToken: null, tenantId: null, user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('returns schedule and editForm for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const schedule = makeSchedule();
			vi.mocked(getSchedule).mockResolvedValue(schedule);

			const result: any = await load({
				params: { id: 'sch-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.schedule).toEqual(schedule);
			expect(result.editForm).toBeDefined();
		});

		it('pre-populates editForm with schedule data', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const schedule = makeSchedule({
				name: 'Monthly SoD',
				frequency: 'monthly',
				schedule_hour: 6,
				schedule_day_of_month: 15,
				schedule_day_of_week: null,
				recipients: ['admin@test.com', 'bob@test.com'],
				output_format: 'csv'
			});
			vi.mocked(getSchedule).mockResolvedValue(schedule);

			const result: any = await load({
				params: { id: 'sch-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.editForm.data.name).toBe('Monthly SoD');
			expect(result.editForm.data.frequency).toBe('monthly');
			expect(result.editForm.data.schedule_hour).toBe(6);
			expect(result.editForm.data.schedule_day_of_month).toBe(15);
			expect(result.editForm.data.recipients).toBe('admin@test.com, bob@test.com');
			expect(result.editForm.data.output_format).toBe('csv');
		});

		it('joins recipients with comma-space separator', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const schedule = makeSchedule({
				recipients: ['a@test.com', 'b@test.com', 'c@test.com']
			});
			vi.mocked(getSchedule).mockResolvedValue(schedule);

			const result: any = await load({
				params: { id: 'sch-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.editForm.data.recipients).toBe('a@test.com, b@test.com, c@test.com');
		});

		it('throws API error status when getSchedule fails', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getSchedule).mockRejectedValue(new ApiError('Schedule not found', 404));

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

		it('rethrows non-API errors', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getSchedule).mockRejectedValue(new Error('timeout'));

			await expect(
				load({
					params: { id: 'sch-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow('timeout');
		});

		it('calls getSchedule with correct params', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getSchedule).mockResolvedValue(makeSchedule());

			await load({
				params: { id: 'sch-99' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(getSchedule).toHaveBeenCalledWith('sch-99', 'tok', 'tid', expect.any(Function));
		});
	});

	// --- Edit action ---

	describe('edit action', () => {
		it('exports edit action', () => {
			expect(actions.edit).toBeDefined();
		});

		it('throws 401 when not authenticated', async () => {
			try {
				await actions.edit({
					params: { id: 'sch-1' },
					request: makeFormData({ name: 'Updated' }),
					locals: { accessToken: null, tenantId: null },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('calls updateSchedule and redirects on success', async () => {
			vi.mocked(updateSchedule).mockResolvedValue(makeSchedule());
			try {
				await actions.edit({
					params: { id: 'sch-1' },
					request: makeFormData({
						name: 'Updated Schedule',
						frequency: 'daily',
						schedule_hour: '10',
						recipients: 'new@example.com',
						output_format: 'csv'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/governance/reports/schedules/sch-1');
			}
		});

		it('parses recipients from comma-separated string', async () => {
			vi.mocked(updateSchedule).mockResolvedValue(makeSchedule());
			try {
				await actions.edit({
					params: { id: 'sch-1' },
					request: makeFormData({
						name: 'Updated',
						recipients: 'a@test.com, b@test.com'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
			} catch {
				// redirect
			}
			expect(updateSchedule).toHaveBeenCalledWith(
				'sch-1',
				expect.objectContaining({
					recipients: ['a@test.com', 'b@test.com']
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns API error message on failure', async () => {
			vi.mocked(updateSchedule).mockRejectedValue(new ApiError('Invalid schedule', 422));
			const result: any = await actions.edit({
				params: { id: 'sch-1' },
				request: makeFormData({ name: 'Updated' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(422);
		});

		it('rethrows non-API errors', async () => {
			vi.mocked(updateSchedule).mockRejectedValue(new Error('boom'));
			await expect(
				actions.edit({
					params: { id: 'sch-1' },
					request: makeFormData({ name: 'Updated' }),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow('boom');
		});
	});

	// --- Pause action ---

	describe('pause action', () => {
		it('exports pause action', () => {
			expect(actions.pause).toBeDefined();
		});

		it('throws 401 when not authenticated', async () => {
			try {
				await actions.pause({
					params: { id: 'sch-1' },
					locals: { accessToken: null, tenantId: null },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('calls pauseSchedule and redirects back to detail', async () => {
			vi.mocked(pauseSchedule).mockResolvedValue(makeSchedule({ status: 'paused' }));
			try {
				await actions.pause({
					params: { id: 'sch-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/governance/reports/schedules/sch-1');
			}
			expect(pauseSchedule).toHaveBeenCalledWith('sch-1', 'tok', 'tid', expect.any(Function));
		});

		it('throws API error on pause failure', async () => {
			vi.mocked(pauseSchedule).mockRejectedValue(new ApiError('Already paused', 409));
			try {
				await actions.pause({
					params: { id: 'sch-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(409);
			}
		});

		it('rethrows non-API errors', async () => {
			vi.mocked(pauseSchedule).mockRejectedValue(new Error('network'));
			await expect(
				actions.pause({
					params: { id: 'sch-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow('network');
		});
	});

	// --- Resume action ---

	describe('resume action', () => {
		it('exports resume action', () => {
			expect(actions.resume).toBeDefined();
		});

		it('throws 401 when not authenticated', async () => {
			try {
				await actions.resume({
					params: { id: 'sch-1' },
					locals: { accessToken: null, tenantId: null },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('calls resumeSchedule and redirects back to detail', async () => {
			vi.mocked(resumeSchedule).mockResolvedValue(makeSchedule({ status: 'active' }));
			try {
				await actions.resume({
					params: { id: 'sch-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/governance/reports/schedules/sch-1');
			}
			expect(resumeSchedule).toHaveBeenCalledWith('sch-1', 'tok', 'tid', expect.any(Function));
		});

		it('throws API error on resume failure', async () => {
			vi.mocked(resumeSchedule).mockRejectedValue(new ApiError('Already active', 409));
			try {
				await actions.resume({
					params: { id: 'sch-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(409);
			}
		});

		it('rethrows non-API errors', async () => {
			vi.mocked(resumeSchedule).mockRejectedValue(new Error('failed'));
			await expect(
				actions.resume({
					params: { id: 'sch-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow('failed');
		});
	});

	// --- Delete action ---

	describe('delete action', () => {
		it('exports delete action', () => {
			expect(actions.delete).toBeDefined();
		});

		it('throws 401 when not authenticated', async () => {
			try {
				await actions.delete({
					params: { id: 'sch-1' },
					locals: { accessToken: null, tenantId: null },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('calls deleteSchedule and redirects to reports list', async () => {
			vi.mocked(deleteSchedule).mockResolvedValue(undefined);
			try {
				await actions.delete({
					params: { id: 'sch-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/governance/reports');
			}
			expect(deleteSchedule).toHaveBeenCalledWith('sch-1', 'tok', 'tid', expect.any(Function));
		});

		it('throws API error on delete failure', async () => {
			vi.mocked(deleteSchedule).mockRejectedValue(new ApiError('Forbidden', 403));
			try {
				await actions.delete({
					params: { id: 'sch-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(403);
			}
		});

		it('rethrows non-API errors', async () => {
			vi.mocked(deleteSchedule).mockRejectedValue(new Error('db error'));
			await expect(
				actions.delete({
					params: { id: 'sch-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow('db error');
		});
	});
});
