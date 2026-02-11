import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listA2aTasks, createA2aTask, getA2aTask, cancelA2aTask, getAgentCard } from './a2a';

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

describe('A2A API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listA2aTasks', () => {
		it('calls GET /a2a/tasks with no params', async () => {
			const mockResponse = { tasks: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listA2aTasks({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/a2a/tasks', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes state filter in query string', async () => {
			mockApiClient.mockResolvedValue({ tasks: [], total: 0, limit: 20, offset: 0 });

			await listA2aTasks({ state: 'running' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('state')).toBe('running');
		});

		it('includes target_agent_id filter in query string', async () => {
			mockApiClient.mockResolvedValue({ tasks: [], total: 0, limit: 20, offset: 0 });

			await listA2aTasks({ target_agent_id: 'agent-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('target_agent_id')).toBe('agent-1');
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ tasks: [], total: 0, limit: 10, offset: 20 });

			await listA2aTasks({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});
	});

	describe('createA2aTask', () => {
		it('calls POST /a2a/tasks with body', async () => {
			const body = {
				target_agent_id: 'agent-1',
				task_type: 'summarize',
				input: { text: 'hello' }
			};
			mockApiClient.mockResolvedValue({ task_id: 'task-1', status: 'pending', created_at: '2026-01-01' });

			const result = await createA2aTask(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/a2a/tasks', {
				method: 'POST',
				token,
				tenantId,
				body,
				fetch: mockFetch
			});
			expect(result.task_id).toBe('task-1');
		});
	});

	describe('getA2aTask', () => {
		it('calls GET /a2a/tasks/:id', async () => {
			const mockTask = { id: 'task-1', state: 'completed', task_type: 'summarize' };
			mockApiClient.mockResolvedValue(mockTask);

			const result = await getA2aTask('task-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/a2a/tasks/task-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockTask);
		});
	});

	describe('cancelA2aTask', () => {
		it('calls POST /a2a/tasks/:id/cancel', async () => {
			const mockResponse = { task_id: 'task-1', state: 'cancelled', cancelled_at: '2026-01-01' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await cancelA2aTask('task-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/a2a/tasks/task-1/cancel', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getAgentCard', () => {
		it('calls GET /.well-known/agents/:id', async () => {
			const mockCard = {
				name: 'Test Agent',
				description: 'A test agent',
				url: 'https://example.com',
				version: '1.0',
				protocol_version: '1.0',
				capabilities: { streaming: false, push_notifications: false },
				authentication: { schemes: ['bearer'] },
				skills: []
			};
			mockApiClient.mockResolvedValue(mockCard);

			const result = await getAgentCard('agent-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/.well-known/agents/agent-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.name).toBe('Test Agent');
		});
	});
});
