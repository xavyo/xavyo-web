import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	uploadImport,
	listImportJobs,
	getImportJob,
	listImportErrors,
	downloadImportErrors,
	resendInvitations,
	validateInvitation,
	acceptInvitation
} from './imports';

vi.mock('./client', () => ({
	apiClient: vi.fn(),
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { apiClient, ApiError } from './client';

const mockApiClient = vi.mocked(apiClient);

describe('Imports API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// ─── listImportJobs ─────────────────────────────────────────────────────

	describe('listImportJobs', () => {
		const mockResponse = {
			items: [],
			total: 0,
			limit: 20,
			offset: 0
		};

		it('calls GET /admin/users/imports with no params', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listImportJobs({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/users/imports', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes status and pagination params in query string', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			await listImportJobs(
				{ status: 'completed', limit: 10, offset: 20 },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/admin/users/imports?');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('status')).toBe('completed');
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});

		it('omits undefined params from query string', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			await listImportJobs({ limit: 5 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('5');
			expect(params.has('status')).toBe(false);
			expect(params.has('offset')).toBe(false);
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Forbidden', 403));

			await expect(listImportJobs({}, token, tenantId, mockFetch)).rejects.toThrow('Forbidden');
		});
	});

	// ─── getImportJob ───────────────────────────────────────────────────────

	describe('getImportJob', () => {
		const mockJob = {
			id: 'job-1',
			status: 'completed',
			file_name: 'users.csv',
			total_rows: 100,
			success_count: 95,
			error_count: 5,
			skip_count: 0,
			send_invitations: true,
			created_at: '2024-01-01T00:00:00Z',
			tenant_id: tenantId,
			file_hash: 'abc123',
			file_size_bytes: 2048,
			processed_rows: 100,
			created_by: 'admin-1',
			started_at: '2024-01-01T00:00:01Z',
			completed_at: '2024-01-01T00:00:10Z',
			error_message: null,
			updated_at: '2024-01-01T00:00:10Z'
		};

		it('calls GET /admin/users/imports/:jobId', async () => {
			mockApiClient.mockResolvedValue(mockJob);

			const result = await getImportJob('job-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/users/imports/job-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockJob);
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Not Found', 404));

			await expect(getImportJob('job-999', token, tenantId, mockFetch)).rejects.toThrow(
				'Not Found'
			);
		});
	});

	// ─── listImportErrors ───────────────────────────────────────────────────

	describe('listImportErrors', () => {
		const mockResponse = {
			items: [
				{
					id: 'err-1',
					line_number: 3,
					email: 'bad@example.com',
					column_name: 'email',
					error_type: 'validation',
					error_message: 'Invalid email format',
					created_at: '2024-01-01T00:00:00Z'
				}
			],
			total: 1,
			limit: 20,
			offset: 0
		};

		it('calls GET /admin/users/imports/:jobId/errors with pagination', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			await listImportErrors('job-1', { limit: 10, offset: 0 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/admin/users/imports/job-1/errors?');
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('0');
		});

		it('calls with no params when empty', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listImportErrors('job-1', {}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/users/imports/job-1/errors', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Server error', 500));

			await expect(
				listImportErrors('job-1', {}, token, tenantId, mockFetch)
			).rejects.toThrow('Server error');
		});
	});

	// ─── resendInvitations ──────────────────────────────────────────────────

	describe('resendInvitations', () => {
		const mockResponse = {
			resent_count: 10,
			skipped_count: 2,
			message: null
		};

		it('calls POST /admin/users/imports/:jobId/resend-invitations', async () => {
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await resendInvitations('job-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/admin/users/imports/job-1/resend-invitations',
				{
					method: 'POST',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});

		it('propagates ApiError on failure', async () => {
			mockApiClient.mockRejectedValue(new ApiError('Bad Request', 400));

			await expect(
				resendInvitations('job-1', token, tenantId, mockFetch)
			).rejects.toThrow('Bad Request');
		});
	});

	// ─── uploadImport ───────────────────────────────────────────────────────

	describe('uploadImport', () => {
		it('creates FormData and calls raw fetch with multipart', async () => {
			const mockFile = new File(['name,email\nJohn,john@example.com'], 'users.csv', {
				type: 'text/csv'
			});
			const mockJsonResponse = {
				job_id: 'job-1',
				status: 'pending',
				file_name: 'users.csv',
				total_rows: 1,
				message: null
			};
			mockFetch.mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockJsonResponse)
			});

			const result = await uploadImport(mockFile, true, token, tenantId, mockFetch);

			expect(mockFetch).toHaveBeenCalledOnce();
			const [url, options] = mockFetch.mock.calls[0];
			expect(url).toBe('http://localhost:8080/admin/users/import');
			expect(options.method).toBe('POST');
			expect(options.headers).toEqual({
				Authorization: `Bearer ${token}`,
				'X-Tenant-Id': tenantId
			});
			// Verify FormData body
			expect(options.body).toBeInstanceOf(FormData);
			const formData = options.body as FormData;
			expect(formData.get('file')).toBeInstanceOf(File);
			expect(formData.get('send_invitations')).toBe('true');
			expect(result).toEqual(mockJsonResponse);
		});

		it('sends send_invitations as "false" when disabled', async () => {
			const mockFile = new File(['data'], 'users.csv', { type: 'text/csv' });
			mockFetch.mockResolvedValue({
				ok: true,
				json: () =>
					Promise.resolve({
						job_id: 'job-2',
						status: 'pending',
						file_name: 'users.csv',
						total_rows: 1,
						message: null
					})
			});

			await uploadImport(mockFile, false, token, tenantId, mockFetch);

			const formData = mockFetch.mock.calls[0][1].body as FormData;
			expect(formData.get('send_invitations')).toBe('false');
		});

		it('throws ApiError on non-ok response', async () => {
			const mockFile = new File(['data'], 'users.csv', { type: 'text/csv' });
			mockFetch.mockResolvedValue({
				ok: false,
				status: 400,
				text: () => Promise.resolve(JSON.stringify({ message: 'Invalid CSV' }))
			});

			await expect(
				uploadImport(mockFile, true, token, tenantId, mockFetch)
			).rejects.toThrow('Invalid CSV');
		});
	});

	// ─── downloadImportErrors ───────────────────────────────────────────────

	describe('downloadImportErrors', () => {
		it('calls raw fetch and returns raw response', async () => {
			const mockResponse = {
				ok: true,
				headers: new Headers({ 'content-type': 'text/csv' }),
				body: 'line,email,error\n3,bad@example.com,Invalid'
			};
			mockFetch.mockResolvedValue(mockResponse);

			const result = await downloadImportErrors('job-1', token, tenantId, mockFetch);

			expect(mockFetch).toHaveBeenCalledOnce();
			const [url, options] = mockFetch.mock.calls[0];
			expect(url).toBe('http://localhost:8080/admin/users/imports/job-1/errors/download');
			expect(options.method).toBe('GET');
			expect(options.headers).toEqual({
				Authorization: `Bearer ${token}`,
				'X-Tenant-Id': tenantId
			});
			expect(result).toBe(mockResponse);
		});

		it('throws ApiError on non-ok response', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve(JSON.stringify({ message: 'Job not found' }))
			});

			await expect(
				downloadImportErrors('job-999', token, tenantId, mockFetch)
			).rejects.toThrow('Job not found');
		});
	});

	// ─── validateInvitation ─────────────────────────────────────────────────

	describe('validateInvitation', () => {
		it('calls GET /invite/:token with no auth headers', async () => {
			const mockResponse = {
				valid: true,
				email: 'user@example.com',
				tenant_name: 'Test Tenant',
				reason: null,
				message: null
			};
			mockFetch.mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockResponse)
			});

			const result = await validateInvitation('invite-token-123', mockFetch);

			expect(mockFetch).toHaveBeenCalledOnce();
			const [url, options] = mockFetch.mock.calls[0];
			expect(url).toBe('http://localhost:8080/invite/invite-token-123');
			expect(options.method).toBe('GET');
			// No auth headers
			expect(options.headers).toBeUndefined();
			expect(result).toEqual(mockResponse);
		});

		it('throws ApiError on non-ok response', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve(JSON.stringify({ message: 'Invalid invitation' }))
			});

			await expect(validateInvitation('bad-token', mockFetch)).rejects.toThrow(
				'Invalid invitation'
			);
		});
	});

	// ─── acceptInvitation ───────────────────────────────────────────────────

	describe('acceptInvitation', () => {
		it('calls POST /invite/:token with JSON body and no auth', async () => {
			const mockResponse = {
				success: true,
				message: 'Account created successfully',
				redirect_url: '/login'
			};
			mockFetch.mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockResponse)
			});

			const result = await acceptInvitation('invite-token-123', 'MyP@ssw0rd!', mockFetch);

			expect(mockFetch).toHaveBeenCalledOnce();
			const [url, options] = mockFetch.mock.calls[0];
			expect(url).toBe('http://localhost:8080/invite/invite-token-123');
			expect(options.method).toBe('POST');
			expect(options.headers).toEqual({
				'Content-Type': 'application/json'
			});
			expect(JSON.parse(options.body)).toEqual({ password: 'MyP@ssw0rd!' });
			// No auth headers
			expect(options.headers['Authorization']).toBeUndefined();
			expect(result).toEqual(mockResponse);
		});

		it('throws ApiError on non-ok response', async () => {
			mockFetch.mockResolvedValue({
				ok: false,
				status: 400,
				text: () => Promise.resolve(JSON.stringify({ message: 'Password too weak' }))
			});

			await expect(
				acceptInvitation('invite-token-123', 'weak', mockFetch)
			).rejects.toThrow('Password too weak');
		});
	});
});
