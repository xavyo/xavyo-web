<script lang="ts">
	import type { BatchSimulationResult } from '$lib/api/types';
	import {
		executeBatchSimulationClient,
		applyBatchSimulationClient,
		archiveBatchSimulationClient,
		restoreBatchSimulationClient,
		deleteBatchSimulationClient,
		updateBatchNotesClient
	} from '$lib/api/simulations-client';
	import { invalidateAll, goto } from '$app/navigation';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import SimulationStatusBadge from '$lib/components/simulations/simulation-status-badge.svelte';
	import ImpactSummaryCards from '$lib/components/simulations/impact-summary-cards.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let simulation = $derived(data.simulation);
	let results = $derived(data.results);

	let notesValue = $state(data.simulation.notes ?? '');
	let notesSaving = $state(false);
	let actionLoading = $state(false);

	let showApplyDialog = $state(false);
	let applyJustification = $state('');
	let applyAcknowledgeScope = $state(false);

	let currentResults: BatchSimulationResult[] = $state([]);
	let currentResultsTotal = $state(0);
	let resultsInitialized = $state(false);

	$effect(() => {
		if (!resultsInitialized || results) {
			currentResults = results.items;
			currentResultsTotal = results.total;
			resultsInitialized = true;
		}
	});

	$effect(() => {
		notesValue = simulation.notes ?? '';
	});

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

	function batchTypeLabel(bt: string): string {
		return bt.replace(/_/g, ' ');
	}

	async function handleExecute() {
		if (!confirm('Execute this batch simulation? This will analyze all selected users.')) return;
		actionLoading = true;
		try {
			await executeBatchSimulationClient(simulation.id);
			addToast('success', 'Batch simulation executed successfully');
			await invalidateAll();
		} catch {
			addToast('error', 'Failed to execute batch simulation');
		} finally {
			actionLoading = false;
		}
	}

	async function handleApply() {
		if (!applyJustification.trim()) {
			addToast('error', 'Justification is required');
			return;
		}
		if (!applyAcknowledgeScope) {
			addToast('error', 'You must acknowledge the scope of changes');
			return;
		}
		actionLoading = true;
		try {
			await applyBatchSimulationClient(simulation.id, applyJustification, applyAcknowledgeScope);
			addToast('success', 'Batch simulation applied to production');
			showApplyDialog = false;
			applyJustification = '';
			applyAcknowledgeScope = false;
			await invalidateAll();
		} catch {
			addToast('error', 'Failed to apply batch simulation');
		} finally {
			actionLoading = false;
		}
	}

	async function handleArchive() {
		if (!confirm('Archive this simulation?')) return;
		actionLoading = true;
		try {
			await archiveBatchSimulationClient(simulation.id);
			addToast('success', 'Simulation archived');
			await invalidateAll();
		} catch {
			addToast('error', 'Failed to archive simulation');
		} finally {
			actionLoading = false;
		}
	}

	async function handleRestore() {
		actionLoading = true;
		try {
			await restoreBatchSimulationClient(simulation.id);
			addToast('success', 'Simulation restored');
			await invalidateAll();
		} catch {
			addToast('error', 'Failed to restore simulation');
		} finally {
			actionLoading = false;
		}
	}

	async function handleDelete() {
		if (!confirm('Permanently delete this simulation? This cannot be undone.')) return;
		actionLoading = true;
		try {
			await deleteBatchSimulationClient(simulation.id);
			addToast('success', 'Simulation deleted');
			goto('/governance/simulations');
		} catch {
			addToast('error', 'Failed to delete simulation');
			actionLoading = false;
		}
	}

	async function handleSaveNotes() {
		notesSaving = true;
		try {
			await updateBatchNotesClient(simulation.id, notesValue);
			addToast('success', 'Notes saved');
			await invalidateAll();
		} catch {
			addToast('error', 'Failed to save notes');
		} finally {
			notesSaving = false;
		}
	}

	async function handleExport() {
		try {
			const res = await fetch(
				`/api/governance/simulations/batch/${simulation.id}/export?format=csv`
			);
			if (!res.ok) throw new Error('Export failed');
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `batch-simulation-${simulation.id}.csv`;
			a.click();
			URL.revokeObjectURL(url);
			addToast('success', 'Export downloaded');
		} catch {
			addToast('error', 'Failed to export simulation');
		}
	}
</script>

<div class="mb-4">
	<a href="/governance/simulations" class="text-sm text-primary hover:underline"
		>&larr; Back to Simulations</a
	>
</div>

<PageHeader title={simulation.name} description="Batch simulation detail" />

{#if simulation.has_scope_warning}
	<div
		class="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950"
	>
		<p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
			Scope Warning: This batch simulation affects a large number of users. Review the results
			carefully before applying changes to production.
		</p>
	</div>
{/if}

<div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
	<div>
		<p class="text-sm text-muted-foreground">Batch Type</p>
		<SimulationStatusBadge value={simulation.batch_type} type="status" />
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Status</p>
		<SimulationStatusBadge value={simulation.status} type="status" />
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Selection Mode</p>
		<p class="mt-1 text-sm capitalize">{simulation.selection_mode.replace(/_/g, ' ')}</p>
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Total Users</p>
		<p class="mt-1 text-sm font-semibold">{simulation.total_users ?? '-'}</p>
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Processed Users</p>
		<p class="mt-1 text-sm font-semibold">{simulation.processed_users ?? '-'}</p>
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Created By</p>
		<p class="mt-1 truncate font-mono text-xs">{simulation.created_by.slice(0, 8)}...</p>
	</div>
</div>

<div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
	<div>
		<p class="text-sm text-muted-foreground">Created</p>
		<p class="mt-1 text-sm">{formatDate(simulation.created_at)}</p>
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Executed</p>
		<p class="mt-1 text-sm">{formatDate(simulation.executed_at)}</p>
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Applied</p>
		<p class="mt-1 text-sm">{formatDate(simulation.applied_at)}</p>
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Applied By</p>
		<p class="mt-1 truncate font-mono text-xs">
			{simulation.applied_by ? `${simulation.applied_by.slice(0, 8)}...` : '-'}
		</p>
	</div>
</div>

<div class="mb-6 flex flex-wrap gap-2">
	{#if simulation.status === 'draft'}
		<button
			class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
			disabled={actionLoading}
			onclick={handleExecute}
		>
			Execute
		</button>
		<button
			class="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm hover:bg-destructive/90 disabled:opacity-50"
			disabled={actionLoading}
			onclick={handleDelete}
		>
			Delete
		</button>
	{:else if simulation.status === 'executed'}
		<button
			class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
			disabled={actionLoading}
			onclick={() => (showApplyDialog = true)}
		>
			Apply to Production
		</button>
		<button
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
			disabled={actionLoading}
			onclick={handleArchive}
		>
			Archive
		</button>
		<button
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
			disabled={actionLoading}
			onclick={handleExport}
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
	{:else if simulation.status === 'applied'}
		<button
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
			disabled={actionLoading}
			onclick={handleArchive}
		>
			Archive
		</button>
	{:else if simulation.status === 'cancelled'}
		<button
			class="inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-sm hover:bg-destructive/90 disabled:opacity-50"
			disabled={actionLoading}
			onclick={handleDelete}
		>
			Delete
		</button>
	{/if}

	{#if simulation.is_archived}
		<button
			class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground disabled:opacity-50"
			disabled={actionLoading}
			onclick={handleRestore}
		>
			Restore
		</button>
	{/if}
</div>

{#if showApplyDialog}
	<div class="mb-6 rounded-lg border border-border bg-card p-6">
		<h3 class="mb-4 text-lg font-semibold">Apply to Production</h3>
		<p class="mb-4 text-sm text-muted-foreground">
			This will apply the simulated changes ({batchTypeLabel(simulation.batch_type)}) to all {simulation.total_users ?? 0}
			affected users. This action cannot be easily undone.
		</p>

		<div class="mb-4 space-y-2">
			<label for="apply_justification" class="block text-sm font-medium">Justification</label>
			<textarea
				id="apply_justification"
				class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
				placeholder="Provide justification for applying these changes..."
				bind:value={applyJustification}
			></textarea>
		</div>

		<div class="mb-4">
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={applyAcknowledgeScope} class="rounded border-input" />
				I acknowledge the scope of these changes and confirm they should be applied to production.
			</label>
		</div>

		<div class="flex gap-2">
			<button
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
				disabled={actionLoading || !applyJustification.trim() || !applyAcknowledgeScope}
				onclick={handleApply}
			>
				{actionLoading ? 'Applying...' : 'Confirm Apply'}
			</button>
			<button
				class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				onclick={() => {
					showApplyDialog = false;
					applyJustification = '';
					applyAcknowledgeScope = false;
				}}
			>
				Cancel
			</button>
		</div>
	</div>
{/if}

<section class="mb-8">
	<h2 class="mb-4 text-lg font-semibold">Impact Summary</h2>
	<ImpactSummaryCards summary={simulation.impact_summary} type="batch" />
</section>

<section class="mb-8">
	<h2 class="mb-4 text-lg font-semibold">Batch Results ({currentResultsTotal})</h2>
	{#if currentResults.length === 0}
		<p class="text-sm text-muted-foreground">
			No results available. Execute the simulation to generate per-user results.
		</p>
	{:else}
		<div class="overflow-x-auto rounded-lg border border-border">
			<table class="w-full text-sm">
				<thead class="border-b border-border bg-muted/50">
					<tr>
						<th class="px-4 py-3 text-left font-medium text-muted-foreground">User ID</th>
						<th class="px-4 py-3 text-left font-medium text-muted-foreground">Access Gained</th>
						<th class="px-4 py-3 text-left font-medium text-muted-foreground">Access Lost</th>
						<th class="px-4 py-3 text-left font-medium text-muted-foreground">Warnings</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each currentResults as result}
						<tr class="hover:bg-muted/30">
							<td class="px-4 py-3 font-mono text-xs">{result.user_id.slice(0, 8)}...</td>
							<td class="px-4 py-3">
								{#if result.access_gained.length > 0}
									<div class="space-y-1">
										{#each result.access_gained as item}
											<span
												class="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200"
											>
												+{item.name}
											</span>
										{/each}
									</div>
								{:else}
									<span class="text-muted-foreground">-</span>
								{/if}
							</td>
							<td class="px-4 py-3">
								{#if result.access_lost.length > 0}
									<div class="space-y-1">
										{#each result.access_lost as item}
											<span
												class="inline-flex items-center rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800 dark:bg-orange-900 dark:text-orange-200"
											>
												-{item.name}
											</span>
										{/each}
									</div>
								{:else}
									<span class="text-muted-foreground">-</span>
								{/if}
							</td>
							<td class="px-4 py-3">
								{#if result.warnings.length > 0}
									<div class="space-y-1">
										{#each result.warnings as warning}
											<p class="text-xs text-yellow-600 dark:text-yellow-400">{warning}</p>
										{/each}
									</div>
								{:else}
									<span class="text-muted-foreground">-</span>
								{/if}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>

<section>
	<h2 class="mb-4 text-lg font-semibold">Notes</h2>
	<textarea
		class="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		placeholder="Add notes about this simulation..."
		bind:value={notesValue}
	></textarea>
	<div class="mt-2">
		<button
			class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
			disabled={notesSaving}
			onclick={handleSaveNotes}
		>
			{notesSaving ? 'Saving...' : 'Save Notes'}
		</button>
	</div>
</section>
