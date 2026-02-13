import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('manual-tasks-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- fetchManualTasks ---

	describe('fetchManualTasks', () => {
		it('fetches from /api/governance/manual-tasks with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchManualTasks } = await import('./manual-tasks-client');

			const result = await fetchManualTasks({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/manual-tasks');
			expect(result).toEqual(data);
		});

		it('includes all query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0, limit: 10, offset: 20 }));
			const { fetchManualTasks } = await import('./manual-tasks-client');

			await fetchManualTasks(
				{
					status: 'pending',
					application_id: 'app-1',
					user_id: 'user-1',
					sla_breached: true,
					assignee_id: 'admin-1',
					limit: 10,
					offset: 20
				},
				mockFetch
			);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=pending');
			expect(calledUrl).toContain('application_id=app-1');
			expect(calledUrl).toContain('user_id=user-1');
			expect(calledUrl).toContain('sla_breached=true');
			expect(calledUrl).toContain('assignee_id=admin-1');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('handles sla_breached=false correctly', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0, limit: 20, offset: 0 }));
			const { fetchManualTasks } = await import('./manual-tasks-client');

			await fetchManualTasks({ sla_breached: false }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('sla_breached=false');
		});

		it('omits undefined params from query string', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0, limit: 20, offset: 0 }));
			const { fetchManualTasks } = await import('./manual-tasks-client');

			await fetchManualTasks({ status: 'in_progress' }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=in_progress');
			expect(calledUrl).not.toContain('application_id');
			expect(calledUrl).not.toContain('user_id');
			expect(calledUrl).not.toContain('sla_breached');
			expect(calledUrl).not.toContain('assignee_id');
			expect(calledUrl).not.toContain('limit');
			expect(calledUrl).not.toContain('offset');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchManualTasks } = await import('./manual-tasks-client');

			await expect(fetchManualTasks({}, mockFetch)).rejects.toThrow(
				'Failed to fetch manual tasks: 500'
			);
		});
	});

	// --- fetchManualTaskDashboard ---

	describe('fetchManualTaskDashboard', () => {
		it('fetches from /api/governance/manual-tasks/dashboard', async () => {
			const data = {
				pending_count: 5,
				in_progress_count: 3,
				sla_at_risk_count: 1,
				completed_today_count: 12,
				average_completion_time_seconds: 3600
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchManualTaskDashboard } = await import('./manual-tasks-client');

			const result = await fetchManualTaskDashboard(mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/manual-tasks/dashboard');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchManualTaskDashboard } = await import('./manual-tasks-client');

			await expect(fetchManualTaskDashboard(mockFetch)).rejects.toThrow(
				'Failed to fetch manual task dashboard: 500'
			);
		});
	});

	// --- claimTaskClient ---

	describe('claimTaskClient', () => {
		it('sends POST to /api/governance/manual-tasks/{id}/claim', async () => {
			const data = { id: 'task-1', status: 'claimed' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { claimTaskClient } = await import('./manual-tasks-client');

			const result = await claimTaskClient('task-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/manual-tasks/task-1/claim', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 409));
			const { claimTaskClient } = await import('./manual-tasks-client');

			await expect(claimTaskClient('task-1', mockFetch)).rejects.toThrow(
				'Failed to claim task: 409'
			);
		});
	});

	// --- startTaskClient ---

	describe('startTaskClient', () => {
		it('sends POST to /api/governance/manual-tasks/{id}/start', async () => {
			const data = { id: 'task-1', status: 'in_progress' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { startTaskClient } = await import('./manual-tasks-client');

			const result = await startTaskClient('task-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/manual-tasks/task-1/start', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { startTaskClient } = await import('./manual-tasks-client');

			await expect(startTaskClient('task-1', mockFetch)).rejects.toThrow(
				'Failed to start task: 400'
			);
		});
	});

	// --- confirmTaskClient ---

	describe('confirmTaskClient', () => {
		it('sends POST to /api/governance/manual-tasks/{id}/confirm with JSON body', async () => {
			const body = { notes: 'Task completed successfully' };
			const data = { id: 'task-1', status: 'completed' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { confirmTaskClient } = await import('./manual-tasks-client');

			const result = await confirmTaskClient('task-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/manual-tasks/task-1/confirm', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('sends empty body when no notes provided', async () => {
			const body = {};
			const data = { id: 'task-1', status: 'completed' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { confirmTaskClient } = await import('./manual-tasks-client');

			const result = await confirmTaskClient('task-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/manual-tasks/task-1/confirm', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { confirmTaskClient } = await import('./manual-tasks-client');

			await expect(confirmTaskClient('task-1', {}, mockFetch)).rejects.toThrow(
				'Failed to confirm task: 422'
			);
		});
	});

	// --- rejectTaskClient ---

	describe('rejectTaskClient', () => {
		it('sends POST to /api/governance/manual-tasks/{id}/reject with JSON body', async () => {
			const body = { reason: 'Invalid data provided' };
			const data = { id: 'task-1', status: 'rejected' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { rejectTaskClient } = await import('./manual-tasks-client');

			const result = await rejectTaskClient('task-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/manual-tasks/task-1/reject', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { rejectTaskClient } = await import('./manual-tasks-client');

			await expect(rejectTaskClient('task-1', { reason: 'bad' }, mockFetch)).rejects.toThrow(
				'Failed to reject task: 400'
			);
		});
	});

	// --- cancelTaskClient ---

	describe('cancelTaskClient', () => {
		it('sends POST to /api/governance/manual-tasks/{id}/cancel', async () => {
			const data = { id: 'task-1', status: 'cancelled' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { cancelTaskClient } = await import('./manual-tasks-client');

			const result = await cancelTaskClient('task-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/manual-tasks/task-1/cancel', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { cancelTaskClient } = await import('./manual-tasks-client');

			await expect(cancelTaskClient('task-1', mockFetch)).rejects.toThrow(
				'Failed to cancel task: 500'
			);
		});
	});
});
