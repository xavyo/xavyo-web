import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import SocialProviderCard from './social-provider-card.svelte';
import type { SocialProviderConfig, UpdateSocialProviderRequest } from '$lib/api/types';

function makeProvider(overrides: Partial<SocialProviderConfig> = {}): SocialProviderConfig {
	return {
		provider: 'google',
		enabled: true,
		client_id: 'google-client-id',
		has_client_secret: true,
		scopes: ['openid', 'profile', 'email'],
		additional_config: null,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		...overrides
	};
}

describe('SocialProviderCard', () => {
	const defaultOnSave = vi.fn().mockResolvedValue(undefined);
	const defaultOnToggle = vi.fn().mockResolvedValue(undefined);

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it('renders provider name and enabled badge', () => {
		render(SocialProviderCard, {
			props: {
				provider: makeProvider({ provider: 'google', enabled: true }),
				onSave: defaultOnSave,
				onToggle: defaultOnToggle
			}
		});
		expect(screen.getByText('Google')).toBeTruthy();
		expect(screen.getByText('Enabled')).toBeTruthy();
	});

	it('renders disabled badge when provider is disabled', () => {
		render(SocialProviderCard, {
			props: {
				provider: makeProvider({ enabled: false }),
				onSave: defaultOnSave,
				onToggle: defaultOnToggle
			}
		});
		expect(screen.getByText('Disabled')).toBeTruthy();
	});

	it('shows Disable button for enabled provider', () => {
		render(SocialProviderCard, {
			props: {
				provider: makeProvider({ enabled: true }),
				onSave: defaultOnSave,
				onToggle: defaultOnToggle
			}
		});
		expect(screen.getByText('Disable')).toBeTruthy();
	});

	it('shows Enable button for disabled provider', () => {
		render(SocialProviderCard, {
			props: {
				provider: makeProvider({ enabled: false }),
				onSave: defaultOnSave,
				onToggle: defaultOnToggle
			}
		});
		expect(screen.getByText('Enable')).toBeTruthy();
	});

	it('expands on click to show config fields', async () => {
		render(SocialProviderCard, {
			props: {
				provider: makeProvider({ provider: 'google' }),
				onSave: defaultOnSave,
				onToggle: defaultOnToggle
			}
		});

		// Config fields should not be visible initially
		expect(screen.queryByLabelText('Client ID')).toBeNull();

		// Click the expand button
		const expandBtn = screen.getByLabelText('Expand configuration');
		await fireEvent.click(expandBtn);

		// Config fields should now be visible
		expect(screen.getByLabelText('Client ID')).toBeTruthy();
		expect(screen.getByLabelText('Client Secret')).toBeTruthy();
		expect(screen.getByLabelText('Scopes')).toBeTruthy();
	});

	it('shows Microsoft-specific Azure tenant field', async () => {
		render(SocialProviderCard, {
			props: {
				provider: makeProvider({
					provider: 'microsoft',
					additional_config: { azure_tenant: 'my-tenant-id' }
				}),
				onSave: defaultOnSave,
				onToggle: defaultOnToggle
			}
		});

		const expandBtn = screen.getByLabelText('Expand configuration');
		await fireEvent.click(expandBtn);

		expect(screen.getByText('Microsoft-specific settings')).toBeTruthy();
		expect(screen.getByLabelText('Azure Tenant ID')).toBeTruthy();
	});

	it('shows Apple-specific team_id and key_id fields', async () => {
		render(SocialProviderCard, {
			props: {
				provider: makeProvider({
					provider: 'apple',
					additional_config: { team_id: 'TEAM123', key_id: 'KEY456' }
				}),
				onSave: defaultOnSave,
				onToggle: defaultOnToggle
			}
		});

		const expandBtn = screen.getByLabelText('Expand configuration');
		await fireEvent.click(expandBtn);

		expect(screen.getByText('Apple-specific settings')).toBeTruthy();
		expect(screen.getByLabelText('Team ID')).toBeTruthy();
		expect(screen.getByLabelText('Key ID')).toBeTruthy();
	});

	it('calls onSave callback when Save button clicked', async () => {
		const onSave = vi.fn().mockResolvedValue(undefined);
		render(SocialProviderCard, {
			props: {
				provider: makeProvider({ provider: 'github' }),
				onSave,
				onToggle: defaultOnToggle
			}
		});

		const expandBtn = screen.getByLabelText('Expand configuration');
		await fireEvent.click(expandBtn);

		const saveBtn = screen.getByText('Save configuration');
		await fireEvent.click(saveBtn);

		await vi.waitFor(() => {
			expect(onSave).toHaveBeenCalledOnce();
		});
		expect(onSave).toHaveBeenCalledWith('github', expect.any(Object));
	});

	it('calls onToggle callback when toggle button clicked', async () => {
		const onToggle = vi.fn().mockResolvedValue(undefined);
		render(SocialProviderCard, {
			props: {
				provider: makeProvider({ provider: 'google', enabled: true }),
				onSave: defaultOnSave,
				onToggle
			}
		});

		const disableBtn = screen.getByText('Disable');
		await fireEvent.click(disableBtn);

		await vi.waitFor(() => {
			expect(onToggle).toHaveBeenCalledOnce();
		});
		expect(onToggle).toHaveBeenCalledWith('google', false);
	});

	it('does not show Microsoft or Apple fields for generic providers', async () => {
		render(SocialProviderCard, {
			props: {
				provider: makeProvider({ provider: 'github' }),
				onSave: defaultOnSave,
				onToggle: defaultOnToggle
			}
		});

		const expandBtn = screen.getByLabelText('Expand configuration');
		await fireEvent.click(expandBtn);

		expect(screen.queryByText('Microsoft-specific settings')).toBeNull();
		expect(screen.queryByText('Apple-specific settings')).toBeNull();
	});

	it('shows collapse button after expanding', async () => {
		render(SocialProviderCard, {
			props: {
				provider: makeProvider(),
				onSave: defaultOnSave,
				onToggle: defaultOnToggle
			}
		});

		const expandBtn = screen.getByLabelText('Expand configuration');
		await fireEvent.click(expandBtn);

		expect(screen.getByLabelText('Collapse configuration')).toBeTruthy();
	});
});
