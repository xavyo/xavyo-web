import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listUsers, createUser, getUser, updateUser, deleteUser } from './users';

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

import { apiClient } from './client';

const mockApiClient = vi.mocked(apiClient);

describe('users API functions', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listUsers', () => {
		it('calls GET /admin/users with no params', async () => {
			const mockResponse = { users: [], pagination: { total_count: 0, offset: 0, limit: 20, has_more: false } };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listUsers({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/users', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes offset and limit in query string', async () => {
			mockApiClient.mockResolvedValue({ users: [], pagination: { total_count: 0, offset: 20, limit: 20, has_more: false } });

			await listUsers({ offset: 20, limit: 20 }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/users?offset=20&limit=20', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('includes email filter in query string', async () => {
			mockApiClient.mockResolvedValue({ users: [], pagination: { total_count: 0, offset: 0, limit: 20, has_more: false } });

			await listUsers({ email: 'test@example.com' }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/users?email=test%40example.com', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('createUser', () => {
		it('calls POST /admin/users with body', async () => {
			const userData = { email: 'new@example.com', password: 'password123', roles: ['user'] };
			const mockResponse = { id: '123', email: 'new@example.com', is_active: true, email_verified: false, roles: ['user'], created_at: '', updated_at: '', custom_attributes: {} };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createUser(userData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/users', {
				method: 'POST',
				body: userData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getUser', () => {
		it('calls GET /admin/users/:id', async () => {
			const mockResponse = { id: 'user-1', email: 'user@example.com', is_active: true, email_verified: true, roles: ['admin'], created_at: '', updated_at: '', custom_attributes: {} };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getUser('user-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/users/user-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateUser', () => {
		it('calls PUT /admin/users/:id with body', async () => {
			const updateData = { email: 'updated@example.com', roles: ['admin'] };
			const mockResponse = { id: 'user-1', email: 'updated@example.com', is_active: true, email_verified: true, roles: ['admin'], created_at: '', updated_at: '', custom_attributes: {} };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateUser('user-1', updateData, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/users/user-1', {
				method: 'PUT',
				body: updateData,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteUser', () => {
		it('calls DELETE /admin/users/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteUser('user-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/users/user-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});
});
