<script lang="ts">
	import { evaluatePasswordStrength } from '$lib/utils/password-strength';

	interface Props {
		password: string;
	}

	let { password }: Props = $props();

	let result = $derived(evaluatePasswordStrength(password));

	const colorMap = {
		weak: 'bg-destructive',
		fair: 'bg-orange-500',
		strong: 'bg-green-500',
		'very-strong': 'bg-emerald-500'
	};

	const widthMap = {
		weak: 'w-1/4',
		fair: 'w-2/4',
		strong: 'w-3/4',
		'very-strong': 'w-full'
	};

	const labelMap = {
		weak: 'Weak',
		fair: 'Fair',
		strong: 'Strong',
		'very-strong': 'Very strong'
	};
</script>

{#if password}
	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<div class="h-1.5 flex-1 rounded-full bg-muted">
				<div
					class="h-full rounded-full transition-all duration-300 {colorMap[result.level]} {widthMap[result.level]}"
					role="progressbar"
					aria-valuenow={result.score}
					aria-valuemin={0}
					aria-valuemax={7}
					aria-label="Password strength: {labelMap[result.level]}"
				></div>
			</div>
			<span class="ml-3 text-xs font-medium text-muted-foreground">{labelMap[result.level]}</span>
		</div>

		{#if result.feedback.length > 0}
			<ul class="space-y-0.5 text-xs text-muted-foreground">
				{#each result.feedback as item}
					<li>{item}</li>
				{/each}
			</ul>
		{/if}
	</div>
{/if}
