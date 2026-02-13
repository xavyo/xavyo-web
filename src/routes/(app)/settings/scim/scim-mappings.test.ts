import { describe, it, expect, vi, beforeEach } from 'vitest';

// --- Mocks ---

vi.mock('$lib/server/auth', () => ({
	hasAdminRole: vi.fn()
}));

vi.mock('$lib/api/scim', () => ({
	listScimTokens: vi.fn(),
	createScimToken: vi.fn(),
	revokeScimToken: vi.fn(),
	listScimMappings: vi.fn(),
	updateScimMappings: vi.fn()
}));

vi.mock('$lib/api/client', () => ({
	ApiError: class ApiError extends Error {
		status: number;
		constructor(message: string, status: number) {
			super(message);
			this.status = status;
		}
	}
}));

import { hasAdminRole } from '$lib/server/auth';
import { updateScimMappings } from '$lib/api/scim';
import { ApiError } from '$lib/api/client';

const mockLocals = (admin: boolean) => ({
	accessToken: 'tok',
	tenantId: 'tid',
	user: { roles: admin ? ['admin'] : ['user'] }
});

// =============================================================================
// SCIM Mappings Actions
// =============================================================================

describe('SCIM Mappings actions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(hasAdminRole).mockReturnValue(true);
	});

	describe('actions.updateMappings', () => {
		let actions: any;

		beforeEach(async () => {
			const mod = await import('./+page.server');
			actions = mod.actions;
		});

		it('sends full mappings array and returns success', async () => {
			vi.mocked(updateScimMappings).mockResolvedValue([
				{
					id: 'map-1',
					tenant_id: 'tid',
					scim_path: 'userName',
					xavyo_field: 'email',
					transform: 'lowercase',
					required: true,
					created_at: '2026-01-01T00:00:00Z',
					updated_at: '2026-01-01T00:00:00Z'
				},
				{
					id: 'map-2',
					tenant_id: 'tid',
					scim_path: 'name.givenName',
					xavyo_field: 'first_name',
					transform: null,
					required: false,
					created_at: '2026-01-01T00:00:00Z',
					updated_at: '2026-01-01T00:00:00Z'
				}
			] as any);

			const formData = new FormData();
			formData.append('scim_path', 'userName');
			formData.append('scim_path', 'name.givenName');
			formData.append('xavyo_field', 'email');
			formData.append('xavyo_field', 'first_name');
			formData.append('transform', 'lowercase');
			formData.append('transform', 'none');
			formData.append('required', 'true');
			formData.append('required', 'false');

			const result = await actions.updateMappings({
				request: new Request('http://localhost/settings/scim?/updateMappings', {
					method: 'POST',
					body: formData
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.success).toBe(true);
			expect(result.action).toBe('mappings_updated');

			expect(updateScimMappings).toHaveBeenCalledWith(
				{
					mappings: [
						{
							scim_path: 'userName',
							xavyo_field: 'email',
							transform: 'lowercase',
							required: true
						},
						{
							scim_path: 'name.givenName',
							xavyo_field: 'first_name',
							transform: null,
							required: false
						}
					]
				},
				'tok',
				'tid',
				expect.any(Function)
			);
		});

		it('returns error on ApiError', async () => {
			vi.mocked(updateScimMappings).mockRejectedValue(
				new ApiError('Validation failed', 422)
			);

			const formData = new FormData();
			formData.append('scim_path', 'userName');
			formData.append('xavyo_field', 'email');
			formData.append('transform', 'none');
			formData.append('required', 'true');

			const result = await actions.updateMappings({
				request: new Request('http://localhost/settings/scim?/updateMappings', {
					method: 'POST',
					body: formData
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(422);
		});

		it('returns 500 on unexpected error', async () => {
			vi.mocked(updateScimMappings).mockRejectedValue(new Error('Network failure'));

			const formData = new FormData();
			formData.append('scim_path', 'userName');
			formData.append('xavyo_field', 'email');
			formData.append('transform', 'none');
			formData.append('required', 'true');

			const result = await actions.updateMappings({
				request: new Request('http://localhost/settings/scim?/updateMappings', {
					method: 'POST',
					body: formData
				}),
				locals: mockLocals(true),
				fetch: vi.fn()
			} as any);

			expect(result.status).toBe(500);
		});
	});
});
