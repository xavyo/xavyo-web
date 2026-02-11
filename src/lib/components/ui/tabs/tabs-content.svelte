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

<Tabs.Content
	{value}
	class={cn(
		'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
		className
	)}
>
	{@render children()}
</Tabs.Content>
