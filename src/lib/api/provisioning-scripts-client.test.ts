import { vi, describe, it, expect, beforeEach } from 'vitest';

function mockResponse(data: unknown, ok = true, status = 200) {
	return {
		ok,
		status,
		json: () => Promise.resolve(data)
	};
}

describe('provisioning-scripts-client', () => {
	const mockFetch = vi.fn();

	beforeEach(() => {
		mockFetch.mockReset();
		vi.stubGlobal('fetch', mockFetch);
		vi.resetModules();
	});

	// --- Scripts ---

	describe('fetchScripts', () => {
		it('fetches from /api/provisioning-scripts', async () => {
			const data = { scripts: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchScripts } = await import('./provisioning-scripts-client');

			const result = await fetchScripts();

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toBe('/api/provisioning-scripts');
			expect(result).toEqual(data);
		});

		it('includes query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ scripts: [], total: 0 }));
			const { fetchScripts } = await import('./provisioning-scripts-client');

			await fetchScripts({ status: 'active', search: 'email', page: 2, page_size: 10 });

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('status=active');
			expect(calledUrl).toContain('search=email');
			expect(calledUrl).toContain('page=2');
			expect(calledUrl).toContain('page_size=10');
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ error: 'Unauthorized' }, false, 401));
			const { fetchScripts } = await import('./provisioning-scripts-client');

			await expect(fetchScripts()).rejects.toThrow('Unauthorized');
		});

		it('throws generic error when response body cannot be parsed', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: () => Promise.reject(new Error('parse error'))
			});
			const { fetchScripts } = await import('./provisioning-scripts-client');

			await expect(fetchScripts()).rejects.toThrow('Request failed');
		});
	});

	describe('fetchScript', () => {
		it('fetches from /api/provisioning-scripts/:id', async () => {
			const data = { id: 'script-1', name: 'My Script' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchScript } = await import('./provisioning-scripts-client');

			const result = await fetchScript('script-1');

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toBe('/api/provisioning-scripts/script-1');
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ error: 'Not found' }, false, 404));
			const { fetchScript } = await import('./provisioning-scripts-client');

			await expect(fetchScript('bad')).rejects.toThrow('Not found');
		});
	});

	describe('createScriptClient', () => {
		it('sends POST to /api/provisioning-scripts', async () => {
			const body = { name: 'New Script', description: 'Desc' };
			const data = { id: 'script-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createScriptClient } = await import('./provisioning-scripts-client');

			const result = await createScriptClient(body);

			expect(mockFetch).toHaveBeenCalledWith('/api/provisioning-scripts', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ error: 'Validation error' }, false, 400));
			const { createScriptClient } = await import('./provisioning-scripts-client');

			await expect(createScriptClient({ name: '' })).rejects.toThrow('Validation error');
		});
	});

	describe('updateScriptClient', () => {
		it('sends PUT to /api/provisioning-scripts/:id', async () => {
			const body = { name: 'Updated' };
			const data = { id: 'script-1', name: 'Updated' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { updateScriptClient } = await import('./provisioning-scripts-client');

			const result = await updateScriptClient('script-1', body);

			expect(mockFetch).toHaveBeenCalledWith('/api/provisioning-scripts/script-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});
	});

	describe('deleteScriptClient', () => {
		it('sends DELETE to /api/provisioning-scripts/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteScriptClient } = await import('./provisioning-scripts-client');

			await deleteScriptClient('script-1');

			expect(mockFetch).toHaveBeenCalledWith('/api/provisioning-scripts/script-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ error: 'Cannot delete' }, false, 409));
			const { deleteScriptClient } = await import('./provisioning-scripts-client');

			await expect(deleteScriptClient('script-1')).rejects.toThrow('Cannot delete');
		});

		it('throws default message when error body cannot be parsed', async () => {
			mockFetch.mockResolvedValueOnce({
				ok: false,
				status: 500,
				json: () => Promise.reject(new Error('parse'))
			});
			const { deleteScriptClient } = await import('./provisioning-scripts-client');

			await expect(deleteScriptClient('script-1')).rejects.toThrow('Delete failed');
		});
	});

	describe('activateScriptClient', () => {
		it('sends POST to /api/provisioning-scripts/:id/activate', async () => {
			const data = { id: 'script-1', status: 'active' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { activateScriptClient } = await import('./provisioning-scripts-client');

			const result = await activateScriptClient('script-1');

			expect(mockFetch).toHaveBeenCalledWith('/api/provisioning-scripts/script-1/activate', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});
	});

	describe('deactivateScriptClient', () => {
		it('sends POST to /api/provisioning-scripts/:id/deactivate', async () => {
			const data = { id: 'script-1', status: 'inactive' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { deactivateScriptClient } = await import('./provisioning-scripts-client');

			const result = await deactivateScriptClient('script-1');

			expect(mockFetch).toHaveBeenCalledWith('/api/provisioning-scripts/script-1/deactivate', {
				method: 'POST'
			});
			expect(result).toEqual(data);
		});
	});

	// --- Versions ---

	describe('fetchVersions', () => {
		it('fetches from /api/provisioning-scripts/:scriptId/versions', async () => {
			const data = { versions: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchVersions } = await import('./provisioning-scripts-client');

			const result = await fetchVersions('script-1');

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toBe('/api/provisioning-scripts/script-1/versions');
			expect(result).toEqual(data);
		});
	});

	describe('fetchVersion', () => {
		it('fetches from /api/provisioning-scripts/:scriptId/versions/:versionNumber', async () => {
			const data = { script_id: 'script-1', version_number: 2, script_body: 'code' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchVersion } = await import('./provisioning-scripts-client');

			const result = await fetchVersion('script-1', 2);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toBe('/api/provisioning-scripts/script-1/versions/2');
			expect(result).toEqual(data);
		});
	});

	describe('createVersionClient', () => {
		it('sends POST to /api/provisioning-scripts/:scriptId/versions', async () => {
			const body = { script_body: 'return true;', change_description: 'Initial' };
			const data = { script_id: 'script-1', version_number: 1, ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createVersionClient } = await import('./provisioning-scripts-client');

			const result = await createVersionClient('script-1', body);

			expect(mockFetch).toHaveBeenCalledWith('/api/provisioning-scripts/script-1/versions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});
	});

	describe('compareVersionsClient', () => {
		it('fetches compare URL with from and to params', async () => {
			const data = { from_version: 1, to_version: 3, diff: '...' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { compareVersionsClient } = await import('./provisioning-scripts-client');

			const result = await compareVersionsClient('script-1', 1, 3);

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toBe(
				'/api/provisioning-scripts/script-1/versions/compare?from=1&to=3'
			);
			expect(result).toEqual(data);
		});
	});

	describe('rollbackScriptClient', () => {
		it('sends POST to /api/provisioning-scripts/:scriptId/rollback', async () => {
			const body = { target_version: 2, reason: 'Revert bug' };
			const data = { script_id: 'script-1', version_number: 2 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { rollbackScriptClient } = await import('./provisioning-scripts-client');

			const result = await rollbackScriptClient('script-1', body);

			expect(mockFetch).toHaveBeenCalledWith('/api/provisioning-scripts/script-1/rollback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});
	});

	// --- Bindings ---

	describe('fetchBindings', () => {
		it('fetches from /api/provisioning-scripts/bindings', async () => {
			const data = { bindings: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchBindings } = await import('./provisioning-scripts-client');

			const result = await fetchBindings();

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toBe('/api/provisioning-scripts/bindings');
			expect(result).toEqual(data);
		});

		it('includes query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ bindings: [], total: 0 }));
			const { fetchBindings } = await import('./provisioning-scripts-client');

			await fetchBindings({
				connector_id: 'conn-1',
				script_id: 'script-1',
				hook_phase: 'after',
				operation_type: 'update',
				page: 1,
				page_size: 5
			});

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('connector_id=conn-1');
			expect(calledUrl).toContain('script_id=script-1');
			expect(calledUrl).toContain('hook_phase=after');
			expect(calledUrl).toContain('operation_type=update');
			expect(calledUrl).toContain('page=1');
			expect(calledUrl).toContain('page_size=5');
		});
	});

	describe('fetchBinding', () => {
		it('fetches from /api/provisioning-scripts/bindings/:id', async () => {
			const data = { id: 'binding-1', script_id: 'script-1' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchBinding } = await import('./provisioning-scripts-client');

			const result = await fetchBinding('binding-1');

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toBe('/api/provisioning-scripts/bindings/binding-1');
			expect(result).toEqual(data);
		});
	});

	describe('createBindingClient', () => {
		it('sends POST to /api/provisioning-scripts/bindings', async () => {
			const body = {
				script_id: 'script-1',
				connector_id: 'conn-1',
				hook_phase: 'before',
				operation_type: 'create',
				execution_order: 0
			};
			const data = { id: 'binding-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createBindingClient } = await import('./provisioning-scripts-client');

			const result = await createBindingClient(body);

			expect(mockFetch).toHaveBeenCalledWith('/api/provisioning-scripts/bindings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});
	});

	describe('updateBindingClient', () => {
		it('sends PUT to /api/provisioning-scripts/bindings/:id', async () => {
			const body = { execution_order: 3, enabled: false };
			const data = { id: 'binding-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { updateBindingClient } = await import('./provisioning-scripts-client');

			const result = await updateBindingClient('binding-1', body);

			expect(mockFetch).toHaveBeenCalledWith('/api/provisioning-scripts/bindings/binding-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});
	});

	describe('deleteBindingClient', () => {
		it('sends DELETE to /api/provisioning-scripts/bindings/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteBindingClient } = await import('./provisioning-scripts-client');

			await deleteBindingClient('binding-1');

			expect(mockFetch).toHaveBeenCalledWith('/api/provisioning-scripts/bindings/binding-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ error: 'Cannot delete' }, false, 409));
			const { deleteBindingClient } = await import('./provisioning-scripts-client');

			await expect(deleteBindingClient('binding-1')).rejects.toThrow('Cannot delete');
		});
	});

	describe('fetchBindingsByConnector', () => {
		it('fetches from /api/provisioning-scripts/connectors/:connectorId/bindings', async () => {
			const data = { bindings: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchBindingsByConnector } = await import('./provisioning-scripts-client');

			const result = await fetchBindingsByConnector('conn-1');

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toBe('/api/provisioning-scripts/connectors/conn-1/bindings');
			expect(result).toEqual(data);
		});
	});

	// --- Templates ---

	describe('fetchTemplates', () => {
		it('fetches from /api/provisioning-scripts/templates', async () => {
			const data = { templates: [], total: 0 };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchTemplates } = await import('./provisioning-scripts-client');

			const result = await fetchTemplates();

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toBe('/api/provisioning-scripts/templates');
			expect(result).toEqual(data);
		});

		it('includes query params', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse({ templates: [], total: 0 }));
			const { fetchTemplates } = await import('./provisioning-scripts-client');

			await fetchTemplates({ category: 'custom', search: 'map', page: 1, page_size: 20 });

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toContain('category=custom');
			expect(calledUrl).toContain('search=map');
			expect(calledUrl).toContain('page=1');
			expect(calledUrl).toContain('page_size=20');
		});
	});

	describe('fetchTemplate', () => {
		it('fetches from /api/provisioning-scripts/templates/:id', async () => {
			const data = { id: 'tmpl-1', name: 'Email Template' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { fetchTemplate } = await import('./provisioning-scripts-client');

			const result = await fetchTemplate('tmpl-1');

			const calledUrl = mockFetch.mock.calls[0][0] as string;
			expect(calledUrl).toBe('/api/provisioning-scripts/templates/tmpl-1');
			expect(result).toEqual(data);
		});
	});

	describe('createTemplateClient', () => {
		it('sends POST to /api/provisioning-scripts/templates', async () => {
			const body = {
				name: 'New Template',
				category: 'attribute_mapping',
				template_body: 'return val;'
			};
			const data = { id: 'tmpl-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { createTemplateClient } = await import('./provisioning-scripts-client');

			const result = await createTemplateClient(body);

			expect(mockFetch).toHaveBeenCalledWith('/api/provisioning-scripts/templates', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});
	});

	describe('updateTemplateClient', () => {
		it('sends PUT to /api/provisioning-scripts/templates/:id', async () => {
			const body = { name: 'Updated', template_body: 'return true;' };
			const data = { id: 'tmpl-1', ...body };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { updateTemplateClient } = await import('./provisioning-scripts-client');

			const result = await updateTemplateClient('tmpl-1', body);

			expect(mockFetch).toHaveBeenCalledWith('/api/provisioning-scripts/templates/tmpl-1', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			});
			expect(result).toEqual(data);
		});
	});

	describe('deleteTemplateClient', () => {
		it('sends DELETE to /api/provisioning-scripts/templates/:id', async () => {
			mockFetch.mockResolvedValueOnce(mockResponse(null, true, 204));
			const { deleteTemplateClient } = await import('./provisioning-scripts-client');

			await deleteTemplateClient('tmpl-1');

			expect(mockFetch).toHaveBeenCalledWith('/api/provisioning-scripts/templates/tmpl-1', {
				method: 'DELETE'
			});
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(
				mockResponse({ error: 'Template in use' }, false, 409)
			);
			const { deleteTemplateClient } = await import('./provisioning-scripts-client');

			await expect(deleteTemplateClient('tmpl-1')).rejects.toThrow('Template in use');
		});
	});

	describe('instantiateTemplateClient', () => {
		it('sends POST to /api/provisioning-scripts/templates/:templateId/instantiate', async () => {
			const body = { name: 'From Template', description: 'Desc' };
			const data = { id: 'script-new', name: 'From Template' };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { instantiateTemplateClient } = await import('./provisioning-scripts-client');

			const result = await instantiateTemplateClient('tmpl-1', body);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/provisioning-scripts/templates/tmpl-1/instantiate',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(body)
				}
			);
			expect(result).toEqual(data);
		});
	});

	// --- Validate & Dry-run ---

	describe('validateScriptClient', () => {
		it('sends POST to /api/provisioning-scripts/validate', async () => {
			const data = { valid: true, errors: [] };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { validateScriptClient } = await import('./provisioning-scripts-client');

			const result = await validateScriptClient('return user.email;');

			expect(mockFetch).toHaveBeenCalledWith('/api/provisioning-scripts/validate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ script_body: 'return user.email;' })
			});
			expect(result).toEqual(data);
		});

		it('throws on non-ok response', async () => {
			mockFetch.mockResolvedValueOnce(
				mockResponse({ error: 'Syntax error' }, false, 400)
			);
			const { validateScriptClient } = await import('./provisioning-scripts-client');

			await expect(validateScriptClient('bad code')).rejects.toThrow('Syntax error');
		});
	});

	describe('dryRunScriptClient', () => {
		it('sends POST to /api/provisioning-scripts/dry-run', async () => {
			const context = { user: { name: 'John' } };
			const data = { success: true, output: { email: 'john@test.com' } };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { dryRunScriptClient } = await import('./provisioning-scripts-client');

			const result = await dryRunScriptClient(context);

			expect(mockFetch).toHaveBeenCalledWith('/api/provisioning-scripts/dry-run', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ context })
			});
			expect(result).toEqual(data);
		});
	});

	describe('dryRunVersionClient', () => {
		it('sends POST to /api/provisioning-scripts/:scriptId/versions/:versionNumber/dry-run', async () => {
			const context = { user: { name: 'Jane' } };
			const data = { success: true, output: {} };
			mockFetch.mockResolvedValueOnce(mockResponse(data));
			const { dryRunVersionClient } = await import('./provisioning-scripts-client');

			const result = await dryRunVersionClient('script-1', 2, context);

			expect(mockFetch).toHaveBeenCalledWith(
				'/api/provisioning-scripts/script-1/versions/2/dry-run',
				{
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ context })
				}
			);
			expect(result).toEqual(data);
		});
	});
});
