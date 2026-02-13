<script lang="ts">
	import type { MicroCertificationStats } from '$lib/api/types';

	interface Props {
		stats: MicroCertificationStats;
	}

	let { stats }: Props = $props();

	const cards = $derived([
		{ label: 'Total', value: stats.total, color: 'text-foreground' },
		{ label: 'Pending', value: stats.pending, color: 'text-yellow-600 dark:text-yellow-400' },
		{ label: 'Approved', value: stats.approved, color: 'text-green-600 dark:text-green-400' },
		{ label: 'Revoked', value: stats.revoked, color: 'text-red-600 dark:text-red-400' },
		{ label: 'Auto-Revoked', value: stats.auto_revoked, color: 'text-red-700 dark:text-red-300' },
		{ label: 'Flagged for Review', value: stats.flagged_for_review, color: 'text-yellow-700 dark:text-yellow-300' },
		{ label: 'Skipped', value: stats.skipped, color: 'text-gray-600 dark:text-gray-400' },
		{ label: 'Expired', value: stats.expired, color: 'text-orange-600 dark:text-orange-400' },
		{ label: 'Escalated', value: stats.escalated, color: 'text-orange-700 dark:text-orange-300' },
		{ label: 'Past Deadline', value: stats.past_deadline, color: 'text-red-700 dark:text-red-300' }
	]);
</script>

<div data-testid="stats-cards">
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
		{#each cards as card}
			<div class="rounded-lg border bg-card p-4" data-testid="stat-card">
				<p class="text-sm text-muted-foreground">{card.label}</p>
				<p class="mt-1 text-2xl font-bold {card.color}">{card.value}</p>
			</div>
		{/each}
	</div>
</div>
