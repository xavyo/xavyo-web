<script lang="ts">
	import { Tabs } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		children: Snippet;
	}

	let { class: className = '', children }: Props = $props();
</script>

<Tabs.List
	class={cn(
		'inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
		className
	)}
>
	{@render children()}
</Tabs.List>
