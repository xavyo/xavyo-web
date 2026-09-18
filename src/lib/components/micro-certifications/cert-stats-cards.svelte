<script lang="ts">
	import type { MicroCertificationStats } from '$lib/api/types';

	interface Props {
		stats: MicroCertificationStats;
	}

	let { stats }: Props = $props();

	const cards = $derived([
		{ label: 'Total', value: stats.total, color: 'text-foreground' },
		{ label: 'Pending', value: stats.pending, color: 'text-warning' },
		{ label: 'Approved', value: stats.approved, color: 'text-success' },
		{ label: 'Revoked', value: stats.revoked, color: 'text-destructive' },
		{ label: 'Auto-Revoked', value: stats.auto_revoked, color: 'text-destructive ' },
		{ label: 'Flagged for Review', value: stats.flagged_for_review, color: 'text-warning-foreground ' },
		{ label: 'Skipped', value: stats.skipped, color: 'text-muted-foreground ' },
		{ label: 'Expired', value: stats.expired, color: 'text-warning' },
		{ label: 'Escalated', value: stats.escalated, color: 'text-warning-foreground ' },
		{ label: 'Past Deadline', value: stats.past_deadline, color: 'text-destructive ' }
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
