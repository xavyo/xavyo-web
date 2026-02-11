import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/svelte';
import OverviewTab from './overview-tab.svelte';
import type {
	IdentityProviderListResponse,
	ServiceProviderListResponse,
	SocialProviderListResponse
} from '$lib/api/types';

// Mock the API client modules
vi.mock('$lib/api/federation-client', () => ({
	listIdentityProviders: vi.fn(),
	listServiceProviders: vi.fn()
}));

vi.mock('$lib/api/social-client', () => ({
	listSocialProviders: vi.fn()
}));

import { listIdentityProviders, listServiceProviders } from '$lib/api/federation-client';
import { listSocialProviders } from '$lib/api/social-client';

const mockListIdPs = vi.mocked(listIdentityProviders);
const mockListSPs = vi.mocked(listServiceProviders);
const mockListSocial = vi.mocked(listSocialProviders);

const emptyIdpResponse: IdentityProviderListResponse = {
	items: [],
	total: 0,
	offset: 0,
	limit: 100
};

const emptySpResponse: ServiceProviderListResponse = {
	items: [],
	total: 0,
	offset: 0,
	limit: 100
};

const emptySocialResponse: SocialProviderListResponse = {
	providers: []
};

describe('OverviewTab', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		cleanup();
	});

	it('shows loading state initially while fetching data', async () => {
		// Make the promises never resolve to keep loading state
		mockListIdPs.mockReturnValue(new Promise(() => {}));
		mockListSPs.mockReturnValue(new Promise(() => {}));
		mockListSocial.mockReturnValue(new Promise(() => {}));

		const { container } = render(OverviewTab);

		await waitFor(() => {
			const skeleton = container.querySelector('[data-testid="overview-skeleton"]');
			expect(skeleton).toBeTruthy();
		});
	});

	it('renders overview cards after successful data load', async () => {
		mockListIdPs.mockResolvedValue(emptyIdpResponse);
		mockListSPs.mockResolvedValue(emptySpResponse);
		mockListSocial.mockResolvedValue(emptySocialResponse);

		render(OverviewTab);

		await waitFor(() => {
			expect(screen.getByText('OIDC Identity Providers')).toBeTruthy();
			expect(screen.getByText('SAML Service Providers')).toBeTruthy();
			expect(screen.getByText('Social Providers')).toBeTruthy();
		});
	});

	it('calls API endpoints with limit 100', async () => {
		mockListIdPs.mockResolvedValue(emptyIdpResponse);
		mockListSPs.mockResolvedValue(emptySpResponse);
		mockListSocial.mockResolvedValue(emptySocialResponse);

		render(OverviewTab);

		await waitFor(() => {
			expect(mockListIdPs).toHaveBeenCalledWith({ limit: 100 });
			expect(mockListSPs).toHaveBeenCalledWith({ limit: 100 });
			expect(mockListSocial).toHaveBeenCalled();
		});
	});

	it('displays provider data from API responses', async () => {
		mockListIdPs.mockResolvedValue({
			items: [
				{
					id: 'idp-1',
					name: 'Test IdP',
					provider_type: 'oidc',
					issuer_url: 'https://example.com',
					client_id: 'c1',
					scopes: 'openid',
					claim_mapping: null,
					sync_on_login: false,
					is_enabled: true,
					validation_status: 'valid',
					last_validated_at: null,
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				}
			],
			total: 1,
			offset: 0,
			limit: 100
		});
		mockListSPs.mockResolvedValue(emptySpResponse);
		mockListSocial.mockResolvedValue({
			providers: [
				{
					provider: 'google',
					enabled: true,
					client_id: 'goog',
					has_client_secret: true,
					scopes: ['openid'],
					additional_config: null,
					created_at: '2024-01-01T00:00:00Z',
					updated_at: '2024-01-01T00:00:00Z'
				}
			]
		});

		render(OverviewTab);

		await waitFor(() => {
			expect(screen.getByText('1 provider (1 enabled)')).toBeTruthy();
			expect(screen.getByText('1 valid')).toBeTruthy();
			expect(screen.getByText('Google enabled')).toBeTruthy();
		});
	});

	it('shows error state when API call fails', async () => {
		mockListIdPs.mockRejectedValue(new Error('Network failure'));
		mockListSPs.mockResolvedValue(emptySpResponse);
		mockListSocial.mockResolvedValue(emptySocialResponse);

		render(OverviewTab);

		await waitFor(() => {
			expect(screen.getByText('Network failure')).toBeTruthy();
		});
	});

	it('shows generic error message when non-Error is thrown', async () => {
		mockListIdPs.mockRejectedValue('some string error');
		mockListSPs.mockResolvedValue(emptySpResponse);
		mockListSocial.mockResolvedValue(emptySocialResponse);

		render(OverviewTab);

		await waitFor(() => {
			expect(screen.getByText('Failed to load federation data')).toBeTruthy();
		});
	});

	it('retries loading when retry button is clicked', async () => {
		mockListIdPs.mockRejectedValueOnce(new Error('Network failure'));
		mockListSPs.mockResolvedValue(emptySpResponse);
		mockListSocial.mockResolvedValue(emptySocialResponse);

		render(OverviewTab);

		await waitFor(() => {
			expect(screen.getByText('Network failure')).toBeTruthy();
		});

		// Setup successful response for retry
		mockListIdPs.mockResolvedValue(emptyIdpResponse);

		const retryBtn = screen.getByText('Retry');
		await fireEvent.click(retryBtn);

		await waitFor(() => {
			expect(screen.getByText('OIDC Identity Providers')).toBeTruthy();
			expect(mockListIdPs).toHaveBeenCalledTimes(2);
		});
	});

	it('fetches all three endpoints in parallel', async () => {
		let idpResolve: (value: IdentityProviderListResponse) => void;
		let spResolve: (value: ServiceProviderListResponse) => void;
		let socialResolve: (value: SocialProviderListResponse) => void;

		mockListIdPs.mockReturnValue(
			new Promise((resolve) => {
				idpResolve = resolve;
			})
		);
		mockListSPs.mockReturnValue(
			new Promise((resolve) => {
				spResolve = resolve;
			})
		);
		mockListSocial.mockReturnValue(
			new Promise((resolve) => {
				socialResolve = resolve;
			})
		);

		render(OverviewTab);

		// All three should be called immediately (in parallel)
		await waitFor(() => {
			expect(mockListIdPs).toHaveBeenCalledTimes(1);
			expect(mockListSPs).toHaveBeenCalledTimes(1);
			expect(mockListSocial).toHaveBeenCalledTimes(1);
		});

		// Resolve all
		idpResolve!(emptyIdpResponse);
		spResolve!(emptySpResponse);
		socialResolve!(emptySocialResponse);

		await waitFor(() => {
			expect(screen.getByText('OIDC Identity Providers')).toBeTruthy();
		});
	});
});
