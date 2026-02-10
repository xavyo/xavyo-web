<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';

	type Variant = 'default' | 'secondary' | 'destructive' | 'outline';

	interface Props {
		variant?: Variant;
		class?: string;
		children?: Snippet;
	}

	let { variant = 'default', class: className, children }: Props = $props();

	const variantClasses: Record<Variant, string> = {
		default: 'border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/80',
		secondary:
			'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
		destructive:
			'border-transparent bg-destructive text-destructive-foreground shadow-xs hover:bg-destructive/80',
		outline: 'border text-foreground'
	};
</script>

<span
	class={cn(
		'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
		variantClasses[variant],
		className
	)}
>
	{#if children}{@render children()}{/if}
</span>
