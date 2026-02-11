import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	listArchetypes,
	createArchetype,
	getArchetype,
	updateArchetype,
	deleteArchetype,
	activateArchetype,
	deactivateArchetype,
	listPersonas,
	createPersona,
	getPersona,
	updatePersona,
	activatePersona,
	deactivatePersona,
	archivePersona
} from './personas';

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

describe('personas API — archetypes', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listArchetypes', () => {
		it('calls GET /governance/persona-archetypes with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 50, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listArchetypes({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/persona-archetypes', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes name_contains filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			await listArchetypes({ name_contains: 'admin' }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/persona-archetypes?name_contains=admin',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
		});

		it('includes is_active filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			await listArchetypes({ is_active: true }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith(
				'/governance/persona-archetypes?is_active=true',
				{ method: 'GET', token, tenantId, fetch: mockFetch }
			);
		});
	});

	describe('createArchetype', () => {
		it('calls POST /governance/persona-archetypes with body', async () => {
			const data = { name: 'Admin Template', naming_pattern: 'admin.{username}' };
			const mockResponse = { id: 'arch-1', ...data, description: null, attribute_mappings: {}, default_entitlements: null, lifecycle_policy: {}, is_active: true, personas_count: 0, created_at: '', updated_at: '' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createArchetype(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/persona-archetypes', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getArchetype', () => {
		it('calls GET /governance/persona-archetypes/:id', async () => {
			const mockResponse = { id: 'arch-1', name: 'Test', naming_pattern: 'test.{u}' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getArchetype('arch-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/persona-archetypes/arch-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updateArchetype', () => {
		it('calls PUT /governance/persona-archetypes/:id with body', async () => {
			const data = { name: 'Updated Name' };
			mockApiClient.mockResolvedValue({ id: 'arch-1', name: 'Updated Name' });

			await updateArchetype('arch-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/persona-archetypes/arch-1', {
				method: 'PUT',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('deleteArchetype', () => {
		it('calls DELETE /governance/persona-archetypes/:id', async () => {
			mockApiClient.mockResolvedValue(undefined);

			await deleteArchetype('arch-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/persona-archetypes/arch-1', {
				method: 'DELETE',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('activateArchetype', () => {
		it('calls POST /governance/persona-archetypes/:id/activate', async () => {
			mockApiClient.mockResolvedValue({ id: 'arch-1', is_active: true });

			await activateArchetype('arch-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/persona-archetypes/arch-1/activate', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('deactivateArchetype', () => {
		it('calls POST /governance/persona-archetypes/:id/deactivate', async () => {
			mockApiClient.mockResolvedValue({ id: 'arch-1', is_active: false });

			await deactivateArchetype('arch-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/persona-archetypes/arch-1/deactivate', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});
});

describe('personas API — personas', () => {
	const mockFetch = vi.fn();
	const token = 'test-token';
	const tenantId = 'test-tenant';

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('listPersonas', () => {
		it('calls GET /governance/personas with no params', async () => {
			const mockResponse = { items: [], total: 0, limit: 50, offset: 0 };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await listPersonas({}, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/personas', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});

		it('includes status filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			await listPersonas({ status: 'active' }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/personas?status=active', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});

		it('includes archetype_id filter in query string', async () => {
			mockApiClient.mockResolvedValue({ items: [], total: 0, limit: 50, offset: 0 });

			await listPersonas({ archetype_id: 'arch-1' }, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/personas?archetype_id=arch-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('createPersona', () => {
		it('calls POST /governance/personas with body', async () => {
			const data = { archetype_id: 'arch-1', physical_user_id: 'user-1' };
			const mockResponse = { id: 'persona-1', ...data, persona_name: 'test', display_name: 'Test', status: 'draft' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await createPersona(data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/personas', {
				method: 'POST',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('getPersona', () => {
		it('calls GET /governance/personas/:id', async () => {
			const mockResponse = { id: 'persona-1', persona_name: 'test', attributes: {} };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getPersona('persona-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/personas/persona-1', {
				method: 'GET',
				token,
				tenantId,
				fetch: mockFetch
			});
			expect(result).toEqual(mockResponse);
		});
	});

	describe('updatePersona', () => {
		it('calls PUT /governance/personas/:id with body', async () => {
			const data = { display_name: 'Updated Name' };
			mockApiClient.mockResolvedValue({ id: 'persona-1', display_name: 'Updated Name' });

			await updatePersona('persona-1', data, token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/personas/persona-1', {
				method: 'PUT',
				body: data,
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('activatePersona', () => {
		it('calls POST /governance/personas/:id/activate', async () => {
			mockApiClient.mockResolvedValue({ id: 'persona-1', status: 'active' });

			await activatePersona('persona-1', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/personas/persona-1/activate', {
				method: 'POST',
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('deactivatePersona', () => {
		it('calls POST /governance/personas/:id/deactivate with reason', async () => {
			mockApiClient.mockResolvedValue({ id: 'persona-1', status: 'suspended' });

			await deactivatePersona('persona-1', 'User changed roles', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/personas/persona-1/deactivate', {
				method: 'POST',
				body: { reason: 'User changed roles' },
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});

	describe('archivePersona', () => {
		it('calls POST /governance/personas/:id/archive with reason', async () => {
			mockApiClient.mockResolvedValue({ id: 'persona-1', status: 'archived' });

			await archivePersona('persona-1', 'No longer needed', token, tenantId, mockFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/governance/personas/persona-1/archive', {
				method: 'POST',
				body: { reason: 'No longer needed' },
				token,
				tenantId,
				fetch: mockFetch
			});
		});
	});
});
