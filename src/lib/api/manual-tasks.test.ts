import { describe, it, expect, vi, beforeEach } from 'vitest';

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

import {
	listManualTasks,
	getManualTask,
	getManualTaskDashboard,
	claimTask,
	startTask,
	confirmTask,
	rejectTask,
	cancelTask
} from './manual-tasks';

describe('manual-tasks API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- listManualTasks ---

	describe('listManualTasks', () => {
		it('calls GET /governance/manual-tasks with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listManualTasks({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/manual-tasks',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes status query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listManualTasks({ status: 'pending' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=pending');
		});

		it('includes application_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listManualTasks({ application_id: 'app-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('application_id=app-1');
		});

		it('includes user_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listManualTasks({ user_id: 'user-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('user_id=user-1');
		});

		it('includes sla_breached query param as string true', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listManualTasks({ sla_breached: true }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('sla_breached=true');
		});

		it('includes sla_breached query param as string false', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listManualTasks({ sla_breached: false }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('sla_breached=false');
		});

		it('includes assignee_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listManualTasks({ assignee_id: 'assignee-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('assignee_id=assignee-1');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listManualTasks({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=20');
		});

		it('includes all params in query string', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listManualTasks(
				{
					status: 'in_progress',
					application_id: 'app-2',
					user_id: 'user-2',
					sla_breached: true,
					assignee_id: 'assignee-2',
					limit: 50,
					offset: 100
				},
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=in_progress');
			expect(calledPath).toContain('application_id=app-2');
			expect(calledPath).toContain('user_id=user-2');
			expect(calledPath).toContain('sla_breached=true');
			expect(calledPath).toContain('assignee_id=assignee-2');
			expect(calledPath).toContain('limit=50');
			expect(calledPath).toContain('offset=100');
		});
	});

	// --- getManualTask ---

	describe('getManualTask', () => {
		it('calls GET /governance/manual-tasks/:id', async () => {
			const mockResponse = { id: 'task-1', status: 'pending', task_type: 'provisioning' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getManualTask('task-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/manual-tasks/task-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- getManualTaskDashboard ---

	describe('getManualTaskDashboard', () => {
		it('calls GET /governance/manual-tasks/dashboard', async () => {
			const mockResponse = { total: 10, pending: 5, in_progress: 3, completed: 2 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getManualTaskDashboard(token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/manual-tasks/dashboard',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- claimTask ---

	describe('claimTask', () => {
		it('calls POST /governance/manual-tasks/:id/claim', async () => {
			const mockResponse = { id: 'task-1', status: 'claimed', assignee_id: 'user-1' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await claimTask('task-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/manual-tasks/task-1/claim',
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- startTask ---

	describe('startTask', () => {
		it('calls POST /governance/manual-tasks/:id/start', async () => {
			const mockResponse = { id: 'task-1', status: 'in_progress' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await startTask('task-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/manual-tasks/task-1/start',
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- confirmTask ---

	describe('confirmTask', () => {
		it('calls POST /governance/manual-tasks/:id/confirm with body', async () => {
			const body = { notes: 'Task completed successfully' };
			const mockResponse = { id: 'task-1', status: 'confirmed' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await confirmTask('task-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/manual-tasks/task-1/confirm',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('sends body with empty notes', async () => {
			const body = { notes: '' };
			mockApiClient.mockResolvedValue({} as any);

			await confirmTask('task-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/manual-tasks/task-1/confirm',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- rejectTask ---

	describe('rejectTask', () => {
		it('calls POST /governance/manual-tasks/:id/reject with body', async () => {
			const body = { reason: 'Incorrect data provided' };
			const mockResponse = { id: 'task-1', status: 'rejected' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await rejectTask('task-1', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/manual-tasks/task-1/reject',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('sends body with reason', async () => {
			const body = { reason: 'SLA breached, unable to fulfill' };
			mockApiClient.mockResolvedValue({} as any);

			await rejectTask('task-2', body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/manual-tasks/task-2/reject',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- cancelTask ---

	describe('cancelTask', () => {
		it('calls POST /governance/manual-tasks/:id/cancel', async () => {
			const mockResponse = { id: 'task-1', status: 'cancelled' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await cancelTask('task-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/manual-tasks/task-1/cancel',
				{ method: 'POST', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Error handling ---

	describe('error handling', () => {
		it('propagates errors from apiClient for listManualTasks', async () => {
			mockApiClient.mockRejectedValue(new Error('Network error'));

			await expect(listManualTasks({}, token, tenantId, mockFetch)).rejects.toThrow('Network error');
		});

		it('propagates errors from apiClient for getManualTask', async () => {
			mockApiClient.mockRejectedValue(new Error('Not found'));

			await expect(getManualTask('task-1', token, tenantId, mockFetch)).rejects.toThrow('Not found');
		});

		it('propagates errors from apiClient for getManualTaskDashboard', async () => {
			mockApiClient.mockRejectedValue(new Error('Unauthorized'));

			await expect(getManualTaskDashboard(token, tenantId, mockFetch)).rejects.toThrow('Unauthorized');
		});

		it('propagates errors from apiClient for claimTask', async () => {
			mockApiClient.mockRejectedValue(new Error('Already claimed'));

			await expect(claimTask('task-1', token, tenantId, mockFetch)).rejects.toThrow('Already claimed');
		});

		it('propagates errors from apiClient for startTask', async () => {
			mockApiClient.mockRejectedValue(new Error('Invalid state'));

			await expect(startTask('task-1', token, tenantId, mockFetch)).rejects.toThrow('Invalid state');
		});

		it('propagates errors from apiClient for confirmTask', async () => {
			mockApiClient.mockRejectedValue(new Error('Server error'));

			await expect(
				confirmTask('task-1', {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Server error');
		});

		it('propagates errors from apiClient for rejectTask', async () => {
			mockApiClient.mockRejectedValue(new Error('Forbidden'));

			await expect(
				rejectTask('task-1', {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Forbidden');
		});

		it('propagates errors from apiClient for cancelTask', async () => {
			mockApiClient.mockRejectedValue(new Error('Service unavailable'));

			await expect(cancelTask('task-1', token, tenantId, mockFetch)).rejects.toThrow('Service unavailable');
		});
	});
});
