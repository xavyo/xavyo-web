import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, fireEvent } from '@testing-library/svelte';
import ThemeToggle from './theme-toggle.svelte';

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

describe('ThemeToggle', () => {
	it('renders a button with aria-label', () => {
		const { getByRole } = render(ThemeToggle);
		const button = getByRole('button');
		expect(button).toBeDefined();
		expect(button.getAttribute('aria-label')).toContain('Toggle theme');
	});

	it('renders with theme toggle classes', () => {
		const { getByRole } = render(ThemeToggle);
		const button = getByRole('button');
		expect(button.className).toContain('items-center');
	});

	it('accepts additional className prop', () => {
		const { getByRole } = render(ThemeToggle, { props: { class: 'extra-class' } });
		const button = getByRole('button');
		expect(button.className).toContain('extra-class');
	});
});
