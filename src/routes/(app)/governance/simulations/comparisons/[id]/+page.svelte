<script lang="ts">
	import { deleteSimulationComparisonClient } from '$lib/api/simulations-client';
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import SimulationStatusBadge from '$lib/components/simulations/simulation-status-badge.svelte';
	import DeltaView from '$lib/components/simulations/delta-view.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let comparison = $derived(data.comparison);
	let actionLoading = $state(false);

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	async function handleExport(format: 'json' | 'csv') {
		try {
			const res = await fetch(`/api/governance/simulations/comparisons/${comparison.id}/export?format=${format}`);
			if (!res.ok) throw new Error('Export failed');
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `comparison-${comparison.id}.${format}`;
			a.click();
			URL.revokeObjectURL(url);
			addToast('success', `Export downloaded as ${format.toUpperCase()}`);
		} catch {
			addToast('error', 'Failed to export comparison');
		}
	}

	async function handleDelete() {
		if (!confirm('Permanently delete this comparison? This cannot be undone.')) return;
		actionLoading = true;
		try {
			await deleteSimulationComparisonClient(comparison.id);
			addToast('success', 'Comparison deleted');
			goto('/governance/simulations');
		} catch {
			addToast('error', 'Failed to delete comparison');
			actionLoading = false;
		}
	}
</script>

<div class="mb-4">
	<a href="/governance/simulations" class="text-sm text-primary hover:underline">&larr; Back to Simulations</a>
</div>

<PageHeader title={comparison.name} description="Simulation comparison detail" />

{#if comparison.is_stale}
	<div class="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
		<p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
			This comparison may be stale. The underlying simulation data has changed since this comparison was created.
		</p>
	</div>
{/if}

<div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
	<div>
		<p class="text-sm text-muted-foreground">Comparison Type</p>
		<SimulationStatusBadge value={comparison.comparison_type} type="status" />
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Simulation A</p>
		<p class="mt-1 truncate font-mono text-xs">{comparison.simulation_a_id.slice(0, 8)}...</p>
		<p class="text-xs text-muted-foreground">{comparison.simulation_a_type}</p>
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Simulation B</p>
		{#if comparison.simulation_b_id}
			<p class="mt-1 truncate font-mono text-xs">{comparison.simulation_b_id.slice(0, 8)}...</p>
			<p class="text-xs text-muted-foreground">{comparison.simulation_b_type ?? '-'}</p>
		{:else}
			<p class="mt-1 text-sm">Current State</p>
		{/if}
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Created By</p>
		<p class="mt-1 truncate font-mono text-xs">{comparison.created_by.slice(0, 8)}...</p>
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Created</p>
		<p class="mt-1 text-sm">{formatDate(comparison.created_at)}</p>
	</div>
</div>

<div class="mb-6 flex flex-wrap gap-2">
	<button
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
		disabled={actionLoading}
		onclick={() => handleExport('json')}
	>
		Export JSON
	</button>
	<button
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
		disabled={actionLoading}
		onclick={() => handleExport('csv')}
	>
		Export CSV
	</button>
	<button
		class="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm hover:bg-destructive/90 disabled:opacity-50"
		disabled={actionLoading}
		onclick={handleDelete}
	>
		Delete
	</button>
</div>

<section>
	<h2 class="mb-4 text-lg font-semibold">Comparison Results</h2>
	<DeltaView summary={comparison.summary_stats} delta={comparison.delta_results} />
</section>
