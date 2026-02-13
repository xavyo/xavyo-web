import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-reporting', () => ({
	createSchedule: vi.fn()
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
import { createSchedule } from '$lib/api/governance-reporting';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeFormData(data: Record<string, string>): Request {
	const formData = new URLSearchParams();
	for (const [k, v] of Object.entries(data)) {
		formData.set(k, v);
	}
	return new Request('http://localhost/governance/reports/schedules/create', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Schedule Create +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	// --- Load function ---

	describe('load', () => {
		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					locals: mockLocals(false),
					url: new URL('http://localhost/governance/reports/schedules/create'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns form for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/reports/schedules/create'),
				fetch: vi.fn()
			} as any);
			expect(result.form).toBeDefined();
		});

		it('pre-populates template_id from URL query param', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/reports/schedules/create?template_id=tpl-42'),
				fetch: vi.fn()
			} as any);
			expect(result.form.data.template_id).toBe('tpl-42');
		});

		it('uses empty/falsy template_id when not in URL', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/reports/schedules/create'),
				fetch: vi.fn()
			} as any);
			// superValidate may coerce undefined to empty string
			expect(result.form.data.template_id).toBeFalsy();
		});

		it('defaults schedule_hour to 8', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/reports/schedules/create'),
				fetch: vi.fn()
			} as any);
			expect(result.form.data.schedule_hour).toBe(8);
		});

		it('defaults output_format to json', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/reports/schedules/create'),
				fetch: vi.fn()
			} as any);
			expect(result.form.data.output_format).toBe('json');
		});
	});

	// --- Action ---

	describe('default action', () => {
		it('exports default action', () => {
			expect(actions).toBeDefined();
			expect(actions.default).toBeDefined();
		});

		it('throws 401 when not authenticated', async () => {
			try {
				await actions.default({
					request: makeFormData({
						template_id: '550e8400-e29b-41d4-a716-446655440000',
						name: 'Weekly Report',
						frequency: 'daily',
						schedule_hour: '8',
						recipients: 'admin@example.com',
						output_format: 'json'
					}),
					locals: { accessToken: null, tenantId: null, user: null },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('returns validation error for missing name', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					template_id: '550e8400-e29b-41d4-a716-446655440000',
					name: '',
					frequency: 'daily',
					schedule_hour: '8',
					recipients: 'admin@example.com',
					output_format: 'json'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for missing template_id', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					template_id: '',
					name: 'Schedule',
					frequency: 'daily',
					schedule_hour: '8',
					recipients: 'admin@example.com',
					output_format: 'json'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for missing recipients', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					template_id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Schedule',
					frequency: 'daily',
					schedule_hour: '8',
					recipients: '',
					output_format: 'json'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for invalid frequency', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					template_id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Schedule',
					frequency: 'hourly',
					schedule_hour: '8',
					recipients: 'admin@example.com',
					output_format: 'json'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for invalid schedule_hour', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					template_id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Schedule',
					frequency: 'daily',
					schedule_hour: '25',
					recipients: 'admin@example.com',
					output_format: 'json'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('calls createSchedule with parsed recipients and redirects', async () => {
			vi.mocked(createSchedule).mockResolvedValue({} as any);
			try {
				await actions.default({
					request: makeFormData({
						template_id: '550e8400-e29b-41d4-a716-446655440000',
						name: 'Daily Report',
						frequency: 'daily',
						schedule_hour: '9',
						recipients: 'admin@example.com, reviewer@example.com',
						output_format: 'json'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/governance/reports');
			}
			expect(createSchedule).toHaveBeenCalledWith(
				expect.objectContaining({
					template_id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Daily Report',
					frequency: 'daily',
					schedule_hour: 9,
					recipients: ['admin@example.com', 'reviewer@example.com'],
					output_format: 'json'
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('filters empty strings from parsed recipients', async () => {
			vi.mocked(createSchedule).mockResolvedValue({} as any);
			try {
				await actions.default({
					request: makeFormData({
						template_id: '550e8400-e29b-41d4-a716-446655440000',
						name: 'Report',
						frequency: 'daily',
						schedule_hour: '8',
						recipients: 'admin@example.com, , reviewer@example.com, ',
						output_format: 'csv'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
			} catch {
				// redirect
			}
			expect(createSchedule).toHaveBeenCalledWith(
				expect.objectContaining({
					recipients: ['admin@example.com', 'reviewer@example.com']
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns API error message on failure', async () => {
			vi.mocked(createSchedule).mockRejectedValue(new ApiError('Invalid template', 422));
			const result: any = await actions.default({
				request: makeFormData({
					template_id: '550e8400-e29b-41d4-a716-446655440000',
					name: 'Report',
					frequency: 'daily',
					schedule_hour: '8',
					recipients: 'admin@example.com',
					output_format: 'json'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(422);
		});

		it('rethrows non-API errors', async () => {
			vi.mocked(createSchedule).mockRejectedValue(new Error('connection refused'));
			await expect(
				actions.default({
					request: makeFormData({
						template_id: '550e8400-e29b-41d4-a716-446655440000',
						name: 'Report',
						frequency: 'daily',
						schedule_hour: '8',
						recipients: 'admin@example.com',
						output_format: 'json'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow('connection refused');
		});
	});
});
