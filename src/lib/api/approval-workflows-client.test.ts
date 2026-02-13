import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('approval-workflows-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.resetModules();
	});

	// --- Workflows ---

	describe('fetchApprovalWorkflows', () => {
		it('fetches from /api/governance/approval-workflows with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchApprovalWorkflows } = await import('./approval-workflows-client');

			const result = await fetchApprovalWorkflows({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/approval-workflows');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchApprovalWorkflows } = await import('./approval-workflows-client');

			await fetchApprovalWorkflows({ limit: 10, offset: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchApprovalWorkflows } = await import('./approval-workflows-client');

			await expect(fetchApprovalWorkflows({}, mockFetch)).rejects.toThrow(
				'Failed to fetch workflows: 500'
			);
		});
	});

	describe('fetchApprovalWorkflow', () => {
		it('fetches from /api/governance/approval-workflows/:id', async () => {
			const data = { id: 'wf-1', name: 'Standard Approval' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchApprovalWorkflow } = await import('./approval-workflows-client');

			const result = await fetchApprovalWorkflow('wf-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/approval-workflows/wf-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchApprovalWorkflow } = await import('./approval-workflows-client');

			await expect(fetchApprovalWorkflow('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch workflow: 404'
			);
		});
	});

	describe('createApprovalWorkflowClient', () => {
		it('sends POST to /api/governance/approval-workflows with body', async () => {
			const created = { id: 'wf-1', name: 'Standard Approval' };
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { createApprovalWorkflowClient } = await import('./approval-workflows-client');

			const body = { name: 'Standard Approval', description: 'Default workflow' };
			const result = await createApprovalWorkflowClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/approval-workflows', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createApprovalWorkflowClient } = await import('./approval-workflows-client');

			await expect(
				createApprovalWorkflowClient({ name: 'X' }, mockFetch)
			).rejects.toThrow('Failed to create workflow: 400');
		});
	});

	describe('updateApprovalWorkflowClient', () => {
		it('sends PUT to /api/governance/approval-workflows/:id with body', async () => {
			const updated = { id: 'wf-1', name: 'Updated' };
			mockFetch.mockResolvedValueOnce(mockResponse(updated));
			const { updateApprovalWorkflowClient } = await import('./approval-workflows-client');

			const body = { name: 'Updated' };
			const result = await updateApprovalWorkflowClient('wf-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/approval-workflows/wf-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(updated);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateApprovalWorkflowClient } = await import('./approval-workflows-client');

			await expect(
				updateApprovalWorkflowClient('wf-1', { name: 'X' }, mockFetch)
			).rejects.toThrow('Failed to update workflow: 422');
		});
	});

	describe('deleteApprovalWorkflowClient', () => {
		it('sends DELETE to /api/governance/approval-workflows/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteApprovalWorkflowClient } = await import('./approval-workflows-client');

			await deleteApprovalWorkflowClient('wf-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/approval-workflows/wf-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteApprovalWorkflowClient } = await import('./approval-workflows-client');

			await expect(deleteApprovalWorkflowClient('bad-id', mockFetch)).rejects.toThrow(
				'Failed to delete workflow: 404'
			);
		});
	});

	describe('setDefaultWorkflowClient', () => {
		it('sends POST to /api/governance/approval-workflows/:id/set-default', async () => {
			const data = { id: 'wf-1', is_default: true };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { setDefaultWorkflowClient } = await import('./approval-workflows-client');

			const result = await setDefaultWorkflowClient('wf-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/approval-workflows/wf-1/set-default',
				{ method: 'POST' }
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { setDefaultWorkflowClient } = await import('./approval-workflows-client');

			await expect(setDefaultWorkflowClient('wf-1', mockFetch)).rejects.toThrow(
				'Failed to set default workflow: 400'
			);
		});
	});

	// --- Groups ---

	describe('fetchApprovalGroups', () => {
		it('fetches from /api/governance/approval-groups with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchApprovalGroups } = await import('./approval-workflows-client');

			const result = await fetchApprovalGroups({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/approval-groups');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchApprovalGroups } = await import('./approval-workflows-client');

			await expect(fetchApprovalGroups({}, mockFetch)).rejects.toThrow(
				'Failed to fetch groups: 500'
			);
		});
	});

	describe('fetchApprovalGroup', () => {
		it('fetches from /api/governance/approval-groups/:id', async () => {
			const data = { id: 'grp-1', name: 'Security Reviewers' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchApprovalGroup } = await import('./approval-workflows-client');

			const result = await fetchApprovalGroup('grp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/approval-groups/grp-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchApprovalGroup } = await import('./approval-workflows-client');

			await expect(fetchApprovalGroup('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch group: 404'
			);
		});
	});

	describe('createApprovalGroupClient', () => {
		it('sends POST to /api/governance/approval-groups with body', async () => {
			const created = { id: 'grp-1', name: 'Security Reviewers' };
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { createApprovalGroupClient } = await import('./approval-workflows-client');

			const body = { name: 'Security Reviewers', description: 'Security team' };
			const result = await createApprovalGroupClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/approval-groups', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createApprovalGroupClient } = await import('./approval-workflows-client');

			await expect(
				createApprovalGroupClient({ name: 'X' }, mockFetch)
			).rejects.toThrow('Failed to create group: 400');
		});
	});

	describe('updateApprovalGroupClient', () => {
		it('sends PUT to /api/governance/approval-groups/:id with body', async () => {
			const updated = { id: 'grp-1', name: 'Updated' };
			mockFetch.mockResolvedValueOnce(mockResponse(updated));
			const { updateApprovalGroupClient } = await import('./approval-workflows-client');

			const body = { name: 'Updated' };
			const result = await updateApprovalGroupClient('grp-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/approval-groups/grp-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(updated);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateApprovalGroupClient } = await import('./approval-workflows-client');

			await expect(
				updateApprovalGroupClient('grp-1', { name: 'X' }, mockFetch)
			).rejects.toThrow('Failed to update group: 422');
		});
	});

	describe('deleteApprovalGroupClient', () => {
		it('sends DELETE to /api/governance/approval-groups/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteApprovalGroupClient } = await import('./approval-workflows-client');

			await deleteApprovalGroupClient('grp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/approval-groups/grp-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteApprovalGroupClient } = await import('./approval-workflows-client');

			await expect(deleteApprovalGroupClient('bad-id', mockFetch)).rejects.toThrow(
				'Failed to delete group: 404'
			);
		});
	});

	describe('enableApprovalGroupClient', () => {
		it('sends POST to /api/governance/approval-groups/:id/enable', async () => {
			const data = { id: 'grp-1', is_active: true };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { enableApprovalGroupClient } = await import('./approval-workflows-client');

			const result = await enableApprovalGroupClient('grp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/approval-groups/grp-1/enable', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { enableApprovalGroupClient } = await import('./approval-workflows-client');

			await expect(enableApprovalGroupClient('grp-1', mockFetch)).rejects.toThrow(
				'Failed to enable group: 400'
			);
		});
	});

	describe('disableApprovalGroupClient', () => {
		it('sends POST to /api/governance/approval-groups/:id/disable', async () => {
			const data = { id: 'grp-1', is_active: false };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { disableApprovalGroupClient } = await import('./approval-workflows-client');

			const result = await disableApprovalGroupClient('grp-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/approval-groups/grp-1/disable', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { disableApprovalGroupClient } = await import('./approval-workflows-client');

			await expect(disableApprovalGroupClient('grp-1', mockFetch)).rejects.toThrow(
				'Failed to disable group: 400'
			);
		});
	});

	describe('addGroupMembersClient', () => {
		it('sends POST to /api/governance/approval-groups/:id/members with body', async () => {
			const result_data = { id: 'grp-1', member_ids: ['user-1'] };
			mockFetch.mockResolvedValueOnce(mockResponse(result_data));
			const { addGroupMembersClient } = await import('./approval-workflows-client');

			const body = { member_ids: ['user-1'] };
			const result = await addGroupMembersClient('grp-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/approval-groups/grp-1/members', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(result_data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { addGroupMembersClient } = await import('./approval-workflows-client');

			await expect(
				addGroupMembersClient('grp-1', { member_ids: ['u'] }, mockFetch)
			).rejects.toThrow('Failed to add members: 400');
		});
	});

	describe('removeGroupMembersClient', () => {
		it('sends DELETE to /api/governance/approval-groups/:groupId/members with body', async () => {
			const result_data = { id: 'grp-1', member_ids: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(result_data));
			const { removeGroupMembersClient } = await import('./approval-workflows-client');

			const body = { member_ids: ['user-1'] };
			const result = await removeGroupMembersClient('grp-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/approval-groups/grp-1/members',
				{
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);
			expect(result).toEqual(result_data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { removeGroupMembersClient } = await import('./approval-workflows-client');

			await expect(
				removeGroupMembersClient('grp-1', { member_ids: ['bad-user'] }, mockFetch)
			).rejects.toThrow('Failed to remove members: 404');
		});
	});

	// --- Escalation Policies ---

	describe('fetchEscalationPolicies', () => {
		it('fetches from /api/governance/escalation-policies with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchEscalationPolicies } = await import('./approval-workflows-client');

			const result = await fetchEscalationPolicies({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/escalation-policies');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchEscalationPolicies } = await import('./approval-workflows-client');

			await expect(fetchEscalationPolicies({}, mockFetch)).rejects.toThrow(
				'Failed to fetch escalation policies: 500'
			);
		});
	});

	describe('fetchEscalationPolicy', () => {
		it('fetches from /api/governance/escalation-policies/:id', async () => {
			const data = { id: 'esc-1', name: 'Default Escalation' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchEscalationPolicy } = await import('./approval-workflows-client');

			const result = await fetchEscalationPolicy('esc-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/escalation-policies/esc-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchEscalationPolicy } = await import('./approval-workflows-client');

			await expect(fetchEscalationPolicy('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch escalation policy: 404'
			);
		});
	});

	describe('createEscalationPolicyClient', () => {
		it('sends POST to /api/governance/escalation-policies with body', async () => {
			const created = { id: 'esc-1', name: 'Default Escalation' };
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { createEscalationPolicyClient } = await import('./approval-workflows-client');

			const body = {
				name: 'Default Escalation',
				description: 'Standard escalation',
				default_timeout_secs: 86400,
				final_fallback: 'auto_reject' as const
			};
			const result = await createEscalationPolicyClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/escalation-policies', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createEscalationPolicyClient } = await import('./approval-workflows-client');

			await expect(
				createEscalationPolicyClient(
					{ name: 'X', default_timeout_secs: 86400, final_fallback: 'auto_reject' as const },
					mockFetch
				)
			).rejects.toThrow('Failed to create escalation policy: 400');
		});
	});

	describe('updateEscalationPolicyClient', () => {
		it('sends PUT to /api/governance/escalation-policies/:id with body', async () => {
			const updated = { id: 'esc-1', name: 'Updated' };
			mockFetch.mockResolvedValueOnce(mockResponse(updated));
			const { updateEscalationPolicyClient } = await import('./approval-workflows-client');

			const body = { name: 'Updated' };
			const result = await updateEscalationPolicyClient('esc-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/escalation-policies/esc-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(updated);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateEscalationPolicyClient } = await import('./approval-workflows-client');

			await expect(
				updateEscalationPolicyClient('esc-1', { name: 'X' }, mockFetch)
			).rejects.toThrow('Failed to update escalation policy: 422');
		});
	});

	describe('deleteEscalationPolicyClient', () => {
		it('sends DELETE to /api/governance/escalation-policies/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteEscalationPolicyClient } = await import('./approval-workflows-client');

			await deleteEscalationPolicyClient('esc-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/escalation-policies/esc-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteEscalationPolicyClient } = await import('./approval-workflows-client');

			await expect(deleteEscalationPolicyClient('bad-id', mockFetch)).rejects.toThrow(
				'Failed to delete escalation policy: 404'
			);
		});
	});

	describe('setDefaultEscalationPolicyClient', () => {
		it('sends POST to /api/governance/escalation-policies/:id/set-default', async () => {
			const data = { id: 'esc-1', is_default: true };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { setDefaultEscalationPolicyClient } = await import('./approval-workflows-client');

			const result = await setDefaultEscalationPolicyClient('esc-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/escalation-policies/esc-1/set-default',
				{ method: 'POST' }
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { setDefaultEscalationPolicyClient } = await import('./approval-workflows-client');

			await expect(
				setDefaultEscalationPolicyClient('esc-1', mockFetch)
			).rejects.toThrow('Failed to set default policy: 400');
		});
	});

	describe('addEscalationLevelClient', () => {
		it('sends POST to /api/governance/escalation-policies/:id/levels with body', async () => {
			const created = {
				id: 'level-1',
				level_order: 1,
				timeout_secs: 86400,
				target_type: 'approval_group'
			};
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { addEscalationLevelClient } = await import('./approval-workflows-client');

			const body = {
				level_order: 1,
				timeout_secs: 86400,
				target_type: 'approval_group' as const,
				target_id: 'grp-1'
			};
			const result = await addEscalationLevelClient('esc-1', body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/escalation-policies/esc-1/levels',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { addEscalationLevelClient } = await import('./approval-workflows-client');

			await expect(
				addEscalationLevelClient(
					'esc-1',
					{ level_order: 1, timeout_secs: 86400, target_type: 'manager' as const },
					mockFetch
				)
			).rejects.toThrow('Failed to add level: 400');
		});
	});

	describe('removeEscalationLevelClient', () => {
		it('sends DELETE to /api/governance/escalation-policies/:policyId/levels/:levelId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { removeEscalationLevelClient } = await import('./approval-workflows-client');

			await removeEscalationLevelClient('esc-1', 'level-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/escalation-policies/esc-1/levels/level-1',
				{ method: 'DELETE' }
			);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { removeEscalationLevelClient } = await import('./approval-workflows-client');

			await expect(
				removeEscalationLevelClient('esc-1', 'bad-level', mockFetch)
			).rejects.toThrow('Failed to remove level: 404');
		});
	});

	// --- Escalation History ---

	describe('fetchEscalationHistory', () => {
		it('fetches from /api/governance/access-requests/:id/escalation-history', async () => {
			const data = { entries: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchEscalationHistory } = await import('./approval-workflows-client');

			const result = await fetchEscalationHistory('req-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/access-requests/req-1/escalation-history'
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchEscalationHistory } = await import('./approval-workflows-client');

			await expect(fetchEscalationHistory('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch escalation history: 404'
			);
		});
	});

	describe('cancelEscalationClient', () => {
		it('sends POST to /api/governance/access-requests/:id/cancel-escalation', async () => {
			const data = { success: true };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { cancelEscalationClient } = await import('./approval-workflows-client');

			const result = await cancelEscalationClient('req-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/access-requests/req-1/cancel-escalation',
				{ method: 'POST' }
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { cancelEscalationClient } = await import('./approval-workflows-client');

			await expect(cancelEscalationClient('req-1', mockFetch)).rejects.toThrow(
				'Failed to cancel escalation: 400'
			);
		});
	});

	describe('resetEscalationClient', () => {
		it('sends POST to /api/governance/access-requests/:id/reset-escalation', async () => {
			const data = { success: true };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { resetEscalationClient } = await import('./approval-workflows-client');

			const result = await resetEscalationClient('req-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/governance/access-requests/req-1/reset-escalation',
				{ method: 'POST' }
			);
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { resetEscalationClient } = await import('./approval-workflows-client');

			await expect(resetEscalationClient('req-1', mockFetch)).rejects.toThrow(
				'Failed to reset escalation: 400'
			);
		});
	});

	// --- SoD Exemptions ---

	describe('fetchSodExemptions', () => {
		it('fetches from /api/governance/sod-exemptions with no params', async () => {
			const data = { items: [], total: 0, limit: 20, offset: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchSodExemptions } = await import('./approval-workflows-client');

			const result = await fetchSodExemptions({}, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/sod-exemptions');
			expect(result).toEqual(data);
		});

		it('includes query params in URL', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchSodExemptions } = await import('./approval-workflows-client');

			await fetchSodExemptions({ status: 'active', limit: 10, offset: 5 }, mockFetch);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=active');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=5');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchSodExemptions } = await import('./approval-workflows-client');

			await expect(fetchSodExemptions({}, mockFetch)).rejects.toThrow(
				'Failed to fetch exemptions: 500'
			);
		});
	});

	describe('fetchSodExemption', () => {
		it('fetches from /api/governance/sod-exemptions/:id', async () => {
			const data = { id: 'exempt-1', status: 'active' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchSodExemption } = await import('./approval-workflows-client');

			const result = await fetchSodExemption('exempt-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/sod-exemptions/exempt-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchSodExemption } = await import('./approval-workflows-client');

			await expect(fetchSodExemption('bad-id', mockFetch)).rejects.toThrow(
				'Failed to fetch exemption: 404'
			);
		});
	});

	describe('createSodExemptionClient', () => {
		it('sends POST to /api/governance/sod-exemptions with body', async () => {
			const created = { id: 'exempt-1', rule_id: 'sod-1', user_id: 'user-1' };
			mockFetch.mockResolvedValueOnce(mockResponse(created));
			const { createSodExemptionClient } = await import('./approval-workflows-client');

			const body = {
				rule_id: 'sod-1',
				user_id: 'user-1',
				justification: 'Required for quarterly audit processing',
				expires_at: '2026-12-31T00:00:00Z'
			};
			const result = await createSodExemptionClient(body, mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/sod-exemptions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(created);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createSodExemptionClient } = await import('./approval-workflows-client');

			await expect(
				createSodExemptionClient(
					{
						rule_id: 'sod-1',
						user_id: 'user-1',
						justification: 'test reason text',
						expires_at: '2026-12-31T00:00:00Z'
					},
					mockFetch
				)
			).rejects.toThrow('Failed to create exemption: 400');
		});
	});

	describe('revokeSodExemptionClient', () => {
		it('sends POST to /api/governance/sod-exemptions/:id/revoke', async () => {
			const data = { id: 'exempt-1', status: 'revoked' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { revokeSodExemptionClient } = await import('./approval-workflows-client');

			const result = await revokeSodExemptionClient('exempt-1', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/sod-exemptions/exempt-1/revoke', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { revokeSodExemptionClient } = await import('./approval-workflows-client');

			await expect(revokeSodExemptionClient('exempt-1', mockFetch)).rejects.toThrow(
				'Failed to revoke exemption: 400'
			);
		});
	});
});
