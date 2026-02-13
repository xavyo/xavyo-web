import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listLifecycleConfigs,
	createLifecycleConfig,
	getLifecycleConfig,
	updateLifecycleConfig,
	deleteLifecycleConfig,
	createState,
	updateState,
	deleteState,
	createTransition,
	deleteTransition,
	getTransitionConditions,
	updateTransitionConditions,
	evaluateTransitionConditions,
	getStateActions,
	updateStateActions,
	getUserLifecycleStatus
} from './lifecycle';

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

describe('Lifecycle API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';
	const configId = 'config-1';
	const stateId = 'state-1';
	const transitionId = 'trans-1';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Lifecycle Configs ---

	describe('listLifecycleConfigs', () => {
		it('calls GET /governance/lifecycle/configs with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listLifecycleConfigs({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/configs',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('includes object_type query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listLifecycleConfigs({ object_type: 'user' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('object_type=user');
		});

		it('includes is_active query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listLifecycleConfigs({ is_active: true }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('is_active=true');
		});

		it('includes limit and offset query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listLifecycleConfigs({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('limit=10');
			expect(calledPath).toContain('offset=20');
		});
	});

	describe('createLifecycleConfig', () => {
		it('calls POST /governance/lifecycle/configs with body', async () => {
			const body = { name: 'User Lifecycle', object_type: 'user', description: 'User lifecycle config' };
			const mockResponse = { id: configId, ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createLifecycleConfig(body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/configs',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getLifecycleConfig', () => {
		it('calls GET /governance/lifecycle/configs/:configId', async () => {
			const mockResponse = { id: configId, name: 'User Lifecycle', object_type: 'user', states: [], transitions: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getLifecycleConfig(configId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/configs/config-1',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateLifecycleConfig', () => {
		it('calls PATCH /governance/lifecycle/configs/:configId with body', async () => {
			const body = { name: 'Updated Lifecycle', description: 'Updated description' };
			const mockResponse = { id: configId, ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateLifecycleConfig(configId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/configs/config-1',
				{ method: 'PATCH', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteLifecycleConfig', () => {
		it('calls DELETE /governance/lifecycle/configs/:configId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteLifecycleConfig(configId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/configs/config-1',
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- States ---

	describe('createState', () => {
		it('calls POST /governance/lifecycle/configs/:configId/states with body', async () => {
			const body = { name: 'active', display_name: 'Active', is_initial: false, is_terminal: false };
			const mockResponse = { id: stateId, config_id: configId, ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createState(configId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/configs/config-1/states',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateState', () => {
		it('calls PATCH /governance/lifecycle/configs/:configId/states/:stateId with body', async () => {
			const body = { display_name: 'Updated Active', description: 'Updated state' };
			const mockResponse = { id: stateId, config_id: configId, ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateState(configId, stateId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/configs/config-1/states/state-1',
				{ method: 'PATCH', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteState', () => {
		it('calls DELETE /governance/lifecycle/configs/:configId/states/:stateId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteState(configId, stateId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/configs/config-1/states/state-1',
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- Transitions ---

	describe('createTransition', () => {
		it('calls POST /governance/lifecycle/configs/:configId/transitions with body', async () => {
			const body = { name: 'activate', from_state_id: 'state-draft', to_state_id: 'state-active' };
			const mockResponse = { id: transitionId, config_id: configId, ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createTransition(configId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/configs/config-1/transitions',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteTransition', () => {
		it('calls DELETE /governance/lifecycle/configs/:configId/transitions/:transitionId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteTransition(configId, transitionId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/configs/config-1/transitions/trans-1',
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- Transition Conditions ---

	describe('getTransitionConditions', () => {
		it('calls GET /governance/lifecycle/configs/:configId/transitions/:transitionId/conditions', async () => {
			const mockResponse = { conditions: [{ id: 'cond-1', type: 'attribute', attribute: 'email', operator: 'is_not_empty' }] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getTransitionConditions(configId, transitionId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/configs/config-1/transitions/trans-1/conditions',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateTransitionConditions', () => {
		it('calls PUT /governance/lifecycle/configs/:configId/transitions/:transitionId/conditions with body', async () => {
			const body = { conditions: [{ type: 'attribute', attribute: 'status', operator: 'equals', value: 'verified' }] };
			const mockResponse = { conditions: [{ id: 'cond-1', ...body.conditions[0] }] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateTransitionConditions(configId, transitionId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/configs/config-1/transitions/trans-1/conditions',
				{ method: 'PUT', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('evaluateTransitionConditions', () => {
		it('calls POST /governance/lifecycle/configs/:configId/transitions/:transitionId/conditions/evaluate with body', async () => {
			const body = { context: { user_id: 'user-1', attributes: { email: 'test@example.com' } } };
			const mockResponse = { satisfied: true, results: [{ condition_id: 'cond-1', passed: true }] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await evaluateTransitionConditions(configId, transitionId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/configs/config-1/transitions/trans-1/conditions/evaluate',
				{ method: 'POST', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- State Actions ---

	describe('getStateActions', () => {
		it('calls GET /governance/lifecycle/configs/:configId/states/:stateId/actions', async () => {
			const mockResponse = { state_id: stateId, on_enter: [], on_exit: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getStateActions(configId, stateId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/configs/config-1/states/state-1/actions',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateStateActions', () => {
		it('calls PUT /governance/lifecycle/configs/:configId/states/:stateId/actions with body', async () => {
			const body = { on_enter: [{ type: 'webhook', url: 'https://example.com/hook' }], on_exit: [] };
			const mockResponse = { state_id: stateId, ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateStateActions(configId, stateId, body as any, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/lifecycle/configs/config-1/states/state-1/actions',
				{ method: 'PUT', body, token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- User Lifecycle Status ---

	describe('getUserLifecycleStatus', () => {
		it('calls GET /governance/users/:userId/lifecycle/status', async () => {
			const mockResponse = { user_id: 'user-1', current_state: 'active', config_id: configId, available_transitions: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getUserLifecycleStatus('user-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/users/user-1/lifecycle/status',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Error handling ---

	describe('error handling', () => {
		it('propagates errors from apiClient for GET requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Network error'));

			await expect(getLifecycleConfig(configId, token, tenantId, mockFetch)).rejects.toThrow('Network error');
		});

		it('propagates errors from apiClient for POST requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Server error'));

			await expect(
				createLifecycleConfig({} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Server error');
		});

		it('propagates errors from apiClient for PATCH requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Not found'));

			await expect(
				updateLifecycleConfig(configId, {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Not found');
		});

		it('propagates errors from apiClient for PUT requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Validation error'));

			await expect(
				updateTransitionConditions(configId, transitionId, {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Validation error');
		});

		it('propagates errors from apiClient for DELETE requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Forbidden'));

			await expect(
				deleteLifecycleConfig(configId, token, tenantId, mockFetch)
			).rejects.toThrow('Forbidden');
		});

		it('propagates errors from apiClient for state operations', async () => {
			mockApiClient.mockRejectedValue(new Error('State not found'));

			await expect(
				createState(configId, {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('State not found');
		});

		it('propagates errors from apiClient for transition operations', async () => {
			mockApiClient.mockRejectedValue(new Error('Transition conflict'));

			await expect(
				createTransition(configId, {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Transition conflict');
		});

		it('propagates errors from apiClient for user lifecycle status', async () => {
			mockApiClient.mockRejectedValue(new Error('Unauthorized'));

			await expect(
				getUserLifecycleStatus('user-1', token, tenantId, mockFetch)
			).rejects.toThrow('Unauthorized');
		});
	});
});
