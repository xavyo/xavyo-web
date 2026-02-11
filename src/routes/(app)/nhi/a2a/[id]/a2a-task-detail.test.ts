import { describe, it, expect, vi } from 'vitest';

vi.mock('$app/forms', () => ({
	enhance: () => ({
		destroy: () => {}
	})
}));

vi.mock('$app/navigation', () => ({
	invalidateAll: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('$lib/stores/toast.svelte', () => ({
	addToast: vi.fn()
}));

describe('A2A Task Detail page', () => {
	it('page component is defined', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	}, 15000);

	it('page component is a valid Svelte component constructor', async () => {
		const mod = await import('./+page.svelte');
		expect(typeof mod.default).toBe('function');
	});

	it('module has no unexpected named exports', async () => {
		const mod = await import('./+page.svelte');
		const keys = Object.keys(mod);
		expect(keys).toContain('default');
	});
});
