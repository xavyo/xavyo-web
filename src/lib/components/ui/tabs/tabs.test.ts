import { describe, it, expect } from 'vitest';
import TabsList from './tabs-list.svelte';
import TabsTrigger from './tabs-trigger.svelte';
import TabsContent from './tabs-content.svelte';

describe('Tabs components', () => {
	it('TabsList is defined', () => {
		expect(TabsList).toBeDefined();
	});

	it('TabsTrigger is defined', () => {
		expect(TabsTrigger).toBeDefined();
	});

	it('TabsContent is defined', () => {
		expect(TabsContent).toBeDefined();
	});
});
