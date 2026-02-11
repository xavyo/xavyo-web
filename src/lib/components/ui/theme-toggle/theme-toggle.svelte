<script lang="ts">
	import { Sun, Moon, Monitor } from 'lucide-svelte';
	import { themeStore } from '$lib/stores/theme.svelte';
	import { cn } from '$lib/utils/cn';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();

	function cycleMode() {
		const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];
		const currentIndex = modes.indexOf(themeStore.mode);
		const nextIndex = (currentIndex + 1) % modes.length;
		themeStore.setMode(modes[nextIndex]);
	}
</script>

<button
	onclick={cycleMode}
	class={cn(
		'inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
		className
	)}
	aria-label="Toggle theme ({themeStore.mode})"
>
	{#if themeStore.resolvedTheme === 'dark'}
		<Moon class="h-4 w-4" />
	{:else if themeStore.mode === 'system'}
		<Monitor class="h-4 w-4" />
	{:else}
		<Sun class="h-4 w-4" />
	{/if}
</button>
