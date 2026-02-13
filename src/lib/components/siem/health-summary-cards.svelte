<script lang="ts">
	import type { SiemHealthSummary } from '$lib/api/types';
	import CircuitStateBadge from './circuit-state-badge.svelte';

	let { health }: { health: SiemHealthSummary } = $props();

	function formatNumber(n: number): string {
		return n.toLocaleString();
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return 'Never';
		try {
			return new Date(dateStr).toLocaleString();
		} catch {
			return dateStr;
		}
	}
</script>

<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
	<!-- Total Sent -->
	<div class="rounded-lg border p-4">
		<p class="text-sm font-medium text-muted-foreground">Total Sent</p>
		<p class="mt-1 text-2xl font-bold">{formatNumber(health.total_events_sent)}</p>
	</div>
	<!-- Delivered -->
	<div class="rounded-lg border p-4">
		<p class="text-sm font-medium text-muted-foreground">Delivered</p>
		<p class="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">{formatNumber(health.total_events_delivered)}</p>
	</div>
	<!-- Failed -->
	<div class="rounded-lg border p-4">
		<p class="text-sm font-medium text-muted-foreground">Failed</p>
		<p class="mt-1 text-2xl font-bold text-red-600 dark:text-red-400">{formatNumber(health.total_events_failed)}</p>
	</div>
	<!-- Dropped -->
	<div class="rounded-lg border p-4">
		<p class="text-sm font-medium text-muted-foreground">Dropped</p>
		<p class="mt-1 text-2xl font-bold text-yellow-600 dark:text-yellow-400">{formatNumber(health.total_events_dropped)}</p>
	</div>
	<!-- Success Rate -->
	<div class="rounded-lg border p-4">
		<p class="text-sm font-medium text-muted-foreground">Success Rate</p>
		<p class="mt-1 text-2xl font-bold">{health.success_rate_percent.toFixed(2)}%</p>
	</div>
	<!-- Avg Latency -->
	<div class="rounded-lg border p-4">
		<p class="text-sm font-medium text-muted-foreground">Avg Latency</p>
		<p class="mt-1 text-2xl font-bold">{health.avg_latency_ms !== null ? `${health.avg_latency_ms.toFixed(1)}ms` : 'N/A'}</p>
	</div>
	<!-- Dead Letter Count -->
	<div class="rounded-lg border p-4">
		<p class="text-sm font-medium text-muted-foreground">Dead Letters</p>
		<p class="mt-1 text-2xl font-bold">{formatNumber(health.dead_letter_count)}</p>
	</div>
	<!-- Circuit State -->
	<div class="rounded-lg border p-4">
		<p class="text-sm font-medium text-muted-foreground">Circuit State</p>
		<p class="mt-2"><CircuitStateBadge state={health.circuit_state} /></p>
	</div>
</div>

<!-- Timestamps -->
<div class="mt-4 flex gap-6 text-sm text-muted-foreground">
	<span>Last success: {formatDate(health.last_success_at)}</span>
	<span>Last failure: {formatDate(health.last_failure_at)}</span>
</div>
