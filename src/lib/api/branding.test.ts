import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$env/dynamic/private', () => ({
	env: { API_BASE_URL: 'http://localhost:8080' }
}));

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

import { getPublicBranding, getBranding, updateBranding } from './branding';
import { apiClient, ApiError } from './client';

const mockApiClient = vi.mocked(apiClient);

describe('branding API functions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getPublicBranding', () => {
		it('fetches public branding for a tenant slug', async () => {
			const mockBranding = {
				logo_url: null,
				logo_dark_url: null,
				favicon_url: null,
				primary_color: '#3366FF',
				secondary_color: null,
				accent_color: null,
				background_color: null,
				text_color: null,
				font_family: null,
				login_page_title: 'Welcome to Acme',
				login_page_subtitle: 'SSO Portal',
				login_page_background_url: null,
				footer_text: 'Acme Corp',
				privacy_policy_url: 'https://acme.com/privacy',
				terms_of_service_url: null,
				support_url: null,
				consent_page_title: null,
				consent_page_subtitle: null,
				consent_approval_button_text: null,
				consent_denial_button_text: null
			};

			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockBranding)
			});

			const result = await getPublicBranding('acme-corp', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'http://localhost:8080/public/branding/acme-corp'
			);
			expect(result).toEqual(mockBranding);
		});

		it('encodes the tenant slug in the URL', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({})
			});

			await getPublicBranding('tenant with spaces', mockFetch);

			expect(mockFetch).toHaveBeenCalledWith(
				'http://localhost:8080/public/branding/tenant%20with%20spaces'
			);
		});

		it('throws ApiError when response is not ok', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404
			});

			await expect(getPublicBranding('nonexistent', mockFetch)).rejects.toThrow(ApiError);
			await expect(getPublicBranding('nonexistent', mockFetch)).rejects.toMatchObject({
				message: 'Branding not found',
				status: 404
			});
		});

		it('throws ApiError on 500 server error', async () => {
			const mockFetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 500
			});

			await expect(getPublicBranding('broken', mockFetch)).rejects.toMatchObject({
				status: 500
			});
		});

		it('uses global fetch when no fetchFn provided', async () => {
			const originalFetch = globalThis.fetch;
			const mockFetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve({})
			});
			globalThis.fetch = mockFetch;

			try {
				await getPublicBranding('system');
				expect(mockFetch).toHaveBeenCalledWith(
					'http://localhost:8080/public/branding/system'
				);
			} finally {
				globalThis.fetch = originalFetch;
			}
		});
	});

	describe('getBranding', () => {
		it('calls GET /admin/branding with auth', async () => {
			const mockResponse = { logo_url: null, primary_color: '#fff', updated_at: '2024-01-01' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await getBranding('token123', 'tenant-abc');

			expect(mockApiClient).toHaveBeenCalledWith('/admin/branding', {
				method: 'GET',
				token: 'token123',
				tenantId: 'tenant-abc',
				fetch: undefined
			});
			expect(result).toEqual(mockResponse);
		});

		it('passes custom fetch function', async () => {
			mockApiClient.mockResolvedValue({});
			const customFetch = vi.fn();

			await getBranding('tok', 'tid', customFetch);

			expect(mockApiClient).toHaveBeenCalledWith('/admin/branding', {
				method: 'GET',
				token: 'tok',
				tenantId: 'tid',
				fetch: customFetch
			});
		});
	});

	describe('updateBranding', () => {
		it('calls PUT /admin/branding with body', async () => {
			const body = { primary_color: '#ff0000' };
			const mockResponse = { ...body, updated_at: '2024-01-01' };
			mockApiClient.mockResolvedValue(mockResponse);

			const result = await updateBranding(body, 'token123', 'tenant-abc');

			expect(mockApiClient).toHaveBeenCalledWith('/admin/branding', {
				method: 'PUT',
				body,
				token: 'token123',
				tenantId: 'tenant-abc',
				fetch: undefined
			});
			expect(result).toEqual(mockResponse);
		});
	});
});
