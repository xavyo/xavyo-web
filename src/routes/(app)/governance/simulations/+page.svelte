<script lang="ts">
	import type { PolicySimulation, BatchSimulation, SimulationComparison } from '$lib/api/types';
	import { deleteSimulationComparisonClient } from '$lib/api/simulations-client';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import SimulationStatusBadge from '$lib/components/simulations/simulation-status-badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const tabs = [
		{ id: 'policy', label: 'Policy Simulations' },
		{ id: 'batch', label: 'Batch Simulations' },
		{ id: 'comparisons', label: 'Comparisons' }
	];

	let activeTab = $state('policy');

	let policySimulations = $derived(data.policySimulations);
	let batchSimulations = $derived(data.batchSimulations);
	let comparisons = $derived(data.comparisons);

	let comparisonItems: SimulationComparison[] = $state([]);
	let comparisonItemsInitialized = $state(false);

	$effect(() => {
		if (!comparisonItemsInitialized && comparisons.items.length > 0) {
			comparisonItems = [...comparisons.items];
			comparisonItemsInitialized = true;
		} else if (!comparisonItemsInitialized) {
			comparisonItems = [];
			comparisonItemsInitialized = true;
		}
	});

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function simulationTypeLabel(type: string): string {
		return type.replace(/_/g, ' ');
	}

	async function handleDeleteComparison(id: string) {
		if (!confirm('Are you sure you want to delete this comparison?')) return;
		try {
			await deleteSimulationComparisonClient(id);
			comparisonItems = comparisonItems.filter((c) => c.id !== id);
			addToast('success', 'Comparison deleted');
		} catch {
			addToast('error', 'Failed to delete comparison');
		}
	}
</script>

<PageHeader
	title="Simulations"
	description="Create and manage policy simulations, batch simulations, and comparisons"
/>

<nav class="-mb-px flex gap-4 border-b border-border" role="tablist" aria-label="Simulations tabs">
	{#each tabs as tab}
		<button
			role="tab"
			aria-selected={activeTab === tab.id}
			aria-controls="tabpanel-{tab.id}"
			id="tab-{tab.id}"
			class="border-b-2 px-1 py-3 text-sm font-medium transition-colors {activeTab === tab.id
				? 'border-primary text-primary'
				: 'border-transparent text-muted-foreground hover:border-muted-foreground/30 hover:text-foreground'}"
			onclick={() => (activeTab = tab.id)}
		>
			{tab.label}
		</button>
	{/each}
</nav>

<div class="mt-6" role="tabpanel" id="tabpanel-{activeTab}" aria-labelledby="tab-{activeTab}">
	{#if activeTab === 'policy'}
		<div class="mb-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">{policySimulations.total} policy simulation{policySimulations.total !== 1 ? 's' : ''}</p>
			<a
				href="/governance/simulations/policy/create"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
			>
				Create Policy Simulation
			</a>
		</div>

		{#if policySimulations.items.length === 0}
			<div class="py-12 text-center">
				<p class="text-lg font-medium text-muted-foreground">No policy simulations</p>
				<p class="mt-1 text-sm text-muted-foreground">Create your first policy simulation to preview the impact of SoD rules or birthright policies.</p>
			</div>
		{:else}
			<div class="overflow-x-auto rounded-lg border border-border">
				<table class="w-full text-sm">
					<thead class="border-b border-border bg-muted/50">
						<tr>
							<th class="px-4 py-3 text-left font-medium">Name</th>
							<th class="px-4 py-3 text-left font-medium">Type</th>
							<th class="px-4 py-3 text-left font-medium">Status</th>
							<th class="px-4 py-3 text-left font-medium">Affected Users</th>
							<th class="px-4 py-3 text-left font-medium">Created</th>
							<th class="px-4 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each policySimulations.items as sim}
							<tr class="hover:bg-muted/30">
								<td class="px-4 py-3 font-medium">{sim.name}</td>
								<td class="px-4 py-3">
									<SimulationStatusBadge value={sim.simulation_type} type="status" />
								</td>
								<td class="px-4 py-3">
									<SimulationStatusBadge value={sim.status} type="status" />
								</td>
								<td class="px-4 py-3">{sim.affected_user_count ?? '-'}</td>
								<td class="px-4 py-3">{formatDate(sim.created_at)}</td>
								<td class="px-4 py-3 text-right">
									<a href="/governance/simulations/policy/{sim.id}" class="text-primary hover:underline">View</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

	{:else if activeTab === 'batch'}
		<div class="mb-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">{batchSimulations.total} batch simulation{batchSimulations.total !== 1 ? 's' : ''}</p>
			<a
				href="/governance/simulations/batch/create"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
			>
				Create Batch Simulation
			</a>
		</div>

		{#if batchSimulations.items.length === 0}
			<div class="py-12 text-center">
				<p class="text-lg font-medium text-muted-foreground">No batch simulations</p>
				<p class="mt-1 text-sm text-muted-foreground">Create a batch simulation to preview the impact of bulk role or entitlement changes.</p>
			</div>
		{:else}
			<div class="overflow-x-auto rounded-lg border border-border">
				<table class="w-full text-sm">
					<thead class="border-b border-border bg-muted/50">
						<tr>
							<th class="px-4 py-3 text-left font-medium">Name</th>
							<th class="px-4 py-3 text-left font-medium">Operation Type</th>
							<th class="px-4 py-3 text-left font-medium">Status</th>
							<th class="px-4 py-3 text-left font-medium">Total Users</th>
							<th class="px-4 py-3 text-left font-medium">Created</th>
							<th class="px-4 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each batchSimulations.items as sim}
							<tr class="hover:bg-muted/30">
								<td class="px-4 py-3 font-medium">{sim.name}</td>
								<td class="px-4 py-3">
									<SimulationStatusBadge value={sim.batch_type} type="status" />
								</td>
								<td class="px-4 py-3">
									<SimulationStatusBadge value={sim.status} type="status" />
								</td>
								<td class="px-4 py-3">{sim.total_users ?? '-'}</td>
								<td class="px-4 py-3">{formatDate(sim.created_at)}</td>
								<td class="px-4 py-3 text-right">
									<a href="/governance/simulations/batch/{sim.id}" class="text-primary hover:underline">View</a>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}

	{:else if activeTab === 'comparisons'}
		<div class="mb-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">{comparisonItems.length} comparison{comparisonItems.length !== 1 ? 's' : ''}</p>
			<a
				href="/governance/simulations/comparisons/create"
				class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
			>
				Create Comparison
			</a>
		</div>

		{#if comparisonItems.length === 0}
			<div class="py-12 text-center">
				<p class="text-lg font-medium text-muted-foreground">No comparisons</p>
				<p class="mt-1 text-sm text-muted-foreground">Create a comparison to analyze the differences between simulations.</p>
			</div>
		{:else}
			<div class="overflow-x-auto rounded-lg border border-border">
				<table class="w-full text-sm">
					<thead class="border-b border-border bg-muted/50">
						<tr>
							<th class="px-4 py-3 text-left font-medium">Name</th>
							<th class="px-4 py-3 text-left font-medium">Type</th>
							<th class="px-4 py-3 text-left font-medium">Created</th>
							<th class="px-4 py-3 text-right font-medium">Actions</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-border">
						{#each comparisonItems as comp}
							<tr class="hover:bg-muted/30">
								<td class="px-4 py-3 font-medium">{comp.name}</td>
								<td class="px-4 py-3">
									<SimulationStatusBadge value={comp.comparison_type} type="status" />
								</td>
								<td class="px-4 py-3">{formatDate(comp.created_at)}</td>
								<td class="px-4 py-3 text-right">
									<div class="flex items-center justify-end gap-2">
										<a href="/governance/simulations/comparisons/{comp.id}" class="text-primary hover:underline">View</a>
										<button
											class="text-destructive hover:underline"
											onclick={() => handleDeleteComparison(comp.id)}
										>
											Delete
										</button>
									</div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	{/if}
</div>
