<script lang="ts">
	import { cn } from '$lib/utils/cn';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	type Variant = 'default' | 'destructive';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: Variant;
		class?: string;
		children?: Snippet;
	}

	let { variant = 'default', class: className, children, ...restProps }: Props = $props();

	const variantClasses: Record<Variant, string> = {
		default: 'border-border/80 bg-card text-foreground',
		destructive:
			'border-destructive/40 bg-destructive/5 text-destructive dark:border-destructive/50 [&>svg]:text-destructive'
	};
</script>

<div
	role="alert"
	class={cn(
		'relative w-full rounded-lg border px-4 py-3 text-sm shadow-xs [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg~*]:pl-7',
		variantClasses[variant],
		className
	)}
	{...restProps}
>
	{#if children}{@render children()}{/if}
</div>
