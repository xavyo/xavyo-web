import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('object-templates-client', () => {
	const mockFetch = vi.fn();
	const originalFetch = globalThis.fetch;

	beforeEach(() => {
		mockFetch.mockReset();
		globalThis.fetch = mockFetch as unknown as typeof fetch;
		vi.resetModules();
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
	});

	// --- Templates ---

	describe('fetchObjectTemplates', () => {
		it('fetches from /api/governance/object-templates', async () => {
			const data = { items: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchObjectTemplates } = await import('./object-templates-client');

			const result = await fetchObjectTemplates();

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates', {
				credentials: 'same-origin'
			});
			expect(result).toEqual(data);
		});

		it('includes query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchObjectTemplates } = await import('./object-templates-client');

			await fetchObjectTemplates({ object_type: 'user', status: 'active', limit: 10, offset: 20 });

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('object_type=user');
			expect(calledUrl).toContain('status=active');
			expect(calledUrl).toContain('limit=10');
			expect(calledUrl).toContain('offset=20');
		});

		it('includes name filter', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ items: [], total: 0 }));
			const { fetchObjectTemplates } = await import('./object-templates-client');

			await fetchObjectTemplates({ name: 'test' });

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('name=test');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchObjectTemplates } = await import('./object-templates-client');

			await expect(fetchObjectTemplates()).rejects.toThrow('Failed to fetch object templates: 500');
		});
	});

	describe('fetchObjectTemplate', () => {
		it('fetches from /api/governance/object-templates/:id', async () => {
			const data = { id: 't-1', name: 'Test', rules: [], scopes: [], merge_policies: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchObjectTemplate } = await import('./object-templates-client');

			const result = await fetchObjectTemplate('t-1');

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1', {
				credentials: 'same-origin'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { fetchObjectTemplate } = await import('./object-templates-client');

			await expect(fetchObjectTemplate('bad')).rejects.toThrow('Failed to fetch object template: 404');
		});
	});

	describe('deleteObjectTemplateClient', () => {
		it('sends DELETE to /api/governance/object-templates/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteObjectTemplateClient } = await import('./object-templates-client');

			await deleteObjectTemplateClient('t-1');

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1', {
				method: 'DELETE',
				credentials: 'same-origin'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 403));
			const { deleteObjectTemplateClient } = await import('./object-templates-client');

			await expect(deleteObjectTemplateClient('t-1')).rejects.toThrow('Failed to delete object template: 403');
		});
	});

	describe('activateObjectTemplateClient', () => {
		it('sends POST to /api/governance/object-templates/:id/activate', async () => {
			const data = { id: 't-1', status: 'active' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { activateObjectTemplateClient } = await import('./object-templates-client');

			const result = await activateObjectTemplateClient('t-1');

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1/activate', {
				method: 'POST',
				credentials: 'same-origin'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { activateObjectTemplateClient } = await import('./object-templates-client');

			await expect(activateObjectTemplateClient('t-1')).rejects.toThrow('Failed to activate object template: 400');
		});
	});

	describe('disableObjectTemplateClient', () => {
		it('sends POST to /api/governance/object-templates/:id/disable', async () => {
			const data = { id: 't-1', status: 'disabled' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { disableObjectTemplateClient } = await import('./object-templates-client');

			const result = await disableObjectTemplateClient('t-1');

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1/disable', {
				method: 'POST',
				credentials: 'same-origin'
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { disableObjectTemplateClient } = await import('./object-templates-client');

			await expect(disableObjectTemplateClient('t-1')).rejects.toThrow('Failed to disable object template: 400');
		});
	});

	// --- Rules ---

	describe('fetchTemplateRules', () => {
		it('fetches from /api/governance/object-templates/:id/rules and unwraps items', async () => {
			const rules = [
				{ id: 'r-1', rule_type: 'default', target_attribute: 'dept', expression: "'Eng'" }
			];
			mockFetch.mockResolvedValueOnce(mockResponse({ items: rules }));
			const { fetchTemplateRules } = await import('./object-templates-client');

			const result = await fetchTemplateRules('t-1');

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1/rules', {
				credentials: 'same-origin'
			});
			expect(result).toEqual(rules);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchTemplateRules } = await import('./object-templates-client');

			await expect(fetchTemplateRules('t-1')).rejects.toThrow('Failed to fetch template rules: 500');
		});
	});

	describe('createTemplateRuleClient', () => {
		it('sends POST to /api/governance/object-templates/:id/rules', async () => {
			const body = { rule_type: 'default', target_attribute: 'dept', expression: "'Eng'" };
			const data = { id: 'r-1', template_id: 't-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createTemplateRuleClient } = await import('./object-templates-client');

			const result = await createTemplateRuleClient('t-1', body);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1/rules', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createTemplateRuleClient } = await import('./object-templates-client');

			await expect(createTemplateRuleClient('t-1', {})).rejects.toThrow('Failed to create template rule: 400');
		});
	});

	describe('updateTemplateRuleClient', () => {
		it('sends PUT to /api/governance/object-templates/:id/rules/:ruleId', async () => {
			const body = { expression: 'source.dept', priority: 200 };
			const data = { id: 'r-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { updateTemplateRuleClient } = await import('./object-templates-client');

			const result = await updateTemplateRuleClient('t-1', 'r-1', body);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1/rules/r-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 422));
			const { updateTemplateRuleClient } = await import('./object-templates-client');

			await expect(updateTemplateRuleClient('t-1', 'r-1', {})).rejects.toThrow('Failed to update template rule: 422');
		});
	});

	describe('deleteTemplateRuleClient', () => {
		it('sends DELETE to /api/governance/object-templates/:id/rules/:ruleId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteTemplateRuleClient } = await import('./object-templates-client');

			await deleteTemplateRuleClient('t-1', 'r-1');

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1/rules/r-1', {
				method: 'DELETE',
				credentials: 'same-origin'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteTemplateRuleClient } = await import('./object-templates-client');

			await expect(deleteTemplateRuleClient('t-1', 'bad')).rejects.toThrow('Failed to delete template rule: 404');
		});
	});

	// --- Scopes ---

	describe('fetchTemplateScopes', () => {
		it('fetches from /api/governance/object-templates/:id/scopes and unwraps items', async () => {
			const scopes = [{ id: 's-1', scope_type: 'global', scope_value: null }];
			mockFetch.mockResolvedValueOnce(mockResponse({ items: scopes }));
			const { fetchTemplateScopes } = await import('./object-templates-client');

			const result = await fetchTemplateScopes('t-1');

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1/scopes', {
				credentials: 'same-origin'
			});
			expect(result).toEqual(scopes);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchTemplateScopes } = await import('./object-templates-client');

			await expect(fetchTemplateScopes('t-1')).rejects.toThrow('Failed to fetch template scopes: 500');
		});
	});

	describe('createTemplateScopeClient', () => {
		it('sends POST to /api/governance/object-templates/:id/scopes', async () => {
			const body = { scope_type: 'organization', scope_value: 'Engineering' };
			const data = { id: 's-1', template_id: 't-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createTemplateScopeClient } = await import('./object-templates-client');

			const result = await createTemplateScopeClient('t-1', body);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1/scopes', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createTemplateScopeClient } = await import('./object-templates-client');

			await expect(createTemplateScopeClient('t-1', {})).rejects.toThrow('Failed to create template scope: 400');
		});
	});

	describe('deleteTemplateScopeClient', () => {
		it('sends DELETE to /api/governance/object-templates/:id/scopes/:scopeId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteTemplateScopeClient } = await import('./object-templates-client');

			await deleteTemplateScopeClient('t-1', 's-1');

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1/scopes/s-1', {
				method: 'DELETE',
				credentials: 'same-origin'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteTemplateScopeClient } = await import('./object-templates-client');

			await expect(deleteTemplateScopeClient('t-1', 'bad')).rejects.toThrow('Failed to delete template scope: 404');
		});
	});

	// --- Merge Policies ---

	describe('fetchMergePolicies', () => {
		it('fetches from /api/governance/object-templates/:id/merge-policies and unwraps items', async () => {
			const policies = [
				{ id: 'mp-1', attribute: 'dept', strategy: 'source_precedence', null_handling: 'merge' }
			];
			mockFetch.mockResolvedValueOnce(mockResponse({ items: policies }));
			const { fetchMergePolicies } = await import('./object-templates-client');

			const result = await fetchMergePolicies('t-1');

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1/merge-policies', {
				credentials: 'same-origin'
			});
			expect(result).toEqual(policies);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { fetchMergePolicies } = await import('./object-templates-client');

			await expect(fetchMergePolicies('t-1')).rejects.toThrow('Failed to fetch merge policies: 500');
		});
	});

	describe('createMergePolicyClient', () => {
		it('sends POST to /api/governance/object-templates/:id/merge-policies', async () => {
			const body = { attribute: 'dept', strategy: 'source_precedence', null_handling: 'merge' };
			const data = { id: 'mp-1', template_id: 't-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createMergePolicyClient } = await import('./object-templates-client');

			const result = await createMergePolicyClient('t-1', body);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1/merge-policies', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { createMergePolicyClient } = await import('./object-templates-client');

			await expect(createMergePolicyClient('t-1', {})).rejects.toThrow('Failed to create merge policy: 400');
		});
	});

	describe('updateMergePolicyClient', () => {
		it('sends PUT to /api/governance/object-templates/:id/merge-policies/:policyId', async () => {
			const body = { strategy: 'timestamp_wins' };
			const data = { id: 'mp-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { updateMergePolicyClient } = await import('./object-templates-client');

			const result = await updateMergePolicyClient('t-1', 'mp-1', body);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1/merge-policies/mp-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 400));
			const { updateMergePolicyClient } = await import('./object-templates-client');

			await expect(updateMergePolicyClient('t-1', 'mp-1', {})).rejects.toThrow('Failed to update merge policy: 400');
		});
	});

	describe('deleteMergePolicyClient', () => {
		it('sends DELETE to /api/governance/object-templates/:id/merge-policies/:policyId', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteMergePolicyClient } = await import('./object-templates-client');

			await deleteMergePolicyClient('t-1', 'mp-1');

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1/merge-policies/mp-1', {
				method: 'DELETE',
				credentials: 'same-origin'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 404));
			const { deleteMergePolicyClient } = await import('./object-templates-client');

			await expect(deleteMergePolicyClient('t-1', 'bad')).rejects.toThrow('Failed to delete merge policy: 404');
		});
	});

	// --- Simulation ---

	describe('simulateTemplateClient', () => {
		it('sends POST to /api/governance/object-templates/:id/simulate', async () => {
			const sampleObject = { department: '', title: 'Engineer' };
			const data = {
				template_id: 't-1',
				rules_applied: [],
				validation_errors: [],
				computed_values: {},
				affected_count: 0
			};
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { simulateTemplateClient } = await import('./object-templates-client');

			const result = await simulateTemplateClient('t-1', sampleObject);

			expect(mockFetch).toHaveBeenCalledWith('/api/governance/object-templates/t-1/simulate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'same-origin',
				body: JSON.stringify(sampleObject)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, false, 500));
			const { simulateTemplateClient } = await import('./object-templates-client');

			await expect(simulateTemplateClient('t-1', {})).rejects.toThrow('Failed to simulate template: 500');
		});
	});
});
