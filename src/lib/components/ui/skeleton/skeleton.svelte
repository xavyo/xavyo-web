<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		class?: string;
	}

	let { class: className, ...restProps }: Props = $props();
</script>

<div class={cn('animate-pulse rounded-md bg-primary/10', className)} {...restProps}></div>
