import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-reporting', () => ({
	generateReport: vi.fn()
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
import { generateReport } from '$lib/api/governance-reporting';
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
	return new Request('http://localhost/governance/reports/generate', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Generate Report +page.server', () => {
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
					url: new URL('http://localhost/governance/reports/generate'),
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
				url: new URL('http://localhost/governance/reports/generate'),
				fetch: vi.fn()
			} as any);
			expect(result.form).toBeDefined();
		});

		it('pre-populates template_id from URL query param', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/reports/generate?template_id=tpl-42'),
				fetch: vi.fn()
			} as any);
			expect(result.form.data.template_id).toBe('tpl-42');
		});

		it('uses empty string when template_id is not in URL', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/reports/generate'),
				fetch: vi.fn()
			} as any);
			expect(result.form.data.template_id).toBe('');
		});

		it('defaults output_format to json', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const result: any = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/governance/reports/generate'),
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

		it('returns validation error for missing template_id', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					template_id: '',
					output_format: 'json'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns validation error for invalid output_format', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					template_id: '550e8400-e29b-41d4-a716-446655440000',
					output_format: 'xml'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('calls generateReport and redirects on success', async () => {
			vi.mocked(generateReport).mockResolvedValue({} as any);
			try {
				await actions.default({
					request: makeFormData({
						template_id: '550e8400-e29b-41d4-a716-446655440000',
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
			expect(generateReport).toHaveBeenCalledWith(
				expect.objectContaining({
					template_id: '550e8400-e29b-41d4-a716-446655440000',
					output_format: 'json'
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('passes parsed parameters JSON to generateReport', async () => {
			vi.mocked(generateReport).mockResolvedValue({} as any);
			try {
				await actions.default({
					request: makeFormData({
						template_id: '550e8400-e29b-41d4-a716-446655440000',
						output_format: 'json',
						parameters: '{"start_date": "2026-01-01"}'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
			} catch {
				// redirect expected
			}
			expect(generateReport).toHaveBeenCalledWith(
				expect.objectContaining({
					parameters: { start_date: '2026-01-01' }
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns error message for invalid JSON parameters', async () => {
			const result: any = await actions.default({
				request: makeFormData({
					template_id: '550e8400-e29b-41d4-a716-446655440000',
					output_format: 'json',
					parameters: '{invalid-json'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns API error message on failure', async () => {
			vi.mocked(generateReport).mockRejectedValue(new ApiError('Template not found', 422));
			const result: any = await actions.default({
				request: makeFormData({
					template_id: '550e8400-e29b-41d4-a716-446655440000',
					output_format: 'json'
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(422);
		});

		it('rethrows non-API errors', async () => {
			vi.mocked(generateReport).mockRejectedValue(new Error('network failure'));
			await expect(
				actions.default({
					request: makeFormData({
						template_id: '550e8400-e29b-41d4-a716-446655440000',
						output_format: 'json'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow('network failure');
		});

		it('passes name to generateReport when provided', async () => {
			vi.mocked(generateReport).mockResolvedValue({} as any);
			try {
				await actions.default({
					request: makeFormData({
						template_id: '550e8400-e29b-41d4-a716-446655440000',
						output_format: 'csv',
						name: 'My Custom Report'
					}),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
			} catch {
				// redirect
			}
			expect(generateReport).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'My Custom Report',
					output_format: 'csv'
				}),
				'tok',
				'tid',
				expect.any(Function)
			);
		});
	});
});
