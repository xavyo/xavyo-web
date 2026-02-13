import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/governance-reporting', () => ({
	getTemplate: vi.fn(),
	updateTemplate: vi.fn(),
	archiveTemplate: vi.fn(),
	cloneTemplate: vi.fn()
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
import { getTemplate, updateTemplate, archiveTemplate, cloneTemplate } from '$lib/api/governance-reporting';
import { ApiError } from '$lib/api/client';
import { hasAdminRole } from '$lib/server/auth';
import type { ReportTemplate } from '$lib/api/types';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

function makeTemplate(overrides: Partial<ReportTemplate> = {}): ReportTemplate {
	return {
		id: 'tpl-1',
		tenant_id: 'tid',
		name: 'Access Review Template',
		description: 'Quarterly access review',
		template_type: 'access_review',
		compliance_standard: 'sox',
		definition: {
			data_sources: ['users'],
			filters: [],
			columns: [{ field: 'name', label: 'Name', sortable: true }],
			grouping: [],
			default_sort: null
		},
		is_system: false,
		cloned_from: null,
		status: 'active',
		created_by: 'user-1',
		created_at: '2026-01-01T00:00:00Z',
		updated_at: '2026-01-01T00:00:00Z',
		...overrides
	};
}

function makeFormData(data: Record<string, string>): Request {
	const formData = new URLSearchParams();
	for (const [k, v] of Object.entries(data)) {
		formData.set(k, v);
	}
	return new Request('http://localhost/governance/reports/templates/tpl-1', {
		method: 'POST',
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: formData.toString()
	});
}

describe('Template Detail +page.server', () => {
	beforeEach(() => {
		vi.resetAllMocks();
	});

	// --- Load function ---

	describe('load', () => {
		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					params: { id: 'tpl-1' },
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
					params: { id: 'tpl-1' },
					locals: { accessToken: null, tenantId: null, user: { roles: ['admin'] } },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('returns template and forms for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const template = makeTemplate();
			vi.mocked(getTemplate).mockResolvedValue(template);

			const result: any = await load({
				params: { id: 'tpl-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.template).toEqual(template);
			expect(result.editForm).toBeDefined();
			expect(result.cloneForm).toBeDefined();
		});

		it('pre-populates editForm with template data', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const template = makeTemplate({ name: 'My Template', description: 'Desc' });
			vi.mocked(getTemplate).mockResolvedValue(template);

			const result: any = await load({
				params: { id: 'tpl-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.editForm.data.name).toBe('My Template');
			expect(result.editForm.data.description).toBe('Desc');
		});

		it('pre-populates cloneForm with "Copy of" name', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const template = makeTemplate({ name: 'Original' });
			vi.mocked(getTemplate).mockResolvedValue(template);

			const result: any = await load({
				params: { id: 'tpl-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.cloneForm.data.name).toBe('Copy of Original');
		});

		it('throws API error status when getTemplate fails', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getTemplate).mockRejectedValue(new ApiError('Template not found', 404));

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
			vi.mocked(getTemplate).mockRejectedValue(new Error('network'));

			await expect(
				load({
					params: { id: 'tpl-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow('network');
		});

		it('calls getTemplate with correct params', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getTemplate).mockResolvedValue(makeTemplate());

			await load({
				params: { id: 'tpl-99' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(getTemplate).toHaveBeenCalledWith('tpl-99', 'tok', 'tid', expect.any(Function));
		});

		it('handles null description in editForm', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			const template = makeTemplate({ description: null });
			vi.mocked(getTemplate).mockResolvedValue(template);

			const result: any = await load({
				params: { id: 'tpl-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.editForm.data.description).toBeUndefined();
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
					params: { id: 'tpl-1' },
					request: makeFormData({ name: 'Updated' }),
					locals: { accessToken: null, tenantId: null },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('calls updateTemplate and redirects on success', async () => {
			vi.mocked(updateTemplate).mockResolvedValue(makeTemplate());
			try {
				await actions.edit({
					params: { id: 'tpl-1' },
					request: makeFormData({ name: 'Updated Name' }),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/governance/reports/templates/tpl-1');
			}
		});

		it('returns API error message on update failure', async () => {
			vi.mocked(updateTemplate).mockRejectedValue(new ApiError('Name taken', 409));
			const result: any = await actions.edit({
				params: { id: 'tpl-1' },
				request: makeFormData({ name: 'Updated' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(409);
		});

		it('rethrows non-API errors', async () => {
			vi.mocked(updateTemplate).mockRejectedValue(new Error('fail'));
			await expect(
				actions.edit({
					params: { id: 'tpl-1' },
					request: makeFormData({ name: 'Updated' }),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow('fail');
		});
	});

	// --- Archive action ---

	describe('archive action', () => {
		it('exports archive action', () => {
			expect(actions.archive).toBeDefined();
		});

		it('throws 401 when not authenticated', async () => {
			try {
				await actions.archive({
					params: { id: 'tpl-1' },
					locals: { accessToken: null, tenantId: null },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('calls archiveTemplate and redirects to reports list', async () => {
			vi.mocked(archiveTemplate).mockResolvedValue(makeTemplate());
			try {
				await actions.archive({
					params: { id: 'tpl-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/governance/reports');
			}
			expect(archiveTemplate).toHaveBeenCalledWith('tpl-1', 'tok', 'tid', expect.any(Function));
		});

		it('throws API error on archive failure', async () => {
			vi.mocked(archiveTemplate).mockRejectedValue(new ApiError('Forbidden', 403));
			try {
				await actions.archive({
					params: { id: 'tpl-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(403);
			}
		});

		it('rethrows non-API errors', async () => {
			vi.mocked(archiveTemplate).mockRejectedValue(new Error('db down'));
			await expect(
				actions.archive({
					params: { id: 'tpl-1' },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow('db down');
		});
	});

	// --- Clone action ---

	describe('clone action', () => {
		it('exports clone action', () => {
			expect(actions.clone).toBeDefined();
		});

		it('throws 401 when not authenticated', async () => {
			try {
				await actions.clone({
					params: { id: 'tpl-1' },
					request: makeFormData({ name: 'Copy' }),
					locals: { accessToken: null, tenantId: null },
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(401);
			}
		});

		it('calls cloneTemplate and redirects to new template', async () => {
			vi.mocked(cloneTemplate).mockResolvedValue(makeTemplate({ id: 'tpl-new' }));
			try {
				await actions.clone({
					params: { id: 'tpl-1' },
					request: makeFormData({ name: 'Cloned Template' }),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/governance/reports/templates/tpl-new');
			}
			expect(cloneTemplate).toHaveBeenCalledWith(
				'tpl-1',
				expect.objectContaining({ name: 'Cloned Template' }),
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns validation error for empty name', async () => {
			const result: any = await actions.clone({
				params: { id: 'tpl-1' },
				request: makeFormData({ name: '' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(400);
		});

		it('returns API error message on clone failure', async () => {
			vi.mocked(cloneTemplate).mockRejectedValue(new ApiError('Not found', 404));
			const result: any = await actions.clone({
				params: { id: 'tpl-1' },
				request: makeFormData({ name: 'Copy' }),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);
			expect(result.status).toBe(404);
		});

		it('rethrows non-API errors', async () => {
			vi.mocked(cloneTemplate).mockRejectedValue(new Error('crash'));
			await expect(
				actions.clone({
					params: { id: 'tpl-1' },
					request: makeFormData({ name: 'Copy' }),
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any)
			).rejects.toThrow('crash');
		});
	});
});
