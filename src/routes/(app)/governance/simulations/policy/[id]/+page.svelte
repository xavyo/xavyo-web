<script lang="ts">
	import type { PolicySimulationResult } from '$lib/api/types';
	import {
		executePolicySimulationClient,
		cancelPolicySimulationClient,
		archivePolicySimulationClient,
		restorePolicySimulationClient,
		deletePolicySimulationClient,
		updatePolicyNotesClient
	} from '$lib/api/simulations-client';
	import { invalidateAll, goto } from '$app/navigation';
	import { Dialog } from 'bits-ui';
	import DialogContent from '$lib/components/ui/dialog/dialog-content.svelte';
	import DialogHeader from '$lib/components/ui/dialog/dialog-header.svelte';
	import DialogTitle from '$lib/components/ui/dialog/dialog-title.svelte';
	import DialogFooter from '$lib/components/ui/dialog/dialog-footer.svelte';
	import { Button } from '$lib/components/ui/button';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import SimulationStatusBadge from '$lib/components/simulations/simulation-status-badge.svelte';
	import ImpactSummaryCards from '$lib/components/simulations/impact-summary-cards.svelte';
	import PolicyResultsTable from '$lib/components/simulations/policy-results-table.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let simulation = $derived(data.simulation);
	let results = $derived(data.results);
	let staleness = $derived(data.staleness);

	// svelte-ignore state_referenced_locally
	let notesValue = $state(data.simulation.notes ?? '');
	let notesSaving = $state(false);
	let actionLoading = $state(false);

	let confirmOpen = $state(false);
	let confirmTitle = $state('');
	let confirmMessage = $state('');
	let confirmAction = $state<(() => Promise<void>) | null>(null);

	function openConfirm(title: string, message: string, action: () => Promise<void>) {
		confirmTitle = title;
		confirmMessage = message;
		confirmAction = action;
		confirmOpen = true;
	}

	async function executeConfirm() {
		if (confirmAction) {
			await confirmAction();
		}
		confirmOpen = false;
		confirmAction = null;
	}

	let currentResults: PolicySimulationResult[] = $state([]);
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

	function handleExecute() {
		openConfirm('Execute Simulation', 'Execute this simulation? This will analyze all affected users.', async () => {
			actionLoading = true;
			try {
				await executePolicySimulationClient(simulation.id);
				addToast('success', 'Simulation executed successfully');
				await invalidateAll();
			} catch {
				addToast('error', 'Failed to execute simulation');
			} finally {
				actionLoading = false;
			}
		});
	}

	function handleCancel() {
		openConfirm('Cancel Simulation', 'Cancel this simulation?', async () => {
			actionLoading = true;
			try {
				await cancelPolicySimulationClient(simulation.id);
				addToast('success', 'Simulation cancelled');
				await invalidateAll();
			} catch {
				addToast('error', 'Failed to cancel simulation');
			} finally {
				actionLoading = false;
			}
		});
	}

	function handleArchive() {
		openConfirm('Archive Simulation', 'Archive this simulation?', async () => {
			actionLoading = true;
			try {
				await archivePolicySimulationClient(simulation.id);
				addToast('success', 'Simulation archived');
				await invalidateAll();
			} catch {
				addToast('error', 'Failed to archive simulation');
			} finally {
				actionLoading = false;
			}
		});
	}

	async function handleRestore() {
		actionLoading = true;
		try {
			await restorePolicySimulationClient(simulation.id);
			addToast('success', 'Simulation restored');
			await invalidateAll();
		} catch {
			addToast('error', 'Failed to restore simulation');
		} finally {
			actionLoading = false;
		}
	}

	function handleDelete() {
		openConfirm('Delete Simulation', 'Permanently delete this simulation? This cannot be undone.', async () => {
			actionLoading = true;
			try {
				await deletePolicySimulationClient(simulation.id);
				addToast('success', 'Simulation deleted');
				goto('/governance/simulations');
			} catch {
				addToast('error', 'Failed to delete simulation');
				actionLoading = false;
			}
		});
	}

	async function handleSaveNotes() {
		notesSaving = true;
		try {
			await updatePolicyNotesClient(simulation.id, notesValue);
			addToast('success', 'Notes saved');
			await invalidateAll();
		} catch {
			addToast('error', 'Failed to save notes');
		} finally {
			notesSaving = false;
		}
	}

	async function handleFilterResults(impactType: string | null) {
		try {
			const qs = new URLSearchParams({ limit: '50', offset: '0' });
			if (impactType) qs.set('impact_type', impactType);
			const res = await fetch(`/api/governance/simulations/policy/${simulation.id}/results?${qs}`);
			if (!res.ok) throw new Error('Failed to fetch results');
			const data = await res.json();
			currentResults = data.items ?? [];
			currentResultsTotal = data.total ?? 0;
		} catch {
			addToast('error', 'Failed to filter results');
		}
	}

	async function handleExport() {
		try {
			const res = await fetch(`/api/governance/simulations/policy/${simulation.id}/export?format=csv`);
			if (!res.ok) throw new Error('Export failed');
			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `simulation-${simulation.id}.csv`;
			a.click();
			URL.revokeObjectURL(url);
			addToast('success', 'Export downloaded');
		} catch {
			addToast('error', 'Failed to export simulation');
		}
	}
</script>

<div class="mb-4">
	<a href="/governance/simulations" class="text-sm text-primary hover:underline">&larr; Back to Simulations</a>
</div>

<PageHeader title={simulation.name} description="Policy simulation detail" />

{#if staleness.is_stale}
	<div class="mb-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950">
		<p class="text-sm font-medium text-yellow-800 dark:text-yellow-200">
			This simulation's data may be stale. The underlying data has changed since this simulation was executed. Consider re-executing for accurate results.
		</p>
	</div>
{/if}

<div class="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
	<div>
		<p class="text-sm text-muted-foreground">Type</p>
		<SimulationStatusBadge value={simulation.simulation_type} type="status" />
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Status</p>
		<SimulationStatusBadge value={simulation.status} type="status" />
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Created By</p>
		<p class="mt-1 truncate font-mono text-xs">{simulation.created_by.slice(0, 8)}...</p>
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Created</p>
		<p class="mt-1 text-sm">{formatDate(simulation.created_at)}</p>
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Executed</p>
		<p class="mt-1 text-sm">{formatDate(simulation.executed_at)}</p>
	</div>
	<div>
		<p class="text-sm text-muted-foreground">Affected Users</p>
		<p class="mt-1 text-sm font-semibold">{simulation.affected_user_count ?? '-'}</p>
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

<section class="mb-8">
	<h2 class="mb-4 text-lg font-semibold">Impact Summary</h2>
	<ImpactSummaryCards summary={simulation.impact_summary} type="policy" />
</section>

<section class="mb-8">
	<h2 class="mb-4 text-lg font-semibold">Results</h2>
	<PolicyResultsTable
		results={currentResults}
		total={currentResultsTotal}
		onFilterChange={handleFilterResults}
	/>
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

<!-- Confirm Dialog -->
<Dialog.Root bind:open={confirmOpen}>
	<DialogContent>
		<DialogHeader>
			<DialogTitle>{confirmTitle}</DialogTitle>
		</DialogHeader>
		<div class="py-4">
			<p class="text-sm text-muted-foreground">{confirmMessage}</p>
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (confirmOpen = false)}>Cancel</Button>
			<Button variant="destructive" onclick={executeConfirm}>Confirm</Button>
		</DialogFooter>
	</DialogContent>
</Dialog.Root>
