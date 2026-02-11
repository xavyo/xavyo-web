import { describe, it, expect, afterEach, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';

// Mock the social-client module
vi.mock('$lib/api/social-client', () => ({
	listSocialConnections: vi.fn(),
	listSocialProviders: vi.fn(),
	initiateSocialLink: vi.fn(),
	unlinkSocialAccount: vi.fn()
}));

import SocialConnectionsTab from './social-connections-tab.svelte';
import {
	listSocialConnections,
	listSocialProviders
} from '$lib/api/social-client';

const mockConnections = {
	connections: [
		{
			id: 'conn-1',
			provider: 'google',
			email: 'user@gmail.com',
			display_name: 'Test User',
			is_private_email: false,
			created_at: '2024-06-15T12:00:00Z'
		}
	]
};

const mockProviders = {
	providers: [
		{
			provider: 'google',
			enabled: true,
			client_id: 'google-id',
			has_client_secret: true,
			scopes: ['openid'],
			additional_config: null,
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		},
		{
			provider: 'github',
			enabled: true,
			client_id: 'github-id',
			has_client_secret: true,
			scopes: ['user'],
			additional_config: null,
			created_at: '2024-01-01T00:00:00Z',
			updated_at: '2024-01-01T00:00:00Z'
		}
	]
};

describe('SocialConnectionsTab', () => {
	beforeEach(() => {
		vi.mocked(listSocialConnections).mockResolvedValue(mockConnections);
		vi.mocked(listSocialProviders).mockResolvedValue(mockProviders);
	});

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it('shows loading state initially', () => {
		// Make the promises never resolve to keep loading state
		vi.mocked(listSocialConnections).mockReturnValue(new Promise(() => {}));
		vi.mocked(listSocialProviders).mockReturnValue(new Promise(() => {}));

		const { container } = render(SocialConnectionsTab);
		const pulsingElements = container.querySelectorAll('.animate-pulse');
		expect(pulsingElements.length).toBeGreaterThan(0);
	});

	it('renders connections after fetch', async () => {
		render(SocialConnectionsTab);
		expect(await screen.findByText('user@gmail.com')).toBeTruthy();
		expect(await screen.findByText('Google')).toBeTruthy();
	});

	it('shows error state on failure', async () => {
		vi.mocked(listSocialConnections).mockRejectedValue(new Error('Network error'));

		render(SocialConnectionsTab);
		expect(await screen.findByText('Network error')).toBeTruthy();
	});

	it('renders heading and description', () => {
		render(SocialConnectionsTab);
		expect(screen.getByText('Social connections')).toBeTruthy();
		expect(
			screen.getByText('Link social accounts to your profile for quick sign-in.')
		).toBeTruthy();
	});

	it('retry button re-fetches on error', async () => {
		vi.mocked(listSocialConnections).mockRejectedValueOnce(new Error('Temporary failure'));

		render(SocialConnectionsTab);
		expect(await screen.findByText('Temporary failure')).toBeTruthy();

		// Now make it succeed
		vi.mocked(listSocialConnections).mockResolvedValue(mockConnections);
		vi.mocked(listSocialProviders).mockResolvedValue(mockProviders);

		const retryBtn = screen.getByText('Retry');
		await fireEvent.click(retryBtn);

		expect(await screen.findByText('user@gmail.com')).toBeTruthy();
	});

	it('shows available provider for linking', async () => {
		render(SocialConnectionsTab);
		// github is enabled but not connected -- should appear as linkable
		expect(await screen.findByText('Github')).toBeTruthy();
	});
});
