import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import FederationOverview from './federation-overview.svelte';
import type { IdentityProvider, ServiceProvider, SocialProviderConfig } from '$lib/api/types';

function makeIdp(overrides: Partial<IdentityProvider> = {}): IdentityProvider {
	return {
		id: 'idp-1',
		name: 'Test IdP',
		provider_type: 'oidc',
		issuer_url: 'https://example.com',
		client_id: 'client-1',
		scopes: 'openid',
		claim_mapping: null,
		sync_on_login: false,
		is_enabled: true,
		validation_status: 'valid',
		last_validated_at: null,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		...overrides
	};
}

function makeSp(overrides: Partial<ServiceProvider> = {}): ServiceProvider {
	return {
		id: 'sp-1',
		name: 'Test SP',
		entity_id: 'urn:test',
		acs_urls: ['https://example.com/acs'],
		certificate: null,
		attribute_mapping: null,
		name_id_format: null,
		sign_assertions: true,
		validate_signatures: false,
		assertion_validity_seconds: 300,
		enabled: true,
		metadata_url: null,
		slo_url: null,
		slo_binding: 'HTTP-POST',
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		...overrides
	};
}

function makeSocial(overrides: Partial<SocialProviderConfig> = {}): SocialProviderConfig {
	return {
		provider: 'google',
		enabled: true,
		client_id: 'goog-client',
		has_client_secret: true,
		scopes: ['openid', 'email'],
		additional_config: null,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		...overrides
	};
}

const defaultProps = {
	oidcProviders: [] as IdentityProvider[],
	samlProviders: [] as ServiceProvider[],
	socialProviders: [] as SocialProviderConfig[],
	loading: false,
	error: null as string | null,
	onRetry: () => {}
};

describe('FederationOverview', () => {
	afterEach(() => {
		cleanup();
	});

	// --- Loading state ---

	it('renders skeleton cards when loading', () => {
		const { container } = render(FederationOverview, {
			props: { ...defaultProps, loading: true }
		});
		const skeleton = container.querySelector('[data-testid="overview-skeleton"]');
		expect(skeleton).toBeTruthy();
		const pulsingElements = container.querySelectorAll('.animate-pulse');
		expect(pulsingElements.length).toBeGreaterThan(0);
	});

	it('does not render data cards when loading', () => {
		render(FederationOverview, {
			props: { ...defaultProps, loading: true }
		});
		expect(screen.queryByText('OIDC Identity Providers')).toBeNull();
		expect(screen.queryByText('SAML Service Providers')).toBeNull();
		expect(screen.queryByText('Social Providers')).toBeNull();
	});

	// --- Error state ---

	it('renders error message when error is set', () => {
		render(FederationOverview, {
			props: { ...defaultProps, error: 'Something went wrong' }
		});
		expect(screen.getByText('Something went wrong')).toBeTruthy();
	});

	it('renders retry button when error is set', () => {
		render(FederationOverview, {
			props: { ...defaultProps, error: 'Network error' }
		});
		expect(screen.getByText('Retry')).toBeTruthy();
	});

	it('calls onRetry when retry button is clicked', async () => {
		const onRetry = vi.fn();
		render(FederationOverview, {
			props: { ...defaultProps, error: 'Network error', onRetry }
		});
		const retryBtn = screen.getByText('Retry');
		await fireEvent.click(retryBtn);
		expect(onRetry).toHaveBeenCalledOnce();
	});

	// --- Loaded state: OIDC card ---

	it('renders OIDC card with provider count and enabled count', () => {
		render(FederationOverview, {
			props: {
				...defaultProps,
				oidcProviders: [
					makeIdp({ id: 'idp-1', is_enabled: true }),
					makeIdp({ id: 'idp-2', is_enabled: false }),
					makeIdp({ id: 'idp-3', is_enabled: true })
				]
			}
		});
		expect(screen.getByText('OIDC Identity Providers')).toBeTruthy();
		expect(screen.getByText('3 providers (2 enabled)')).toBeTruthy();
	});

	it('renders singular "provider" when there is exactly 1 OIDC provider', () => {
		render(FederationOverview, {
			props: {
				...defaultProps,
				oidcProviders: [makeIdp()]
			}
		});
		expect(screen.getByText('1 provider (1 enabled)')).toBeTruthy();
	});

	it('renders validation status badges for OIDC providers', () => {
		render(FederationOverview, {
			props: {
				...defaultProps,
				oidcProviders: [
					makeIdp({ id: 'idp-1', validation_status: 'valid' }),
					makeIdp({ id: 'idp-2', validation_status: 'valid' }),
					makeIdp({ id: 'idp-3', validation_status: 'invalid' })
				]
			}
		});
		expect(screen.getByText('2 valid')).toBeTruthy();
		expect(screen.getByText('1 invalid')).toBeTruthy();
	});

	it('does not render validation badges when no providers exist', () => {
		render(FederationOverview, {
			props: { ...defaultProps, oidcProviders: [] }
		});
		expect(screen.queryByText(/valid/)).toBeNull();
		expect(screen.queryByText(/invalid/)).toBeNull();
	});

	it('renders OIDC manage link pointing to oidc tab', () => {
		render(FederationOverview, {
			props: { ...defaultProps }
		});
		const links = screen.getAllByText('Manage');
		const oidcLink = links[0];
		expect(oidcLink.closest('a')?.getAttribute('href')).toBe('/federation?tab=oidc');
	});

	// --- Loaded state: SAML card ---

	it('renders SAML card with provider count and enabled count', () => {
		render(FederationOverview, {
			props: {
				...defaultProps,
				samlProviders: [
					makeSp({ id: 'sp-1', enabled: true }),
					makeSp({ id: 'sp-2', enabled: false })
				]
			}
		});
		expect(screen.getByText('SAML Service Providers')).toBeTruthy();
		expect(screen.getByText('2 providers (1 enabled)')).toBeTruthy();
	});

	it('renders singular "provider" when there is exactly 1 SAML provider', () => {
		render(FederationOverview, {
			props: {
				...defaultProps,
				samlProviders: [makeSp()]
			}
		});
		expect(screen.getByText('1 provider (1 enabled)')).toBeTruthy();
	});

	it('renders SAML manage link pointing to saml tab', () => {
		render(FederationOverview, {
			props: { ...defaultProps }
		});
		const links = screen.getAllByText('Manage');
		const samlLink = links[1];
		expect(samlLink.closest('a')?.getAttribute('href')).toBe('/federation?tab=saml');
	});

	// --- Loaded state: Social card ---

	it('renders Social card with enabled provider names', () => {
		render(FederationOverview, {
			props: {
				...defaultProps,
				socialProviders: [
					makeSocial({ provider: 'google', enabled: true }),
					makeSocial({ provider: 'github', enabled: true }),
					makeSocial({ provider: 'apple', enabled: false })
				]
			}
		});
		expect(screen.getByText('Social Providers')).toBeTruthy();
		expect(screen.getByText('Google, Github enabled')).toBeTruthy();
	});

	it('renders "No providers enabled" when no social providers are enabled', () => {
		render(FederationOverview, {
			props: {
				...defaultProps,
				socialProviders: [makeSocial({ provider: 'google', enabled: false })]
			}
		});
		expect(screen.getByText('No providers enabled')).toBeTruthy();
	});

	it('renders "No providers enabled" when social providers array is empty', () => {
		render(FederationOverview, {
			props: { ...defaultProps, socialProviders: [] }
		});
		expect(screen.getByText('No providers enabled')).toBeTruthy();
	});

	it('renders Social manage link pointing to social tab', () => {
		render(FederationOverview, {
			props: { ...defaultProps }
		});
		const links = screen.getAllByText('Manage');
		const socialLink = links[2];
		expect(socialLink.closest('a')?.getAttribute('href')).toBe('/federation?tab=social');
	});

	// --- All three cards rendered ---

	it('renders all three summary cards when loaded', () => {
		const { container } = render(FederationOverview, {
			props: { ...defaultProps }
		});
		expect(screen.getByText('OIDC Identity Providers')).toBeTruthy();
		expect(screen.getByText('SAML Service Providers')).toBeTruthy();
		expect(screen.getByText('Social Providers')).toBeTruthy();
		const cardsGrid = container.querySelector('[data-testid="overview-cards"]');
		expect(cardsGrid).toBeTruthy();
	});

	// --- Zero counts ---

	it('renders 0 providers when arrays are empty', () => {
		render(FederationOverview, {
			props: { ...defaultProps }
		});
		const zeroTexts = screen.getAllByText('0 providers (0 enabled)');
		expect(zeroTexts.length).toBe(2); // OIDC + SAML
	});

	// --- Only valid badges, no invalid ---

	it('renders only valid badge when no invalid providers exist', () => {
		render(FederationOverview, {
			props: {
				...defaultProps,
				oidcProviders: [
					makeIdp({ id: 'idp-1', validation_status: 'valid' }),
					makeIdp({ id: 'idp-2', validation_status: 'valid' })
				]
			}
		});
		expect(screen.getByText('2 valid')).toBeTruthy();
		expect(screen.queryByText(/invalid/)).toBeNull();
	});

	// --- Only invalid badges, no valid ---

	it('renders only invalid badge when no valid providers exist', () => {
		render(FederationOverview, {
			props: {
				...defaultProps,
				oidcProviders: [makeIdp({ id: 'idp-1', validation_status: 'invalid' })]
			}
		});
		expect(screen.getByText('1 invalid')).toBeTruthy();
		expect(screen.queryByText(/\d+ valid/)).toBeNull();
	});
});
