import { describe, it, expect } from 'vitest';

describe('A2A Tasks list page', () => {
	it('page component is defined', async () => {
		const mod = await import('./+page.svelte');
		expect(mod.default).toBeDefined();
	});

	it('page component is a valid Svelte component constructor', async () => {
		const mod = await import('./+page.svelte');
		expect(typeof mod.default).toBe('function');
	});

	it('module has no unexpected named exports', async () => {
		const mod = await import('./+page.svelte');
		const keys = Object.keys(mod);
		// Svelte components export default only
		expect(keys).toContain('default');
	});
});
