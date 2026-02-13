import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/svelte';
import Header from './header.svelte';

const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] ?? null),
		setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
		removeItem: vi.fn((key: string) => { delete store[key]; }),
		clear: vi.fn(() => { store = {}; })
	};
})();

const matchMediaMock = vi.fn(() => ({
	matches: false,
	media: '',
	onchange: null,
	addListener: vi.fn(),
	removeListener: vi.fn(),
	addEventListener: vi.fn(),
	removeEventListener: vi.fn(),
	dispatchEvent: vi.fn()
}));

beforeEach(() => {
	vi.stubGlobal('localStorage', localStorageMock);
	vi.stubGlobal('matchMedia', matchMediaMock);
	localStorageMock.clear();
	vi.clearAllMocks();
	document.documentElement.classList.remove('dark');
});

afterEach(() => {
	cleanup();
	vi.unstubAllGlobals();
});

describe('Header', () => {
	it('renders the user menu trigger', () => {
		render(Header, { props: { email: 'test@example.com' } });
		expect(screen.getByText('test@example.com')).toBeTruthy();
	});

	it('renders Settings link pointing to /settings in the dropdown menu', async () => {
		render(Header, { props: { email: 'test@example.com' } });
		const trigger = screen.getByText('test@example.com').closest('button');
		await fireEvent.click(trigger!);
		const settingsLink = await screen.findByText('Settings');
		const anchor = settingsLink.closest('a');
		expect(anchor).toBeTruthy();
		expect(anchor?.getAttribute('href')).toBe('/settings');
	});

	it('renders Profile link pointing to /settings?tab=profile in the dropdown menu', async () => {
		render(Header, { props: { email: 'test@example.com' } });
		const trigger = screen.getByText('test@example.com').closest('button');
		await fireEvent.click(trigger!);
		const profileLink = await screen.findByText('Profile');
		const anchor = profileLink.closest('a');
		expect(anchor).toBeTruthy();
		expect(anchor?.getAttribute('href')).toBe('/settings?tab=profile');
	});
});
