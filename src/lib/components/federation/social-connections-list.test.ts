import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import SocialConnectionsList from './social-connections-list.svelte';
import type { SocialConnection } from '$lib/api/types';

function makeConnection(overrides: Partial<SocialConnection> = {}): SocialConnection {
	return {
		id: 'conn-1',
		provider: 'google',
		email: 'user@gmail.com',
		display_name: 'John Doe',
		is_private_email: false,
		created_at: '2024-06-15T12:00:00Z',
		...overrides
	};
}

describe('SocialConnectionsList', () => {
	const defaultOnLink = vi.fn();
	const defaultOnUnlink = vi.fn();

	afterEach(() => {
		cleanup();
		vi.clearAllMocks();
	});

	it('renders linked connections with provider name and email', () => {
		const connections = [
			makeConnection({ provider: 'google', email: 'user@gmail.com' })
		];
		render(SocialConnectionsList, {
			props: {
				connections,
				availableProviders: ['google'],
				onLink: defaultOnLink,
				onUnlink: defaultOnUnlink
			}
		});
		expect(screen.getByText('Google')).toBeTruthy();
		expect(screen.getByText('user@gmail.com')).toBeTruthy();
	});

	it('shows "Private email" for private emails', () => {
		const connections = [
			makeConnection({ is_private_email: true, email: null })
		];
		render(SocialConnectionsList, {
			props: {
				connections,
				availableProviders: ['google'],
				onLink: defaultOnLink,
				onUnlink: defaultOnUnlink
			}
		});
		expect(screen.getByText('Private email')).toBeTruthy();
	});

	it('renders unlink button for each connection', () => {
		const connections = [
			makeConnection({ id: 'c1', provider: 'google' }),
			makeConnection({ id: 'c2', provider: 'github' })
		];
		render(SocialConnectionsList, {
			props: {
				connections,
				availableProviders: ['google', 'github'],
				onLink: defaultOnLink,
				onUnlink: defaultOnUnlink
			}
		});
		const unlinkButtons = screen.getAllByText('Unlink');
		expect(unlinkButtons.length).toBe(2);
	});

	it('shows available providers with link button', () => {
		render(SocialConnectionsList, {
			props: {
				connections: [],
				availableProviders: ['github', 'microsoft'],
				onLink: defaultOnLink,
				onUnlink: defaultOnUnlink
			}
		});
		expect(screen.getByText('Github')).toBeTruthy();
		expect(screen.getByText('Microsoft')).toBeTruthy();
		const linkButtons = screen.getAllByText('Link account');
		expect(linkButtons.length).toBe(2);
	});

	it('renders empty state when no connections and no available providers', () => {
		render(SocialConnectionsList, {
			props: {
				connections: [],
				availableProviders: [],
				onLink: defaultOnLink,
				onUnlink: defaultOnUnlink
			}
		});
		expect(screen.getByText('No social connections available')).toBeTruthy();
	});

	it('calls onLink callback when link button clicked', async () => {
		const onLink = vi.fn();
		render(SocialConnectionsList, {
			props: {
				connections: [],
				availableProviders: ['github'],
				onLink,
				onUnlink: defaultOnUnlink
			}
		});

		const linkBtn = screen.getByText('Link account');
		await fireEvent.click(linkBtn);
		expect(onLink).toHaveBeenCalledOnce();
		expect(onLink).toHaveBeenCalledWith('github');
	});

	it('calls onUnlink callback when unlink button clicked', async () => {
		const onUnlink = vi.fn();
		const connections = [makeConnection({ provider: 'google' })];
		render(SocialConnectionsList, {
			props: {
				connections,
				availableProviders: ['google'],
				onLink: defaultOnLink,
				onUnlink
			}
		});

		const unlinkBtn = screen.getByText('Unlink');
		await fireEvent.click(unlinkBtn);
		expect(onUnlink).toHaveBeenCalledOnce();
		expect(onUnlink).toHaveBeenCalledWith('google');
	});

	it('shows "Linked accounts" heading when connections exist', () => {
		const connections = [makeConnection()];
		render(SocialConnectionsList, {
			props: {
				connections,
				availableProviders: ['google'],
				onLink: defaultOnLink,
				onUnlink: defaultOnUnlink
			}
		});
		expect(screen.getByText('Linked accounts')).toBeTruthy();
	});

	it('shows "Available providers" heading when unlinkable providers exist', () => {
		render(SocialConnectionsList, {
			props: {
				connections: [],
				availableProviders: ['github'],
				onLink: defaultOnLink,
				onUnlink: defaultOnUnlink
			}
		});
		expect(screen.getByText('Available providers')).toBeTruthy();
	});

	it('does not show already-linked providers in available section', () => {
		const connections = [makeConnection({ provider: 'google' })];
		render(SocialConnectionsList, {
			props: {
				connections,
				availableProviders: ['google', 'github'],
				onLink: defaultOnLink,
				onUnlink: defaultOnUnlink
			}
		});
		// github should appear in available, not google
		expect(screen.getByText('Available providers')).toBeTruthy();
		const linkButtons = screen.getAllByText('Link account');
		expect(linkButtons.length).toBe(1);
	});

	it('shows display_name for connections that have one', () => {
		const connections = [makeConnection({ display_name: 'Jane Smith' })];
		render(SocialConnectionsList, {
			props: {
				connections,
				availableProviders: ['google'],
				onLink: defaultOnLink,
				onUnlink: defaultOnUnlink
			}
		});
		expect(screen.getByText('Jane Smith')).toBeTruthy();
	});
});
