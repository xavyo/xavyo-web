import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('a2a-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	describe('fetchA2aTasks', () => {
		it('fetches from /api/nhi/a2a/tasks with no params', async () => {
			const data = { tasks: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchA2aTasks } = await import('./a2a-client');

			const result = await fetchA2aTasks({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/a2a/tasks');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ tasks: [], total: 0 }));
			const { fetchA2aTasks } = await import('./a2a-client');

			await fetchA2aTasks({ state: 'running', target_agent_id: 'agent-1', limit: 10 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('state=running');
			expect(calledUrl).toContain('target_agent_id=agent-1');
			expect(calledUrl).toContain('limit=10');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchA2aTasks } = await import('./a2a-client');

			await expect(fetchA2aTasks({}, mockFetch)).rejects.toThrow(
				'Failed to fetch A2A tasks: 500'
			);
		});
	});

	describe('createA2aTaskClient', () => {
		it('sends POST to /api/nhi/a2a/tasks with body', async () => {
			const created = { task_id: 'task-1', status: 'pending', created_at: '2026-01-01' };
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { createA2aTaskClient } = await import('./a2a-client');

			const body = { target_agent_id: 'agent-1', task_type: 'summarize', input: { text: 'hello' } };
			const result = await createA2aTaskClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/a2a/tasks', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createA2aTaskClient } = await import('./a2a-client');

			await expect(
				createA2aTaskClient(
					{ target_agent_id: 'a', task_type: 'x', input: {} },
					mockFetch
				)
			).rejects.toThrow('Failed to create A2A task: 400');
		});
	});

	describe('fetchA2aTask', () => {
		it('fetches from /api/nhi/a2a/tasks/:id', async () => {
			const data = { id: 'task-1', state: 'completed', task_type: 'summarize' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchA2aTask } = await import('./a2a-client');

			const result = await fetchA2aTask('task-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/a2a/tasks/task-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchA2aTask } = await import('./a2a-client');

			await expect(fetchA2aTask('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch A2A task: 404'
			);
		});
	});

	describe('cancelA2aTaskClient', () => {
		it('sends POST to /api/nhi/a2a/tasks/:id/cancel', async () => {
			const data = { task_id: 'task-1', state: 'cancelled', cancelled_at: '2026-01-01' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { cancelA2aTaskClient } = await import('./a2a-client');

			const result = await cancelA2aTaskClient('task-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/a2a/tasks/task-1/cancel', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { cancelA2aTaskClient } = await import('./a2a-client');

			await expect(cancelA2aTaskClient('task-1', mockFetch)).rejects.toThrow(
				'Failed to cancel A2A task: 400'
			);
		});
	});

	describe('fetchAgentCard', () => {
		it('fetches from /api/nhi/a2a/agent-card/:id', async () => {
			const data = {
				name: 'Test Agent',
				description: 'A test agent',
				url: 'https://example.com',
				version: '1.0',
				protocol_version: '1.0',
				capabilities: { streaming: false, push_notifications: false },
				authentication: { schemes: ['bearer'] },
				skills: []
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchAgentCard } = await import('./a2a-client');

			const result = await fetchAgentCard('agent-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/nhi/a2a/agent-card/agent-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchAgentCard } = await import('./a2a-client');

			await expect(fetchAgentCard('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch agent card: 404'
			);
		});
	});
});
