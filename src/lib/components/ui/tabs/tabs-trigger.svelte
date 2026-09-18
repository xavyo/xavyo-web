<script lang="ts">
	import { Tabs } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		value: string;
		class?: string;
		children: Snippet;
	}

	let { value, class: className = '', children }: Props = $props();
</script>

<Tabs.Trigger
	{value}
	class={cn(
		'inline-flex items-center justify-center whitespace-nowrap border-b-2 border-transparent px-3 py-2 text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground',
		className
	)}
>
	{@render children()}
</Tabs.Trigger>
