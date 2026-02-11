export type ThemeMode = 'light' | 'dark' | 'system';

let mode = $state<ThemeMode>(getInitialMode());

function getInitialMode(): ThemeMode {
	if (typeof window === 'undefined') return 'system';
	try {
		const stored = localStorage.getItem('theme');
		if (stored === 'light' || stored === 'dark' || stored === 'system') {
			return stored;
		}
	} catch {
		// localStorage unavailable
	}
	return 'system';
}

function getOsPreference(): boolean {
	if (typeof window === 'undefined') return false;
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function getResolvedTheme(): 'light' | 'dark' {
	if (mode === 'system') {
		return getOsPreference() ? 'dark' : 'light';
	}
	return mode;
}

function applyTheme() {
	if (typeof document === 'undefined') return;
	const resolved = getResolvedTheme();
	if (resolved === 'dark') {
		document.documentElement.classList.add('dark');
	} else {
		document.documentElement.classList.remove('dark');
	}
}

export function setMode(newMode: ThemeMode) {
	mode = newMode;
	try {
		localStorage.setItem('theme', newMode);
	} catch {
		// localStorage unavailable
	}
	applyTheme();
}

export function initThemeListener() {
	if (typeof window === 'undefined') return;
	const mql = window.matchMedia('(prefers-color-scheme: dark)');
	const handler = () => {
		if (mode === 'system') {
			applyTheme();
		}
	};
	mql.addEventListener('change', handler);
	applyTheme();
	return () => mql.removeEventListener('change', handler);
}

export const themeStore = {
	get mode() {
		return mode;
	},
	get resolvedTheme(): 'light' | 'dark' {
		return getResolvedTheme();
	},
	setMode
};
