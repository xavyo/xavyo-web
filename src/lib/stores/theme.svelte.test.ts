import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
	let store: Record<string, string> = {};
	return {
		getItem: vi.fn((key: string) => store[key] ?? null),
		setItem: vi.fn((key: string, value: string) => {
			store[key] = value;
		}),
		removeItem: vi.fn((key: string) => {
			delete store[key];
		}),
		clear: vi.fn(() => {
			store = {};
		})
	};
})();

// Mock matchMedia
const matchMediaMock = vi.fn((query: string) => ({
	matches: false,
	media: query,
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
	vi.unstubAllGlobals();
	vi.resetModules();
	document.documentElement.classList.remove('dark');
});

describe('theme store', () => {
	it('exports themeStore with mode, resolvedTheme, and setMode', async () => {
		const { themeStore } = await import('./theme.svelte');
		expect(themeStore).toBeDefined();
		expect(themeStore.mode).toBeDefined();
		expect(themeStore.resolvedTheme).toBeDefined();
		expect(themeStore.setMode).toBeInstanceOf(Function);
	});

	it('defaults to system mode when localStorage is empty', async () => {
		const { themeStore } = await import('./theme.svelte');
		expect(themeStore.mode).toBe('system');
	});

	it('resolves to light when mode is system and OS prefers light', async () => {
		matchMediaMock.mockReturnValue({
			matches: false,
			media: '(prefers-color-scheme: dark)',
			onchange: null,
			addListener: vi.fn(),
			removeListener: vi.fn(),
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			dispatchEvent: vi.fn()
		});
		const { themeStore } = await import('./theme.svelte');
		expect(themeStore.resolvedTheme).toBe('light');
	});

	it('setMode updates the mode', async () => {
		const { themeStore } = await import('./theme.svelte');
		themeStore.setMode('dark');
		expect(themeStore.mode).toBe('dark');
	});

	it('setMode dark resolves to dark theme', async () => {
		const { themeStore } = await import('./theme.svelte');
		themeStore.setMode('dark');
		expect(themeStore.resolvedTheme).toBe('dark');
	});

	it('setMode light resolves to light theme', async () => {
		const { themeStore } = await import('./theme.svelte');
		themeStore.setMode('light');
		expect(themeStore.resolvedTheme).toBe('light');
	});

	it('setMode dark adds .dark class to documentElement', async () => {
		const { themeStore } = await import('./theme.svelte');
		themeStore.setMode('dark');
		expect(document.documentElement.classList.contains('dark')).toBe(true);
	});

	it('setMode light removes .dark class from documentElement', async () => {
		document.documentElement.classList.add('dark');
		const { themeStore } = await import('./theme.svelte');
		themeStore.setMode('light');
		expect(document.documentElement.classList.contains('dark')).toBe(false);
	});

	it('setMode persists to localStorage', async () => {
		const { themeStore } = await import('./theme.svelte');
		themeStore.setMode('dark');
		expect(localStorageMock.setItem).toHaveBeenCalledWith('theme', 'dark');
	});

	it('exports initThemeListener function', async () => {
		const { initThemeListener } = await import('./theme.svelte');
		expect(initThemeListener).toBeInstanceOf(Function);
	});

	it('initThemeListener returns cleanup function', async () => {
		const { initThemeListener } = await import('./theme.svelte');
		const cleanup = initThemeListener();
		expect(cleanup).toBeInstanceOf(Function);
	});
});
