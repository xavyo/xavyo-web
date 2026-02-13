<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import { ThemeToggle } from '$lib/components/ui/theme-toggle';
	import { initThemeListener } from '$lib/stores/theme.svelte';

	interface Props {
		children: Snippet;
	}

	let { children }: Props = $props();

	onMount(() => {
		const cleanup = initThemeListener();
		return cleanup;
	});
</script>

<div class="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 dark:from-background dark:via-background dark:to-primary/10">
	<div class="absolute right-4 top-4">
		<ThemeToggle />
	</div>

	<div class="w-full max-w-md">
		<div class="mb-8 text-center">
			<h1 class="text-3xl font-bold tracking-tight text-foreground">xavyo</h1>
			<p class="mt-1 text-sm text-muted-foreground">Identity Governance Platform</p>
		</div>
		{@render children()}
	</div>
</div>
