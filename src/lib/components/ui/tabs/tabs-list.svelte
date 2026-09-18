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
		'inline-flex h-10 w-full items-center justify-start gap-1 border-b border-border bg-transparent p-0 text-muted-foreground',
		className
	)}
>
	{@render children()}
</Tabs.List>
