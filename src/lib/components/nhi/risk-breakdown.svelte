<script lang="ts">
	import type { NhiRiskBreakdown } from '$lib/api/types';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { riskLevelClass } from './nhi-utils';

	interface Props {
		breakdown: NhiRiskBreakdown;
	}

	let { breakdown }: Props = $props();

	function scoreBarColor(score: number): string {
		if (score >= 75) return 'bg-red-500';
		if (score >= 50) return 'bg-orange-400';
		if (score >= 25) return 'bg-yellow-400';
		return 'bg-green-500';
	}

	const sections = $derived([
		{ factors: breakdown.common_factors, label: 'Common Factors' },
		{ factors: breakdown.type_specific_factors, label: 'Type-Specific Factors' }
	]);
</script>

<Card>
	<CardHeader>
		<div class="flex items-center justify-between">
			<h3 class="text-lg font-semibold text-foreground">Risk Score</h3>
			<div class="flex items-center gap-3">
				<span class="text-2xl font-bold text-foreground">{breakdown.total_score}</span>
				<Badge class={riskLevelClass(breakdown.risk_level)}>{breakdown.risk_level}</Badge>
			</div>
		</div>
	</CardHeader>
	<CardContent>
		<div class="mb-3 h-3 w-full overflow-hidden rounded-full bg-muted">
			<div
				class="h-full rounded-full transition-all {scoreBarColor(breakdown.total_score)}"
				style:width="{breakdown.total_score}%"
			></div>
		</div>

		{#each sections as section}
			{#if section.factors.length > 0}
				<div class="mt-4">
					<h4 class="mb-2 text-sm font-medium text-muted-foreground">{section.label}</h4>
					<div class="space-y-3">
						{#each section.factors as factor}
							<div>
								<div class="flex items-center justify-between text-sm">
									<span class="text-foreground">{factor.name}</span>
									<span class="font-mono text-xs text-muted-foreground">
										{factor.score.toFixed(1)} &times; {factor.weight.toFixed(2)}
									</span>
								</div>
								<p class="mb-1 text-xs text-muted-foreground">{factor.description}</p>
								<div class="h-2 w-full overflow-hidden rounded-full bg-muted">
									<div
										class="h-full rounded-full {scoreBarColor(factor.score)}"
										style:width="{factor.score}%"
									></div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</CardContent>
</Card>
