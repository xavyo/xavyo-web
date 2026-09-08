<script lang="ts">
	let { current = 1 }: { current?: number } = $props();

	const steps = ['Account', 'Verify email', 'Organization'];
</script>

<ol class="mb-6 flex items-center gap-2" aria-label="Sign-up progress">
	{#each steps as label, i (label)}
		{@const n = i + 1}
		{@const state = n < current ? 'done' : n === current ? 'current' : 'upcoming'}
		<li class="flex flex-1 items-center gap-2 last:flex-none">
			<span
				class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-medium transition-colors"
				class:border-primary={state !== 'upcoming'}
				class:bg-primary={state === 'done'}
				class:text-primary-foreground={state === 'done'}
				class:text-primary={state === 'current'}
				class:border-muted={state === 'upcoming'}
				class:text-muted-foreground={state === 'upcoming'}
				aria-current={state === 'current' ? 'step' : undefined}
			>
				{#if state === 'done'}✓{:else}{n}{/if}
			</span>
			<span
				class="hidden text-xs font-medium sm:inline"
				class:text-foreground={state !== 'upcoming'}
				class:text-muted-foreground={state === 'upcoming'}
			>
				{label}
			</span>
			{#if n < steps.length}
				<span
					class="h-px flex-1"
					class:bg-primary={state === 'done'}
					class:bg-border={state !== 'done'}
				></span>
			{/if}
		</li>
	{/each}
</ol>
