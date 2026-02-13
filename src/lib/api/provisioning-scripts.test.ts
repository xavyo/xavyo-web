import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listProvisioningScripts,
	createProvisioningScript,
	getProvisioningScript,
	updateProvisioningScript,
	deleteProvisioningScript,
	activateProvisioningScript,
	deactivateProvisioningScript,
	listScriptVersions,
	getScriptVersion,
	createScriptVersion,
	compareScriptVersions,
	rollbackScript,
	listHookBindings,
	createHookBinding,
	getHookBinding,
	updateHookBinding,
	deleteHookBinding,
	listBindingsByConnector,
	listScriptTemplates,
	createScriptTemplate,
	getScriptTemplate,
	updateScriptTemplate,
	deleteScriptTemplate,
	instantiateTemplate,
	validateScript,
	dryRunScript,
	dryRunScriptVersion
} from './provisioning-scripts';

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

describe('Provisioning Scripts API', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	// --- Provisioning Scripts ---

	describe('listProvisioningScripts', () => {
		it('calls GET /governance/scripts', async () => {
			const mockResponse = { scripts: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listProvisioningScripts({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/scripts', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes status query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listProvisioningScripts({ status: 'active' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('status=active');
		});

		it('includes search query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listProvisioningScripts({ search: 'email' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('search=email');
		});

		it('includes page and page_size query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listProvisioningScripts({ page: 2, page_size: 25 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('page=2');
			expect(calledPath).toContain('page_size=25');
		});
	});

	describe('createProvisioningScript', () => {
		it('calls POST /governance/scripts with body', async () => {
			const body = { name: 'Email Script', description: 'Maps emails' };
			const mockResponse = { id: 'script-1', ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createProvisioningScript(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/scripts', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getProvisioningScript', () => {
		it('calls GET /governance/scripts/:id', async () => {
			const mockResponse = { id: 'script-1', name: 'Email Script' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getProvisioningScript('script-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/scripts/script-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateProvisioningScript', () => {
		it('calls PUT /governance/scripts/:id with body', async () => {
			const body = { name: 'Updated Script', description: 'Updated' };
			const mockResponse = { id: 'script-1', ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateProvisioningScript('script-1', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/scripts/script-1', {
				method: 'PUT',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteProvisioningScript', () => {
		it('calls DELETE /governance/scripts/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteProvisioningScript('script-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/scripts/script-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('activateProvisioningScript', () => {
		it('calls POST /governance/scripts/:id/activate', async () => {
			const mockResponse = { id: 'script-1', status: 'active' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await activateProvisioningScript('script-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/scripts/script-1/activate', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deactivateProvisioningScript', () => {
		it('calls POST /governance/scripts/:id/deactivate', async () => {
			const mockResponse = { id: 'script-1', status: 'inactive' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await deactivateProvisioningScript('script-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/scripts/script-1/deactivate', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Script Versions ---

	describe('listScriptVersions', () => {
		it('calls GET /governance/scripts/:scriptId/versions', async () => {
			const mockResponse = { versions: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listScriptVersions('script-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/scripts/script-1/versions', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getScriptVersion', () => {
		it('calls GET /governance/scripts/:scriptId/versions/:versionNumber', async () => {
			const mockResponse = { script_id: 'script-1', version_number: 3, script_body: 'code' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getScriptVersion('script-1', 3, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/scripts/script-1/versions/3', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('createScriptVersion', () => {
		it('calls POST /governance/scripts/:scriptId/versions with body', async () => {
			const body = { script_body: 'return user.email;', change_description: 'Added email logic' };
			const mockResponse = { script_id: 'script-1', version_number: 2, ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createScriptVersion('script-1', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/scripts/script-1/versions', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('compareScriptVersions', () => {
		it('calls GET /governance/scripts/:scriptId/versions/compare with from and to', async () => {
			const mockResponse = { from_version: 1, to_version: 3, diff: 'some diff' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await compareScriptVersions('script-1', 1, 3, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('/governance/scripts/script-1/versions/compare');
			expect(calledPath).toContain('from=1');
			expect(calledPath).toContain('to=3');
			expect(result).toEqual(mockResponse);
		});
	});

	describe('rollbackScript', () => {
		it('calls POST /governance/scripts/:scriptId/rollback with body', async () => {
			const body = { target_version: 2, reason: 'Bug fix' };
			const mockResponse = { id: 'script-1', current_version: 2 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await rollbackScript('script-1', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/scripts/script-1/rollback', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Hook Bindings ---

	describe('listHookBindings', () => {
		it('calls GET /governance/script-bindings', async () => {
			const mockResponse = { bindings: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listHookBindings({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/script-bindings', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes connector_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listHookBindings({ connector_id: 'conn-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('connector_id=conn-1');
		});

		it('includes script_id query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listHookBindings({ script_id: 'script-1' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('script_id=script-1');
		});

		it('includes hook_phase and operation_type query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listHookBindings(
				{ hook_phase: 'before', operation_type: 'create' },
				token,
				tenantId,
				mockFetch
			);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('hook_phase=before');
			expect(calledPath).toContain('operation_type=create');
		});

		it('includes page and page_size query params', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listHookBindings({ page: 1, page_size: 10 }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('page=1');
			expect(calledPath).toContain('page_size=10');
		});
	});

	describe('createHookBinding', () => {
		it('calls POST /governance/script-bindings with body', async () => {
			const body = {
				script_id: 'script-1',
				connector_id: 'conn-1',
				hook_phase: 'before',
				operation_type: 'create',
				execution_order: 0,
				failure_policy: 'abort'
			} as any;
			const mockResponse = { id: 'binding-1', ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createHookBinding(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/script-bindings', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getHookBinding', () => {
		it('calls GET /governance/script-bindings/:id', async () => {
			const mockResponse = { id: 'binding-1', script_id: 'script-1' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getHookBinding('binding-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/script-bindings/binding-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateHookBinding', () => {
		it('calls PUT /governance/script-bindings/:id with body', async () => {
			const body = { execution_order: 5, failure_policy: 'retry' } as any;
			const mockResponse = { id: 'binding-1', ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateHookBinding('binding-1', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/script-bindings/binding-1', {
				method: 'PUT',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteHookBinding', () => {
		it('calls DELETE /governance/script-bindings/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteHookBinding('binding-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/script-bindings/binding-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('listBindingsByConnector', () => {
		it('calls GET /governance/connectors/:connectorId/script-bindings', async () => {
			const mockResponse = { bindings: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listBindingsByConnector('conn-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/connectors/conn-1/script-bindings',
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

	// --- Script Templates ---

	describe('listScriptTemplates', () => {
		it('calls GET /governance/script-templates', async () => {
			const mockResponse = { templates: [], total: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listScriptTemplates({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/script-templates', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes category query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listScriptTemplates({ category: 'attribute_mapping' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('category=attribute_mapping');
		});

		it('includes search query param', async () => {
			mockApiClient.mockResolvedValue({} as any);

			await listScriptTemplates({ search: 'email' }, token, tenantId, mockFetch);

			const calledPath = (mockApiClient.mock.calls[0] as unknown[])[0] as string;
			expect(calledPath).toContain('search=email');
		});
	});

	describe('createScriptTemplate', () => {
		it('calls POST /governance/script-templates with body', async () => {
			const body = {
				name: 'Email Template',
				category: 'attribute_mapping',
				template_body: 'return email;'
			} as any;
			const mockResponse = { id: 'tmpl-1', ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createScriptTemplate(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/script-templates', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getScriptTemplate', () => {
		it('calls GET /governance/script-templates/:id', async () => {
			const mockResponse = { id: 'tmpl-1', name: 'Email Template' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getScriptTemplate('tmpl-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/script-templates/tmpl-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateScriptTemplate', () => {
		it('calls PUT /governance/script-templates/:id with body', async () => {
			const body = { name: 'Updated Template', category: 'custom', template_body: 'new code' } as any;
			const mockResponse = { id: 'tmpl-1', ...body };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateScriptTemplate('tmpl-1', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/script-templates/tmpl-1', {
				method: 'PUT',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('deleteScriptTemplate', () => {
		it('calls DELETE /governance/script-templates/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteScriptTemplate('tmpl-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/script-templates/tmpl-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('instantiateTemplate', () => {
		it('calls POST /governance/script-templates/:templateId/instantiate with body', async () => {
			const body = { name: 'New Script', description: 'From template' };
			const mockResponse = { id: 'script-new', name: 'New Script' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await instantiateTemplate('tmpl-1', body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/script-templates/tmpl-1/instantiate',
				{
					method: 'POST',
					body,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Validate & Dry-Run ---

	describe('validateScript', () => {
		it('calls POST /governance/scripts/validate with body', async () => {
			const body = { script_body: 'return user.email;' };
			const mockResponse = { valid: true, errors: [] };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await validateScript(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/scripts/validate', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('dryRunScript', () => {
		it('calls POST /governance/scripts/dry-run with body', async () => {
			const body = { context: { user: { name: 'John' } } };
			const mockResponse = { success: true, output: { email: 'john@test.com' } };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await dryRunScript(body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/scripts/dry-run', {
				method: 'POST',
				body,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('dryRunScriptVersion', () => {
		it('calls POST /governance/scripts/:scriptId/versions/:versionNumber/dry-run with body', async () => {
			const body = { context: { user: { name: 'Jane' } } };
			const mockResponse = { success: true, output: { email: 'jane@test.com' } };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await dryRunScriptVersion('script-1', 2, body, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/scripts/script-1/versions/2/dry-run',
				{
					method: 'POST',
					body,
					token,
					tenantId,
					fetch: mockFetch
				}
			);
			expect(result).toEqual(mockResponse);
		});
	});

	// --- Error handling ---

	describe('error handling', () => {
		it('propagates errors from apiClient for GET requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Network error'));

			await expect(
				getProvisioningScript('script-1', token, tenantId, mockFetch)
			).rejects.toThrow('Network error');
		});

		it('propagates errors from apiClient for POST requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Server error'));

			await expect(
				createProvisioningScript({} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Server error');
		});

		it('propagates errors from apiClient for PUT requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Not found'));

			await expect(
				updateProvisioningScript('script-1', {} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Not found');
		});

		it('propagates errors from apiClient for DELETE requests', async () => {
			mockApiClient.mockRejectedValue(new Error('Forbidden'));

			await expect(
				deleteProvisioningScript('script-1', token, tenantId, mockFetch)
			).rejects.toThrow('Forbidden');
		});

		it('propagates errors for version operations', async () => {
			mockApiClient.mockRejectedValue(new Error('Version not found'));

			await expect(
				getScriptVersion('script-1', 99, token, tenantId, mockFetch)
			).rejects.toThrow('Version not found');
		});

		it('propagates errors for binding operations', async () => {
			mockApiClient.mockRejectedValue(new Error('Binding error'));

			await expect(
				createHookBinding({} as any, token, tenantId, mockFetch)
			).rejects.toThrow('Binding error');
		});

		it('propagates errors for template operations', async () => {
			mockApiClient.mockRejectedValue(new Error('Template error'));

			await expect(
				getScriptTemplate('tmpl-1', token, tenantId, mockFetch)
			).rejects.toThrow('Template error');
		});

		it('propagates errors for validate operation', async () => {
			mockApiClient.mockRejectedValue(new Error('Validation failed'));

			await expect(
				validateScript({ script_body: 'bad' }, token, tenantId, mockFetch)
			).rejects.toThrow('Validation failed');
		});

		it('propagates errors for dry-run operation', async () => {
			mockApiClient.mockRejectedValue(new Error('Dry-run failed'));

			await expect(
				dryRunScript({ context: {} }, token, tenantId, mockFetch)
			).rejects.toThrow('Dry-run failed');
		});
	});
});
