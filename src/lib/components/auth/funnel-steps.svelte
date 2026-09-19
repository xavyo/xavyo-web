<script lang="ts">
	let { current = 1 }: { current?: number } = $props();

	const steps = ['Workspace', 'Verify email'];
</script>

<ol class="mb-8 flex items-center gap-3" aria-label="Sign-up progress">
	{#each steps as label, i (label)}
		{@const n = i + 1}
		{@const state = n < current ? 'done' : n === current ? 'current' : 'upcoming'}
		<li class="flex items-center gap-2">
			<span
				class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold"
				class:bg-primary={state !== 'upcoming'}
				class:text-primary-foreground={state !== 'upcoming'}
				class:bg-muted={state === 'upcoming'}
				class:text-muted-foreground={state === 'upcoming'}
				aria-current={state === 'current' ? 'step' : undefined}
			>
				{#if state === 'done'}✓{:else}{n}{/if}
			</span>
			<span
				class="text-xs font-medium"
				class:text-foreground={state !== 'upcoming'}
				class:text-muted-foreground={state === 'upcoming'}
			>
				{label}
			</span>
			{#if n < steps.length}
				<span
					class="mx-1 h-px w-8 sm:w-12"
					class:bg-primary={state === 'done'}
					class:bg-border={state !== 'done'}
				></span>
			{/if}
		</li>
	{/each}
</ol>
