<script lang="ts">
	import type { NhiRiskSummary } from '$lib/api/types';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import Badge from '$lib/components/ui/badge/badge.svelte';
	import { riskLevelClass, nhiTypeLabel } from './nhi-utils';

	interface Props {
		summary: NhiRiskSummary;
	}

	let { summary }: Props = $props();
</script>

<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
	<Card>
		<CardHeader>
			<p class="text-sm text-muted-foreground">Total Entities</p>
		</CardHeader>
		<CardContent>
			<p class="text-3xl font-bold text-foreground">{summary.total_entities}</p>
		</CardContent>
	</Card>

	{#each summary.by_type as typeSummary}
		<Card>
			<CardHeader>
				<p class="text-sm text-muted-foreground">{nhiTypeLabel(typeSummary.nhi_type)}</p>
			</CardHeader>
			<CardContent>
				<p class="text-2xl font-bold text-foreground">{typeSummary.count}</p>
				<p class="mt-1 text-sm text-muted-foreground">
					Avg Score: <span class="font-mono">{typeSummary.avg_score.toFixed(1)}</span>
				</p>
			</CardContent>
		</Card>
	{/each}
</div>

<Card class="mt-4">
	<CardHeader>
		<h3 class="text-sm font-medium text-muted-foreground">Risk Distribution</h3>
	</CardHeader>
	<CardContent>
		<div class="flex flex-wrap gap-3">
			{#each summary.by_level as levelSummary}
				<div class="flex items-center gap-2">
					<Badge class={riskLevelClass(levelSummary.level)}>{levelSummary.level}</Badge>
					<span class="text-lg font-semibold text-foreground">{levelSummary.count}</span>
				</div>
			{/each}
		</div>
	</CardContent>
</Card>
