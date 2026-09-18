<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		children?: Snippet;
	}

	let { title, description, children }: Props = $props();
</script>

<div class="mb-6 [animation:fade-up_0.35s_ease-out]">
	<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
		<div class="min-w-0">
			<h1 class="text-2xl font-semibold tracking-tight text-foreground sm:text-[1.75rem]">{title}</h1>
			{#if description}
				<p class="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
			{/if}
		</div>
		{#if children}
			<div class="flex shrink-0 flex-wrap items-center gap-2">
				{@render children()}
			</div>
		{/if}
	</div>
</div>
