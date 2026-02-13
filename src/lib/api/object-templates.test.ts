import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	createObjectTemplate,
	listObjectTemplates,
	getObjectTemplate,
	updateObjectTemplate,
	deleteObjectTemplate,
	activateObjectTemplate,
	disableObjectTemplate,
	listTemplateRules,
	createTemplateRule,
	updateTemplateRule,
	deleteTemplateRule,
	listTemplateScopes,
	createTemplateScope,
	deleteTemplateScope,
	listTemplateMergePolicies,
	createTemplateMergePolicy,
	updateTemplateMergePolicy,
	deleteTemplateMergePolicy,
	simulateTemplate
} from './object-templates';

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

describe('object-templates server API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';
	const templateId = 'tmpl-1';
	const ruleId = 'rule-1';
	const scopeId = 'scope-1';
	const policyId = 'policy-1';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Template CRUD ---

	describe('createObjectTemplate', () => {
		it('sends POST to /governance/object-templates', async () => {
			const body = { name: 'User Template', object_type: 'user', priority: 100 };
			const mockResponse = { id: templateId, ...body, status: 'draft', created_at: '2025-01-01', updated_at: '2025-01-01' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createObjectTemplate(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/object-templates', {
				method: 'POST',
				token,
				tenantId,
				body,
				fetch: mockFetch
			});
			expect(result.id).toBe(templateId);
		});
	});

	describe('listObjectTemplates', () => {
		it('sends GET with query params', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listObjectTemplates({ object_type: 'user', limit: 10 }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/object-templates?object_type=user&limit=10',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});

		it('sends GET without params when empty', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listObjectTemplates({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/object-templates',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
		});

		it('includes status filter', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listObjectTemplates({ status: 'active' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=active');
		});

		it('includes name filter', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 0 });

			await listObjectTemplates({ name: 'test' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('name=test');
		});

		it('includes offset param', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 20, offset: 20 });

			await listObjectTemplates({ offset: 20 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('offset=20');
		});
	});

	describe('getObjectTemplate', () => {
		it('sends GET to /governance/object-templates/:id', async () => {
			const mockResponse = { id: templateId, name: 'Test', rules: [], scopes: [], merge_policies: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getObjectTemplate(templateId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/object-templates/${templateId}`, {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.id).toBe(templateId);
		});
	});

	describe('updateObjectTemplate', () => {
		it('sends PUT to /governance/object-templates/:id', async () => {
			const body = { name: 'Updated Name', priority: 50 };
			mockApiClient.mockResolvedValue({ id: templateId, ...body });

			await updateObjectTemplate(templateId, body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/object-templates/${templateId}`, {
				method: 'PUT',
				token,
				tenantId,
				body,
				fetch: mockFetch
			});
		});
	});

	describe('deleteObjectTemplate', () => {
		it('sends DELETE to /governance/object-templates/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteObjectTemplate(templateId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/object-templates/${templateId}`, {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	// --- Lifecycle ---

	describe('activateObjectTemplate', () => {
		it('sends POST to /governance/object-templates/:id/activate', async () => {
			mockApiClient.mockResolvedValue({ id: templateId, status: 'active' });

			const result = await activateObjectTemplate(templateId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/object-templates/${templateId}/activate`, {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.status).toBe('active');
		});
	});

	describe('disableObjectTemplate', () => {
		it('sends POST to /governance/object-templates/:id/disable', async () => {
			mockApiClient.mockResolvedValue({ id: templateId, status: 'disabled' });

			const result = await disableObjectTemplate(templateId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/object-templates/${templateId}/disable`, {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result.status).toBe('disabled');
		});
	});

	// --- Rules ---

	describe('listTemplateRules', () => {
		it('sends GET to /governance/object-templates/:id/rules', async () => {
			const mockResponse = { items: [], total: 0, limit: 20, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listTemplateRules(templateId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/object-templates/${templateId}/rules`, {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createTemplateRule', () => {
		it('sends POST to /governance/object-templates/:id/rules', async () => {
			const body = {
				rule_type: 'default',
				target_attribute: 'department',
				expression: "'Engineering'",
				strength: 'normal',
				authoritative: true,
				priority: 100,
				exclusive: false
			};
			mockApiClient.mockResolvedValue({ id: ruleId, template_id: templateId, ...body });

			const result = await createTemplateRule(templateId, body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/object-templates/${templateId}/rules`, {
				method: 'POST',
				token,
				tenantId,
				body,
				fetch: mockFetch
			});
			expect(result.id).toBe(ruleId);
		});
	});

	describe('updateTemplateRule', () => {
		it('sends PUT to /governance/object-templates/:id/rules/:ruleId', async () => {
			const body = { expression: 'source.department', priority: 200 };
			mockApiClient.mockResolvedValue({ id: ruleId, ...body });

			await updateTemplateRule(templateId, ruleId, body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/object-templates/${templateId}/rules/${ruleId}`,
				{ method: 'PUT', token, tenantId, body, fetch: mockFetch }
			);
		});
	});

	describe('deleteTemplateRule', () => {
		it('sends DELETE to /governance/object-templates/:id/rules/:ruleId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteTemplateRule(templateId, ruleId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/object-templates/${templateId}/rules/${ruleId}`,
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- Scopes ---

	describe('listTemplateScopes', () => {
		it('sends GET to /governance/object-templates/:id/scopes', async () => {
			const mockResponse = { items: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listTemplateScopes(templateId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/object-templates/${templateId}/scopes`, {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createTemplateScope', () => {
		it('sends POST to /governance/object-templates/:id/scopes', async () => {
			const body = { scope_type: 'organization', scope_value: 'Engineering' };
			mockApiClient.mockResolvedValue({ id: scopeId, template_id: templateId, ...body });

			const result = await createTemplateScope(templateId, body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(`/governance/object-templates/${templateId}/scopes`, {
				method: 'POST',
				token,
				tenantId,
				body,
				fetch: mockFetch
			});
			expect(result.id).toBe(scopeId);
		});
	});

	describe('deleteTemplateScope', () => {
		it('sends DELETE to /governance/object-templates/:id/scopes/:scopeId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteTemplateScope(templateId, scopeId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/object-templates/${templateId}/scopes/${scopeId}`,
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- Merge Policies ---

	describe('listTemplateMergePolicies', () => {
		it('sends GET to /governance/object-templates/:id/merge-policies', async () => {
			const mockResponse = { items: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listTemplateMergePolicies(templateId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/object-templates/${templateId}/merge-policies`,
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createTemplateMergePolicy', () => {
		it('sends POST to /governance/object-templates/:id/merge-policies', async () => {
			const body = { attribute: 'department', strategy: 'source_precedence', null_handling: 'merge' };
			mockApiClient.mockResolvedValue({ id: policyId, template_id: templateId, ...body });

			const result = await createTemplateMergePolicy(templateId, body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/object-templates/${templateId}/merge-policies`,
				{ method: 'POST', token, tenantId, body, fetch: mockFetch }
			);
			expect(result.id).toBe(policyId);
		});
	});

	describe('updateTemplateMergePolicy', () => {
		it('sends PUT to /governance/object-templates/:id/merge-policies/:policyId', async () => {
			const body = { strategy: 'timestamp_wins' };
			mockApiClient.mockResolvedValue({ id: policyId, ...body });

			await updateTemplateMergePolicy(templateId, policyId, body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/object-templates/${templateId}/merge-policies/${policyId}`,
				{ method: 'PUT', token, tenantId, body, fetch: mockFetch }
			);
		});
	});

	describe('deleteTemplateMergePolicy', () => {
		it('sends DELETE to /governance/object-templates/:id/merge-policies/:policyId', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteTemplateMergePolicy(templateId, policyId, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/object-templates/${templateId}/merge-policies/${policyId}`,
				{ method: 'DELETE', token, tenantId, fetch: mockFetch }
			);
		});
	});

	// --- Simulation ---

	describe('simulateTemplate', () => {
		it('sends POST to /governance/object-templates/:id/simulate', async () => {
			const body = { sample_object: '{"department":"","title":"Engineer"}' };
			const mockResponse = {
				template_id: templateId,
				rules_applied: [],
				validation_errors: [],
				computed_values: {},
				affected_count: 0
			};
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await simulateTemplate(templateId, body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				`/governance/object-templates/${templateId}/simulate`,
				{ method: 'POST', token, tenantId, body, fetch: mockFetch }
			);
			expect(result.template_id).toBe(templateId);
			expect(result.rules_applied).toEqual([]);
			expect(result.affected_count).toBe(0);
		});
	});
});
