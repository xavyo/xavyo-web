<script lang="ts">
	import type { RiskScoreSummary } from '$lib/api/types';

	let { summary }: { summary: RiskScoreSummary } = $props();

	function getCount(level: string): number {
		return summary.by_level.find((l) => l.level === level)?.count ?? 0;
	}
</script>

<div class="space-y-4">
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
		<div class="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950">
			<p class="text-sm font-medium text-success">Low Risk</p>
			<p class="text-2xl font-bold text-success ">{getCount('low')}</p>
		</div>
		<div class="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
			<p class="text-sm font-medium text-warning">Medium Risk</p>
			<p class="text-2xl font-bold text-warning-foreground ">{getCount('medium')}</p>
		</div>
		<div class="rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-800 dark:bg-orange-950">
			<p class="text-sm font-medium text-warning">High Risk</p>
			<p class="text-2xl font-bold text-warning-foreground ">{getCount('high')}</p>
		</div>
		<div class="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950">
			<p class="text-sm font-medium text-destructive">Critical Risk</p>
			<p class="text-2xl font-bold text-destructive ">{getCount('critical')}</p>
		</div>
	</div>
	<div class="flex gap-6 text-sm text-muted-foreground">
		<span>Total Users: <strong class="text-foreground">{summary.total_users}</strong></span>
		<span>Average Score: <strong class="text-foreground">{summary.average_score.toFixed(1)}</strong></span>
	</div>
</div>
