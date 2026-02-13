import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('lifecycle-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- Configs ---

	describe('fetchLifecycleConfigs', () => {
		it('fetches from /api/governance/lifecycle/configs', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchLifecycleConfigs } = await import('./lifecycle-client');

			const result = await fetchLifecycleConfigs({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/configs');
			expect(result).toEqual(data);
		});

		it('includes query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0, limit: 10, offset: 20 }));
			const { fetchLifecycleConfigs } = await import('./lifecycle-client');

			await fetchLifecycleConfigs({ object_type: 'user', is_active: true, limit: 10, offset: 20 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('object_type=user');
			expect(calledUrl).toContain('is_active=true');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchLifecycleConfigs } = await import('./lifecycle-client');

			await expect(fetchLifecycleConfigs({}, mockFetch)).rejects.toThrow('Failed to fetch lifecycle configs: 500');
		});
	});

	describe('createLifecycleConfigClient', () => {
		it('sends POST to /api/governance/lifecycle/configs', async () => {
			const body = { name: 'User Lifecycle', object_type: 'user', description: 'Default user lifecycle' };
			const data = { id: 'cfg-1', ...body, is_active: false };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createLifecycleConfigClient } = await import('./lifecycle-client');

			const result = await createLifecycleConfigClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/configs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createLifecycleConfigClient } = await import('./lifecycle-client');

			await expect(createLifecycleConfigClient({ name: 'Test', object_type: 'user' }, mockFetch)).rejects.toThrow('Failed to create lifecycle config: 400');
		});
	});

	describe('fetchLifecycleConfig', () => {
		it('fetches from /api/governance/lifecycle/configs/:configId', async () => {
			const data = { id: 'cfg-1', name: 'User Lifecycle', states: [], transitions: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchLifecycleConfig } = await import('./lifecycle-client');

			const result = await fetchLifecycleConfig('cfg-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/configs/cfg-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchLifecycleConfig } = await import('./lifecycle-client');

			await expect(fetchLifecycleConfig('bad', mockFetch)).rejects.toThrow('Failed to fetch lifecycle config: 404');
		});
	});

	describe('updateLifecycleConfigClient', () => {
		it('sends PATCH to /api/governance/lifecycle/configs/:configId', async () => {
			const body = { name: 'Updated Lifecycle', is_active: true };
			const data = { id: 'cfg-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { updateLifecycleConfigClient } = await import('./lifecycle-client');

			const result = await updateLifecycleConfigClient('cfg-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/configs/cfg-1', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateLifecycleConfigClient } = await import('./lifecycle-client');

			await expect(updateLifecycleConfigClient('cfg-1', { name: 'Bad' }, mockFetch)).rejects.toThrow('Failed to update lifecycle config: 422');
		});
	});

	describe('deleteLifecycleConfigClient', () => {
		it('sends DELETE to /api/governance/lifecycle/configs/:configId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteLifecycleConfigClient } = await import('./lifecycle-client');

			await deleteLifecycleConfigClient('cfg-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/configs/cfg-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteLifecycleConfigClient } = await import('./lifecycle-client');

			await expect(deleteLifecycleConfigClient('bad', mockFetch)).rejects.toThrow('Failed to delete lifecycle config: 404');
		});
	});

	// --- States ---

	describe('addState', () => {
		it('sends POST to /api/governance/lifecycle/configs/:configId/states', async () => {
			const body = { name: 'Active', description: 'Active state', is_initial: true, is_terminal: false };
			const data = { id: 'state-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { addState } = await import('./lifecycle-client');

			const result = await addState('cfg-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/configs/cfg-1/states', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { addState } = await import('./lifecycle-client');

			await expect(addState('cfg-1', { name: 'Bad' }, mockFetch)).rejects.toThrow('Failed to add state: 400');
		});
	});

	describe('updateStateClient', () => {
		it('sends PATCH to /api/governance/lifecycle/configs/:configId/states/:stateId', async () => {
			const body = { name: 'Suspended', description: 'Updated description' };
			const data = { id: 'state-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { updateStateClient } = await import('./lifecycle-client');

			const result = await updateStateClient('cfg-1', 'state-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/configs/cfg-1/states/state-1', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateStateClient } = await import('./lifecycle-client');

			await expect(updateStateClient('cfg-1', 'state-1', { name: 'Bad' }, mockFetch)).rejects.toThrow('Failed to update state: 422');
		});
	});

	describe('deleteStateClient', () => {
		it('sends DELETE to /api/governance/lifecycle/configs/:configId/states/:stateId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteStateClient } = await import('./lifecycle-client');

			await deleteStateClient('cfg-1', 'state-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/configs/cfg-1/states/state-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteStateClient } = await import('./lifecycle-client');

			await expect(deleteStateClient('cfg-1', 'bad', mockFetch)).rejects.toThrow('Failed to delete state: 404');
		});
	});

	// --- Transitions ---

	describe('addTransition', () => {
		it('sends POST to /api/governance/lifecycle/configs/:configId/transitions', async () => {
			const body = { name: 'Activate', from_state_id: 'state-1', to_state_id: 'state-2', requires_approval: false };
			const data = { id: 'trans-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { addTransition } = await import('./lifecycle-client');

			const result = await addTransition('cfg-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/configs/cfg-1/transitions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { addTransition } = await import('./lifecycle-client');

			await expect(addTransition('cfg-1', { name: 'Bad', from_state_id: 'a', to_state_id: 'b' }, mockFetch)).rejects.toThrow('Failed to add transition: 400');
		});
	});

	describe('deleteTransitionClient', () => {
		it('sends DELETE to /api/governance/lifecycle/configs/:configId/transitions/:transitionId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteTransitionClient } = await import('./lifecycle-client');

			await deleteTransitionClient('cfg-1', 'trans-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/configs/cfg-1/transitions/trans-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteTransitionClient } = await import('./lifecycle-client');

			await expect(deleteTransitionClient('cfg-1', 'bad', mockFetch)).rejects.toThrow('Failed to delete transition: 404');
		});
	});

	// --- Transition Conditions ---

	describe('fetchConditions', () => {
		it('fetches from /api/governance/lifecycle/configs/:configId/transitions/:transitionId/conditions', async () => {
			const data = [{ id: 'cond-1', condition_type: 'attribute', attribute: 'role', operator: 'equals', value: 'admin' }];
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchConditions } = await import('./lifecycle-client');

			const result = await fetchConditions('cfg-1', 'trans-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/configs/cfg-1/transitions/trans-1/conditions');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchConditions } = await import('./lifecycle-client');

			await expect(fetchConditions('cfg-1', 'trans-1', mockFetch)).rejects.toThrow('Failed to fetch conditions: 500');
		});
	});

	describe('saveConditions', () => {
		it('sends PUT to /api/governance/lifecycle/configs/:configId/transitions/:transitionId/conditions', async () => {
			const body = { conditions: [{ condition_type: 'attribute', attribute: 'role', operator: 'equals', value: 'admin' }] };
			const data = [{ id: 'cond-1', ...body.conditions[0] }];
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { saveConditions } = await import('./lifecycle-client');

			const result = await saveConditions('cfg-1', 'trans-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/configs/cfg-1/transitions/trans-1/conditions', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { saveConditions } = await import('./lifecycle-client');

			await expect(saveConditions('cfg-1', 'trans-1', { conditions: [] } as any, mockFetch)).rejects.toThrow('Failed to save conditions: 422');
		});
	});

	describe('evaluateConditions', () => {
		it('sends POST to /api/governance/lifecycle/configs/:configId/transitions/:transitionId/conditions/evaluate', async () => {
			const context = { user_id: 'user-1', role: 'admin' };
			const data = { all_met: true, results: [{ condition_id: 'cond-1', met: true }] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { evaluateConditions } = await import('./lifecycle-client');

			const result = await evaluateConditions('cfg-1', 'trans-1', context, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/configs/cfg-1/transitions/trans-1/conditions/evaluate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(context)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { evaluateConditions } = await import('./lifecycle-client');

			await expect(evaluateConditions('cfg-1', 'trans-1', {}, mockFetch)).rejects.toThrow('Failed to evaluate conditions: 400');
		});
	});

	// --- State Actions ---

	describe('fetchStateActions', () => {
		it('fetches from /api/governance/lifecycle/configs/:configId/states/:stateId/actions', async () => {
			const data = [{ id: 'act-1', action_type: 'webhook', trigger: 'on_enter', config: {} }];
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchStateActions } = await import('./lifecycle-client');

			const result = await fetchStateActions('cfg-1', 'state-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/configs/cfg-1/states/state-1/actions');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchStateActions } = await import('./lifecycle-client');

			await expect(fetchStateActions('cfg-1', 'state-1', mockFetch)).rejects.toThrow('Failed to fetch state actions: 500');
		});
	});

	describe('saveStateActions', () => {
		it('sends PUT to /api/governance/lifecycle/configs/:configId/states/:stateId/actions', async () => {
			const body = { actions: [{ action_type: 'webhook', trigger: 'on_enter', config: { url: 'https://example.com' } }] };
			const data = { entry_actions: body.actions, exit_actions: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { saveStateActions } = await import('./lifecycle-client');

			const result = await saveStateActions('cfg-1', 'state-1', body as any, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/configs/cfg-1/states/state-1/actions', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { saveStateActions } = await import('./lifecycle-client');

			await expect(saveStateActions('cfg-1', 'state-1', { actions: [] } as any, mockFetch)).rejects.toThrow('Failed to save state actions: 422');
		});
	});

	// --- User Lifecycle Status ---

	describe('fetchUserLifecycleStatus', () => {
		it('fetches from /api/governance/lifecycle/user-status/:userId', async () => {
			const data = { user_id: 'user-1', current_state: 'active', config_id: 'cfg-1', history: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchUserLifecycleStatus } = await import('./lifecycle-client');

			const result = await fetchUserLifecycleStatus('user-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/lifecycle/user-status/user-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchUserLifecycleStatus } = await import('./lifecycle-client');

			await expect(fetchUserLifecycleStatus('bad', mockFetch)).rejects.toThrow('Failed to fetch user lifecycle status: 404');
		});
	});
});
