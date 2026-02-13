import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/svelte';

// Mock SvelteKit stores before importing the component
vi.mock('$app/stores', () => ({
	page: {
		subscribe: vi.fn((fn: Function) => {
			fn({ url: new URL('http://localhost/federation?tab=overview'), params: {} });
			return () => {};
		})
	}
}));

vi.mock('$app/navigation', () => ({
	goto: vi.fn()
}));

// Mock fetch for sub-components that load data
vi.stubGlobal(
	'fetch',
	vi.fn().mockResolvedValue({
		ok: true,
		json: () => Promise.resolve({ items: [], total: 0, providers: [] })
	})
);

import FederationPage from './+page.svelte';

describe('FederationPage', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders the page with Federation title', () => {
		render(FederationPage);
		expect(screen.getByText('Federation')).toBeTruthy();
	});

	it('shows all 4 tab triggers', () => {
		render(FederationPage);
		expect(screen.getByText('Overview')).toBeTruthy();
		expect(screen.getByText('OIDC')).toBeTruthy();
		expect(screen.getByText('SAML')).toBeTruthy();
		expect(screen.getByText('Social')).toBeTruthy();
	});

	it('shows description text in PageHeader', () => {
		render(FederationPage);
		expect(
			screen.getByText('Manage identity federation and social login providers')
		).toBeTruthy();
	});
});
