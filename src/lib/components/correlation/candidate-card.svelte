<script lang="ts">
	import type { CorrelationCandidate } from '$lib/api/types';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { CheckCircle, AlertTriangle } from 'lucide-svelte';

	interface Props {
		candidate: CorrelationCandidate;
		isSelected?: boolean;
		onSelect?: (candidateId: string) => void;
	}

	let { candidate, isSelected = false, onSelect }: Props = $props();

	let confidencePercent = $derived(Math.round(candidate.aggregate_confidence * 100));

	let confidenceColor = $derived(
		confidencePercent >= 80
			? 'bg-green-500'
			: confidencePercent >= 50
				? 'bg-yellow-500'
				: 'bg-red-500'
	);

	let attributeEntries = $derived(Object.entries(candidate.per_attribute_scores));

	function handleClick() {
		onSelect?.(candidate.id);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			handleClick();
		}
	}
</script>

<button
	type="button"
	class="w-full cursor-pointer rounded-lg border p-4 text-left transition-colors hover:bg-accent/50 {isSelected
		? 'border-primary bg-primary/5 ring-2 ring-primary'
		: 'border-border'}"
	onclick={handleClick}
	onkeydown={handleKeydown}
	aria-pressed={isSelected}
>
	<div class="flex items-start justify-between gap-3">
		<div class="min-w-0 flex-1">
			<h4 class="truncate text-sm font-semibold text-foreground">
				{candidate.identity_display_name}
			</h4>
			<p class="mt-0.5 text-xs text-muted-foreground">ID: {candidate.identity_id}</p>
		</div>
		<div class="flex items-center gap-1.5">
			{#if candidate.is_definitive_match}
				<Badge class="border-transparent bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
					<CheckCircle class="mr-1 h-3 w-3" />
					Definitive Match
				</Badge>
			{/if}
			{#if candidate.is_deactivated}
				<Badge class="border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
					<AlertTriangle class="mr-1 h-3 w-3" />
					Deactivated
				</Badge>
			{/if}
		</div>
	</div>

	<!-- Aggregate confidence bar -->
	<div class="mt-3">
		<div class="mb-1 flex items-center justify-between text-xs">
			<span class="text-muted-foreground">Aggregate Confidence</span>
			<span class="font-medium text-foreground">{confidencePercent}%</span>
		</div>
		<div class="h-2 w-full overflow-hidden rounded-full bg-muted">
			<div
				class="h-full rounded-full transition-all {confidenceColor}"
				style="width: {confidencePercent}%"
			></div>
		</div>
	</div>

	<!-- Per-attribute scores -->
	{#if attributeEntries.length > 0}
		<div class="mt-3 space-y-1.5">
			<p class="text-xs font-medium text-muted-foreground">Attribute Scores</p>
			{#each attributeEntries as [attr, score]}
				{@const pct = Math.round(score * 100)}
				{@const barColor =
					pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}
				<div class="flex items-center gap-2">
					<span class="w-24 shrink-0 truncate text-xs text-muted-foreground" title={attr}>
						{attr}
					</span>
					<div class="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
						<div
							class="h-full rounded-full transition-all {barColor}"
							style="width: {pct}%"
						></div>
					</div>
					<span class="w-8 text-right text-xs font-medium text-foreground">{pct}%</span>
				</div>
			{/each}
		</div>
	{/if}
</button>
