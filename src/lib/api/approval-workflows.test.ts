import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listApprovalWorkflows,
	createApprovalWorkflow,
	getApprovalWorkflow,
	updateApprovalWorkflow,
	deleteApprovalWorkflow,
	setDefaultWorkflow,
	listApprovalGroups,
	createApprovalGroup,
	getApprovalGroup,
	updateApprovalGroup,
	deleteApprovalGroup,
	enableApprovalGroup,
	disableApprovalGroup,
	addGroupMembers,
	removeGroupMembers,
	listEscalationPolicies,
	createEscalationPolicy,
	getEscalationPolicy,
	updateEscalationPolicy,
	deleteEscalationPolicy,
	setDefaultEscalationPolicy,
	addEscalationLevel,
	removeEscalationLevel,
	getEscalationHistory,
	cancelEscalation,
	resetEscalation,
	listSodExemptions,
	createSodExemption,
	getSodExemption,
	revokeSodExemption
} from './approval-workflows';

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

describe('Approval Workflows API — Workflows', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listApprovalWorkflows', () => {
		it('calls GET /governance/approval-workflows with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listApprovalWorkflows({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/approval-workflows', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 5 });

			await listApprovalWorkflows({ limit: 10, offset: 5 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('5');
		});
	});

	describe('createApprovalWorkflow', () => {
		it('calls POST /governance/approval-workflows with body', async () => {
			const data = { name: 'Standard Approval', description: 'Default workflow' };
			mockApiClient.mockResolvedValue({ id: 'wf-1', ...data });

			const result = await createApprovalWorkflow(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/approval-workflows', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('getApprovalWorkflow', () => {
		it('calls GET /governance/approval-workflows/:id', async () => {
			mockApiClient.mockResolvedValue({ id: 'wf-1', name: 'Standard Approval' });

			await getApprovalWorkflow('wf-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/approval-workflows/wf-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('updateApprovalWorkflow', () => {
		it('calls PUT /governance/approval-workflows/:id with body', async () => {
			const data = { name: 'Updated Workflow' };
			mockApiClient.mockResolvedValue({ id: 'wf-1', ...data });

			await updateApprovalWorkflow('wf-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/approval-workflows/wf-1', {
				method: 'PUT',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('deleteApprovalWorkflow', () => {
		it('calls DELETE /governance/approval-workflows/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteApprovalWorkflow('wf-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/approval-workflows/wf-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('setDefaultWorkflow', () => {
		it('calls POST /governance/approval-workflows/:id/set-default', async () => {
			mockApiClient.mockResolvedValue({ id: 'wf-1', is_default: true });

			const result = await setDefaultWorkflow('wf-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/approval-workflows/wf-1/set-default',
				{
					method: 'POST',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toBeDefined();
		});
	});

});

describe('Approval Workflows API — Groups', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listApprovalGroups', () => {
		it('calls GET /governance/approval-groups with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listApprovalGroups({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/approval-groups', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 20 });

			await listApprovalGroups({ limit: 10, offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('20');
		});
	});

	describe('createApprovalGroup', () => {
		it('calls POST /governance/approval-groups with body', async () => {
			const data = { name: 'Security Reviewers', description: 'Security team' };
			mockApiClient.mockResolvedValue({ id: 'grp-1', ...data });

			const result = await createApprovalGroup(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/approval-groups', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('getApprovalGroup', () => {
		it('calls GET /governance/approval-groups/:id', async () => {
			mockApiClient.mockResolvedValue({ id: 'grp-1', name: 'Security Reviewers' });

			await getApprovalGroup('grp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/approval-groups/grp-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('updateApprovalGroup', () => {
		it('calls PUT /governance/approval-groups/:id with body', async () => {
			const data = { name: 'Updated Group' };
			mockApiClient.mockResolvedValue({ id: 'grp-1', ...data });

			await updateApprovalGroup('grp-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/approval-groups/grp-1', {
				method: 'PUT',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('deleteApprovalGroup', () => {
		it('calls DELETE /governance/approval-groups/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteApprovalGroup('grp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/approval-groups/grp-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('enableApprovalGroup', () => {
		it('calls POST /governance/approval-groups/:id/enable', async () => {
			mockApiClient.mockResolvedValue({ id: 'grp-1', is_active: true });

			const result = await enableApprovalGroup('grp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/approval-groups/grp-1/enable', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('disableApprovalGroup', () => {
		it('calls POST /governance/approval-groups/:id/disable', async () => {
			mockApiClient.mockResolvedValue({ id: 'grp-1', is_active: false });

			const result = await disableApprovalGroup('grp-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/approval-groups/grp-1/disable', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('addGroupMembers', () => {
		it('calls POST /governance/approval-groups/:id/members with body', async () => {
			const data = { member_ids: ['user-1'] };
			mockApiClient.mockResolvedValue({ id: 'grp-1', member_ids: ['user-1'] });

			const result = await addGroupMembers('grp-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/approval-groups/grp-1/members',
				{
					method: 'POST',
					body: data,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toBeDefined();
		});
	});

	describe('removeGroupMembers', () => {
		it('calls DELETE /governance/approval-groups/:groupId/members with body', async () => {
			const data = { member_ids: ['user-1'] };
			mockApiClient.mockResolvedValue({ id: 'grp-1', member_ids: [] });

			await removeGroupMembers('grp-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/approval-groups/grp-1/members',
				{
					method: 'DELETE',
					body: data,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});
	});
});

describe('Approval Workflows API — Escalation Policies', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listEscalationPolicies', () => {
		it('calls GET /governance/escalation-policies with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listEscalationPolicies({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/escalation-policies', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 5 });

			await listEscalationPolicies({ limit: 10, offset: 5 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('limit')).toBe('10');
			expect(params.get('offset')).toBe('5');
		});
	});

	describe('createEscalationPolicy', () => {
		it('calls POST /governance/escalation-policies with body', async () => {
			const data = {
				name: 'Default Escalation',
				description: 'Standard escalation',
				default_timeout_secs: 86400,
				final_fallback: 'auto_reject' as const
			};
			mockApiClient.mockResolvedValue({ id: 'esc-1', ...data });

			const result = await createEscalationPolicy(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/escalation-policies', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('getEscalationPolicy', () => {
		it('calls GET /governance/escalation-policies/:id', async () => {
			mockApiClient.mockResolvedValue({ id: 'esc-1', name: 'Default Escalation' });

			await getEscalationPolicy('esc-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/escalation-policies/esc-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('updateEscalationPolicy', () => {
		it('calls PUT /governance/escalation-policies/:id with body', async () => {
			const data = { name: 'Updated Policy' };
			mockApiClient.mockResolvedValue({ id: 'esc-1', ...data });

			await updateEscalationPolicy('esc-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/escalation-policies/esc-1', {
				method: 'PUT',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('deleteEscalationPolicy', () => {
		it('calls DELETE /governance/escalation-policies/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteEscalationPolicy('esc-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/escalation-policies/esc-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('setDefaultEscalationPolicy', () => {
		it('calls POST /governance/escalation-policies/:id/set-default', async () => {
			mockApiClient.mockResolvedValue({ id: 'esc-1', is_default: true });

			const result = await setDefaultEscalationPolicy('esc-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/escalation-policies/esc-1/set-default',
				{
					method: 'POST',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toBeDefined();
		});
	});

	describe('addEscalationLevel', () => {
		it('calls POST /governance/escalation-policies/:id/levels with body', async () => {
			const data = {
				level_order: 1,
				timeout_secs: 86400,
				target_type: 'approval_group' as const,
				target_id: 'grp-1'
			};
			mockApiClient.mockResolvedValue({ id: 'level-1', ...data });

			const result = await addEscalationLevel('esc-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/escalation-policies/esc-1/levels',
				{
					method: 'POST',
					body: data,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toBeDefined();
		});
	});

	describe('removeEscalationLevel', () => {
		it('calls DELETE /governance/escalation-policies/:policyId/levels/:levelId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await removeEscalationLevel('esc-1', 'level-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/escalation-policies/esc-1/levels/level-1',
				{
					method: 'DELETE',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
		});
	});
});

describe('Approval Workflows API — Escalation History', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getEscalationHistory', () => {
		it('calls GET /governance/access-requests/:id/escalation-history', async () => {
			const mockResponse = { entries: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getEscalationHistory('req-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/access-requests/req-1/escalation-history',
				{
					method: 'GET',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('cancelEscalation', () => {
		it('calls POST /governance/access-requests/:id/cancel-escalation', async () => {
			mockApiClient.mockResolvedValue({ success: true });

			const result = await cancelEscalation('req-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/access-requests/req-1/cancel-escalation',
				{
					method: 'POST',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual({ success: true });
		});
	});

	describe('resetEscalation', () => {
		it('calls POST /governance/access-requests/:id/reset-escalation', async () => {
			mockApiClient.mockResolvedValue({ success: true });

			const result = await resetEscalation('req-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/access-requests/req-1/reset-escalation',
				{
					method: 'POST',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual({ success: true });
		});
	});
});

describe('Approval Workflows API — SoD Exemptions', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listSodExemptions', () => {
		it('calls GET /governance/sod-exemptions with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listSodExemptions({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sod-exemptions', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes status and pagination params in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 10, offset: 0 });

			await listSodExemptions(
				{ status: 'active', limit: 10, offset: 0 },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			const params = new URLSearchParams(calledPath.split('?')[1]);
			expect(params.get('status')).toBe('active');
			expect(params.get('limit')).toBe('10');
		});
	});

	describe('createSodExemption', () => {
		it('calls POST /governance/sod-exemptions with body', async () => {
			const data = {
				rule_id: 'sod-1',
				user_id: 'user-1',
				justification: 'Required for quarterly audit processing',
				expires_at: '2026-12-31T00:00:00Z'
			};
			mockApiClient.mockResolvedValue({ id: 'exempt-1', ...data });

			const result = await createSodExemption(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sod-exemptions', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toBeDefined();
		});
	});

	describe('getSodExemption', () => {
		it('calls GET /governance/sod-exemptions/:id', async () => {
			mockApiClient.mockResolvedValue({ id: 'exempt-1', status: 'active' });

			await getSodExemption('exempt-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/sod-exemptions/exempt-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('revokeSodExemption', () => {
		it('calls POST /governance/sod-exemptions/:id/revoke', async () => {
			mockApiClient.mockResolvedValue({ id: 'exempt-1', status: 'revoked' });

			const result = await revokeSodExemption('exempt-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/sod-exemptions/exempt-1/revoke',
				{
					method: 'POST',
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toBeDefined();
		});
	});
});
