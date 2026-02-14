import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('$lib/api/branding', () => ({
	getPublicBranding: vi.fn()
}));

import { load } from './+layout.server';
import { getPublicBranding } from '$lib/api/branding';

const mockGetPublicBranding = vi.mocked(getPublicBranding);

describe('(auth) +layout.server', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	function makeLoadArgs(searchParams: Record<string, string> = {}) {
		const url = new URL('http://localhost:5173/login');
		for (const [k, v] of Object.entries(searchParams)) {
			url.searchParams.set(k, v);
		}
		return { url, fetch: vi.fn() } as any;
	}

	it('fetches branding for the tenant slug from query param', async () => {
		const mockBranding = {
			logo_url: 'https://acme.com/logo.png',
			logo_dark_url: null,
			favicon_url: null,
			primary_color: '#e11d48',
			secondary_color: null,
			accent_color: null,
			background_color: null,
			text_color: null,
			font_family: 'Roboto',
			login_page_title: 'Welcome to Acme',
			login_page_subtitle: 'Single Sign-On Portal',
			login_page_background_url: null,
			footer_text: 'Acme Corp 2026',
			privacy_policy_url: 'https://acme.com/privacy',
			terms_of_service_url: 'https://acme.com/tos',
			support_url: null,
			consent_page_title: null,
			consent_page_subtitle: null,
			consent_approval_button_text: null,
			consent_denial_button_text: null
		};
		mockGetPublicBranding.mockResolvedValue(mockBranding);

		const result = await load(makeLoadArgs({ tenant: 'acme-corp' }));

		expect(mockGetPublicBranding).toHaveBeenCalledWith('acme-corp', expect.any(Function));
		expect(result.branding).toEqual(mockBranding);
		expect(result.tenantSlug).toBe('acme-corp');
	});

	it('defaults to "system" tenant when no query param', async () => {
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
			login_page_title: 'Sign in',
			login_page_subtitle: null,
			login_page_background_url: null,
			footer_text: null,
			privacy_policy_url: null,
			terms_of_service_url: null,
			support_url: null,
			consent_page_title: null,
			consent_page_subtitle: null,
			consent_approval_button_text: null,
			consent_denial_button_text: null
		};
		mockGetPublicBranding.mockResolvedValue(mockBranding);

		const result = await load(makeLoadArgs());

		expect(mockGetPublicBranding).toHaveBeenCalledWith('system', expect.any(Function));
		expect(result.branding).toEqual(mockBranding);
		expect(result.tenantSlug).toBe('system');
	});

	it('returns null branding when API fails (404)', async () => {
		mockGetPublicBranding.mockRejectedValue(new Error('Branding not found'));

		const result = await load(makeLoadArgs({ tenant: 'nonexistent' }));

		expect(result.branding).toBeNull();
		expect(result.tenantSlug).toBe('nonexistent');
	});

	it('returns null branding when API fails (500)', async () => {
		mockGetPublicBranding.mockRejectedValue(new Error('Internal Server Error'));

		const result = await load(makeLoadArgs({ tenant: 'broken' }));

		expect(result.branding).toBeNull();
		expect(result.tenantSlug).toBe('broken');
	});

	it('returns null branding on network error', async () => {
		mockGetPublicBranding.mockRejectedValue(new TypeError('Failed to fetch'));

		const result = await load(makeLoadArgs());

		expect(result.branding).toBeNull();
		expect(result.tenantSlug).toBe('system');
	});

	it('passes SvelteKit fetch to getPublicBranding', async () => {
		mockGetPublicBranding.mockResolvedValue({} as any);
		const svelteKitFetch = vi.fn();

		await load({ url: new URL('http://localhost/login'), fetch: svelteKitFetch } as any);

		expect(mockGetPublicBranding).toHaveBeenCalledWith('system', svelteKitFetch);
	});
});
