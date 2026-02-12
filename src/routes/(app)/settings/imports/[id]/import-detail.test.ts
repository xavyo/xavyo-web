import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/imports', () => ({
	getImportJob: vi.fn(),
	listImportErrors: vi.fn(),
	resendInvitations: vi.fn()
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

import { hasAdminRole } from '$lib/server/auth';
import { getImportJob, listImportErrors, resendInvitations } from '$lib/api/imports';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

const makeJobDetail = (overrides: Record<string, unknown> = {}) => ({
	id: 'job-1',
	status: 'completed',
	file_name: 'users.csv',
	total_rows: 100,
	success_count: 95,
	error_count: 3,
	skip_count: 2,
	send_invitations: true,
	created_at: '2026-01-15T10:00:00Z',
	tenant_id: 'tid',
	file_hash: 'abc123',
	file_size_bytes: 2048,
	processed_rows: 100,
	created_by: 'admin-user',
	started_at: '2026-01-15T10:00:01Z',
	completed_at: '2026-01-15T10:00:05Z',
	error_message: null,
	updated_at: '2026-01-15T10:00:05Z',
	...overrides
});

const makeImportError = (overrides: Record<string, unknown> = {}) => ({
	id: 'err-1',
	line_number: 5,
	email: 'bad@example.com',
	column_name: 'email',
	error_type: 'validation',
	error_message: 'Invalid email format',
	created_at: '2026-01-15T10:00:02Z',
	...overrides
});

// =============================================================================
// Import Detail Page (+page.server.ts) - load
// =============================================================================

describe('Import Detail +page.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load', () => {
		let load: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			load = mod.load;
		});

		it('redirects non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);
			try {
				await load({
					params: { id: 'job-1' },
					locals: mockLocals(false),
					url: new URL('http://localhost/settings/imports/job-1'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
			}
		});

		it('returns job with errors for admin', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getImportJob).mockResolvedValue(makeJobDetail() as any);
			vi.mocked(listImportErrors).mockResolvedValue({
				items: [makeImportError()],
				total: 1,
				limit: 20,
				offset: 0
			} as any);

			const result = await load({
				params: { id: 'job-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/settings/imports/job-1'),
				fetch: vi.fn()
			} as any);

			expect(result.job.id).toBe('job-1');
			expect(result.job.file_name).toBe('users.csv');
			expect(result.errors).toHaveLength(1);
			expect(result.errors[0].email).toBe('bad@example.com');
			expect(result.errorTotal).toBe(1);
		});

		it('reads error pagination from URL searchParams', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getImportJob).mockResolvedValue(makeJobDetail() as any);
			vi.mocked(listImportErrors).mockResolvedValue({
				items: [],
				total: 0,
				limit: 10,
				offset: 20
			} as any);

			await load({
				params: { id: 'job-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/settings/imports/job-1?elimit=10&eoffset=20'),
				fetch: vi.fn()
			} as any);

			expect(listImportErrors).toHaveBeenCalledWith(
				'job-1',
				{ limit: 10, offset: 20 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('throws error when job not found', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getImportJob).mockRejectedValue(new ApiError('Not found', 404));

			try {
				await load({
					params: { id: 'bad-id' },
					locals: mockLocals(true),
					url: new URL('http://localhost/settings/imports/bad-id'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(404);
			}
		});

		it('returns empty errors when error API fails', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getImportJob).mockResolvedValue(makeJobDetail() as any);
			vi.mocked(listImportErrors).mockRejectedValue(new Error('fail'));

			const result = await load({
				params: { id: 'job-1' },
				locals: mockLocals(true),
				url: new URL('http://localhost/settings/imports/job-1'),
				fetch: vi.fn()
			} as any);

			expect(result.job.id).toBe('job-1');
			expect(result.errors).toEqual([]);
			expect(result.errorTotal).toBe(0);
		});

		it('throws 500 for non-ApiError on job load', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(getImportJob).mockRejectedValue(new Error('network'));

			try {
				await load({
					params: { id: 'job-1' },
					locals: mockLocals(true),
					url: new URL('http://localhost/settings/imports/job-1'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown');
			} catch (e: any) {
				expect(e.status).toBe(500);
			}
		});
	});

	// =============================================================================
	// Import Detail Page (+page.server.ts) - actions
	// =============================================================================

	describe('actions.resend', () => {
		let actions: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			actions = mod.actions;
		});

		it('returns success with resend counts', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(resendInvitations).mockResolvedValue({
				resent_count: 10,
				skipped_count: 2,
				message: null
			});

			const result = await actions.resend({
				params: { id: 'job-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.success).toBe(true);
			expect(result.action).toBe('resend');
			expect(result.resent_count).toBe(10);
			expect(result.skipped_count).toBe(2);
		});

		it('calls resendInvitations with correct params', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(resendInvitations).mockResolvedValue({
				resent_count: 5,
				skipped_count: 0,
				message: null
			});

			await actions.resend({
				params: { id: 'job-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(resendInvitations).toHaveBeenCalledWith(
				'job-1',
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns fail on ApiError', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(resendInvitations).mockRejectedValue(new ApiError('Not found', 404));

			const result = await actions.resend({
				params: { id: 'job-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(404);
			expect(result.data.error).toBe('Not found');
		});

		it('returns fail 500 for non-ApiError', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(resendInvitations).mockRejectedValue(new Error('network'));

			const result = await actions.resend({
				params: { id: 'job-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(500);
			expect(result.data.error).toBe('Failed to resend invitations');
		});

		it('returns fail 403 for non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);

			const result = await actions.resend({
				params: { id: 'job-1' },
				locals: mockLocals(false),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(403);
		});

		it('includes message from resend response', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(resendInvitations).mockResolvedValue({
				resent_count: 8,
				skipped_count: 3,
				message: 'Some invitations could not be resent'
			});

			const result = await actions.resend({
				params: { id: 'job-1' },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.message).toBe('Some invitations could not be resent');
		});
	});
});

// =============================================================================
// Import Error Data Logic
// =============================================================================

describe('Import error data', () => {
	it('error has all required fields', () => {
		const err = makeImportError();
		expect(err.id).toBe('err-1');
		expect(err.line_number).toBe(5);
		expect(err.email).toBe('bad@example.com');
		expect(err.column_name).toBe('email');
		expect(err.error_type).toBe('validation');
		expect(err.error_message).toBe('Invalid email format');
	});

	it('error with null email', () => {
		const err = makeImportError({ email: null });
		expect(err.email).toBeNull();
	});

	it('error with null column_name', () => {
		const err = makeImportError({ column_name: null });
		expect(err.column_name).toBeNull();
	});

	it('error with different error types', () => {
		expect(makeImportError({ error_type: 'duplicate_in_file' }).error_type).toBe('duplicate_in_file');
		expect(makeImportError({ error_type: 'duplicate_in_tenant' }).error_type).toBe('duplicate_in_tenant');
		expect(makeImportError({ error_type: 'role_not_found' }).error_type).toBe('role_not_found');
		expect(makeImportError({ error_type: 'group_error' }).error_type).toBe('group_error');
		expect(makeImportError({ error_type: 'attribute_error' }).error_type).toBe('attribute_error');
		expect(makeImportError({ error_type: 'system' }).error_type).toBe('system');
	});
});

// =============================================================================
// Error type badge color logic
// =============================================================================

describe('Error type badge color logic', () => {
	const errorTypeBadgeColor = (errorType: string): string => {
		switch (errorType) {
			case 'validation':
				return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
			case 'duplicate_in_file':
			case 'duplicate_in_tenant':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'role_not_found':
			case 'group_error':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
			case 'attribute_error':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'system':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	};

	it('validation is orange', () => {
		expect(errorTypeBadgeColor('validation')).toContain('orange');
	});

	it('duplicate_in_file is yellow', () => {
		expect(errorTypeBadgeColor('duplicate_in_file')).toContain('yellow');
	});

	it('duplicate_in_tenant is yellow', () => {
		expect(errorTypeBadgeColor('duplicate_in_tenant')).toContain('yellow');
	});

	it('role_not_found is purple', () => {
		expect(errorTypeBadgeColor('role_not_found')).toContain('purple');
	});

	it('group_error is purple', () => {
		expect(errorTypeBadgeColor('group_error')).toContain('purple');
	});

	it('attribute_error is blue', () => {
		expect(errorTypeBadgeColor('attribute_error')).toContain('blue');
	});

	it('system is red', () => {
		expect(errorTypeBadgeColor('system')).toContain('red');
	});

	it('unknown error type defaults to gray', () => {
		expect(errorTypeBadgeColor('unknown')).toContain('gray');
	});
});

// =============================================================================
// File size formatting logic
// =============================================================================

describe('File size formatting', () => {
	const formatFileSize = (bytes: number): string => {
		if (bytes >= 1024 * 1024) {
			return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
		}
		return (bytes / 1024).toFixed(1) + ' KB';
	};

	it('formats bytes as KB', () => {
		expect(formatFileSize(2048)).toBe('2.0 KB');
	});

	it('formats small files as KB', () => {
		expect(formatFileSize(512)).toBe('0.5 KB');
	});

	it('formats large files as MB', () => {
		expect(formatFileSize(1024 * 1024 * 5)).toBe('5.0 MB');
	});

	it('formats 1 MB', () => {
		expect(formatFileSize(1024 * 1024)).toBe('1.0 MB');
	});
});

// =============================================================================
// Svelte Component Module
// =============================================================================

describe('Import detail page Svelte component', () => {
	it('page is defined', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	}, 15000);
});
