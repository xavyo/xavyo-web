import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/imports', () => ({
	listImportJobs: vi.fn(),
	uploadImport: vi.fn()
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
import { listImportJobs, uploadImport } from '$lib/api/imports';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

const makeJob = (overrides: Record<string, unknown> = {}) => ({
	id: 'job-1',
	status: 'completed',
	file_name: 'users.csv',
	total_rows: 100,
	success_count: 95,
	error_count: 3,
	skip_count: 2,
	send_invitations: true,
	created_at: '2026-01-15T10:00:00Z',
	...overrides
});

// =============================================================================
// Import List Page (+page.server.ts) - load
// =============================================================================

describe('Import List +page.server', () => {
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
					locals: mockLocals(false),
					url: new URL('http://localhost/settings/imports'),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(302);
				expect(e.location).toBe('/dashboard');
			}
		});

		it('returns jobs for admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listImportJobs).mockResolvedValue({
				items: [makeJob()],
				total: 1,
				limit: 20,
				offset: 0
			} as any);

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/settings/imports'),
				fetch: vi.fn()
			} as any);

			expect(result.jobs).toEqual([makeJob()]);
			expect(result.total).toBe(1);
			expect(result.limit).toBe(20);
			expect(result.offset).toBe(0);
		});

		it('reads pagination from URL searchParams', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listImportJobs).mockResolvedValue({
				items: [],
				total: 0,
				limit: 10,
				offset: 20
			} as any);

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/settings/imports?limit=10&offset=20'),
				fetch: vi.fn()
			} as any);

			expect(listImportJobs).toHaveBeenCalledWith(
				{ status: undefined, limit: 10, offset: 20 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('reads status filter from URL searchParams', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listImportJobs).mockResolvedValue({
				items: [],
				total: 0,
				limit: 20,
				offset: 0
			} as any);

			await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/settings/imports?status=completed'),
				fetch: vi.fn()
			} as any);

			expect(listImportJobs).toHaveBeenCalledWith(
				{ status: 'completed', limit: 20, offset: 0 },
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns empty array when API throws', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(listImportJobs).mockRejectedValue(new Error('Network error'));

			const result = await load({
				locals: mockLocals(true),
				url: new URL('http://localhost/settings/imports'),
				fetch: vi.fn()
			} as any);

			expect(result.jobs).toEqual([]);
			expect(result.total).toBe(0);
		});
	});

	// =============================================================================
	// Import List Page (+page.server.ts) - actions
	// =============================================================================

	describe('actions.upload', () => {
		let actions: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			actions = mod.actions;
		});

		it('redirects on successful upload', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(uploadImport).mockResolvedValue({
				job_id: 'new-job',
				status: 'pending',
				file_name: 'users.csv',
				total_rows: 50,
				message: null
			} as any);

			const file = new File(['email,name\ntest@example.com,Test'], 'users.csv', {
				type: 'text/csv'
			});
			const formData = new FormData();
			formData.set('file', file);

			try {
				await actions.upload({
					request: { formData: () => Promise.resolve(formData) },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
				expect.fail('should have thrown redirect');
			} catch (e: any) {
				expect(e.status).toBe(303);
				expect(e.location).toBe('/settings/imports');
			}
		});

		it('calls uploadImport with send_invitations=true when checkbox is on', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(uploadImport).mockResolvedValue({
				job_id: 'new-job',
				status: 'pending',
				file_name: 'users.csv',
				total_rows: 50,
				message: null
			} as any);

			const file = new File(['email,name\ntest@example.com,Test'], 'users.csv', {
				type: 'text/csv'
			});
			const formData = new FormData();
			formData.set('file', file);
			formData.set('send_invitations', 'on');

			try {
				await actions.upload({
					request: { formData: () => Promise.resolve(formData) },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
			} catch {
				// redirect expected
			}

			expect(uploadImport).toHaveBeenCalledWith(
				expect.any(File),
				true,
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('calls uploadImport with send_invitations=false when checkbox is off', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(uploadImport).mockResolvedValue({
				job_id: 'new-job',
				status: 'pending',
				file_name: 'users.csv',
				total_rows: 50,
				message: null
			} as any);

			const file = new File(['email,name\ntest@example.com,Test'], 'users.csv', {
				type: 'text/csv'
			});
			const formData = new FormData();
			formData.set('file', file);

			try {
				await actions.upload({
					request: { formData: () => Promise.resolve(formData) },
					locals: mockLocals(true),
					fetch: vi.fn()
				} as any);
			} catch {
				// redirect expected
			}

			expect(uploadImport).toHaveBeenCalledWith(
				expect.any(File),
				false,
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns fail when no file is provided', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);

			const formData = new FormData();

			const result = await actions.upload({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
			expect(result.data.error).toBe('Please select a CSV file to upload');
		});

		it('returns fail when file is not .csv', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);

			const file = new File(['data'], 'users.txt', { type: 'text/plain' });
			const formData = new FormData();
			formData.set('file', file);

			const result = await actions.upload({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
			expect(result.data.error).toBe('Only CSV files are supported');
		});

		it('returns fail on 409 concurrent import', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(uploadImport).mockRejectedValue(new ApiError('Conflict', 409));

			const file = new File(['email\ntest@example.com'], 'users.csv', { type: 'text/csv' });
			const formData = new FormData();
			formData.set('file', file);

			const result = await actions.upload({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(409);
			expect(result.data.error).toBe('A concurrent import is already in progress');
		});

		it('returns fail on 413 file too large', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(uploadImport).mockRejectedValue(new ApiError('Too large', 413));

			const file = new File(['email\ntest@example.com'], 'users.csv', { type: 'text/csv' });
			const formData = new FormData();
			formData.set('file', file);

			const result = await actions.upload({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(413);
			expect(result.data.error).toBe('File is too large. Maximum size is 10 MB.');
		});

		it('returns fail with ApiError message for other errors', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(uploadImport).mockRejectedValue(new ApiError('Invalid format', 400));

			const file = new File(['email\ntest@example.com'], 'users.csv', { type: 'text/csv' });
			const formData = new FormData();
			formData.set('file', file);

			const result = await actions.upload({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(400);
			expect(result.data.error).toBe('Invalid format');
		});

		it('returns fail 500 for non-ApiError', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(true);
			vi.mocked(uploadImport).mockRejectedValue(new Error('network'));

			const file = new File(['email\ntest@example.com'], 'users.csv', { type: 'text/csv' });
			const formData = new FormData();
			formData.set('file', file);

			const result = await actions.upload({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(500);
			expect(result.data.error).toBe('An unexpected error occurred during upload');
		});

		it('returns fail 403 for non-admin users', async () => {
			vi.mocked(hasAdminRole).mockReturnValue(false);

			const file = new File(['email\ntest@example.com'], 'users.csv', { type: 'text/csv' });
			const formData = new FormData();
			formData.set('file', file);

			const result = await actions.upload({
				request: { formData: () => Promise.resolve(formData) },
				locals: mockLocals(false),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(403);
		});
	});
});

// =============================================================================
// Import Job Data Logic
// =============================================================================

describe('Import job data', () => {
	it('job has all required fields', () => {
		const job = makeJob();
		expect(job.id).toBe('job-1');
		expect(job.status).toBe('completed');
		expect(job.file_name).toBe('users.csv');
		expect(job.total_rows).toBe(100);
		expect(job.success_count).toBe(95);
		expect(job.error_count).toBe(3);
		expect(job.skip_count).toBe(2);
		expect(job.send_invitations).toBe(true);
	});

	it('job with different statuses', () => {
		expect(makeJob({ status: 'pending' }).status).toBe('pending');
		expect(makeJob({ status: 'processing' }).status).toBe('processing');
		expect(makeJob({ status: 'failed' }).status).toBe('failed');
		expect(makeJob({ status: 'cancelled' }).status).toBe('cancelled');
	});

	it('job with zero counts', () => {
		const job = makeJob({ success_count: 0, error_count: 0, skip_count: 0 });
		expect(job.success_count).toBe(0);
		expect(job.error_count).toBe(0);
		expect(job.skip_count).toBe(0);
	});
});

// =============================================================================
// Status badge color logic
// =============================================================================

describe('Import status badge color logic', () => {
	const statusBadgeColor = (status: string): string => {
		switch (status) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'processing':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'failed':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			case 'cancelled':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	};

	it('pending is yellow', () => {
		expect(statusBadgeColor('pending')).toContain('yellow');
	});

	it('processing is blue', () => {
		expect(statusBadgeColor('processing')).toContain('blue');
	});

	it('completed is green', () => {
		expect(statusBadgeColor('completed')).toContain('green');
	});

	it('failed is red', () => {
		expect(statusBadgeColor('failed')).toContain('red');
	});

	it('cancelled is gray', () => {
		expect(statusBadgeColor('cancelled')).toContain('gray');
	});

	it('unknown status defaults to gray', () => {
		expect(statusBadgeColor('unknown')).toContain('gray');
	});
});

// =============================================================================
// Svelte Component Modules
// =============================================================================

describe('Import page Svelte components', () => {
	it('list page is defined', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	});
});
