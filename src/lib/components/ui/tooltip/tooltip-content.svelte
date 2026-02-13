<script lang="ts">
	import { Tooltip } from 'bits-ui';
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	interface Props {
		class?: string;
		side?: 'top' | 'right' | 'bottom' | 'left';
		sideOffset?: number;
		children: Snippet;
	}

	let { class: className = '', side = 'top', sideOffset = 4, children }: Props = $props();
</script>

<Tooltip.Content
	{side}
	{sideOffset}
	class={cn(
		'z-50 overflow-hidden rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md border animate-in fade-in-0 zoom-in-95',
		className
	)}
>
	{@render children()}
</Tooltip.Content>
