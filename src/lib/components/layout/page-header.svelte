<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		children?: Snippet;
	}

	let { title, description, children }: Props = $props();
</script>

<div class="mb-6">
	<h1 class="text-2xl font-semibold tracking-tight">{title}</h1>
	{#if description}
		<p class="mt-1 text-sm text-muted-foreground">{description}</p>
	{/if}
	{#if children}
		<div class="mt-2">
			{@render children()}
		</div>
	{/if}
</div>
