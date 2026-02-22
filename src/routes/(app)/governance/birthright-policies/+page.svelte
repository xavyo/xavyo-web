<script lang="ts">
	import type { PageData } from './$types';
	import type { SimulateAllPoliciesResponse } from '$lib/api/types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import SimulationResults from '$lib/components/catalog/simulation-results.svelte';
	import { simulateAllPoliciesClient } from '$lib/api/birthright-client';
	import { addToast } from '$lib/stores/toast.svelte';
	import { goto } from '$app/navigation';
	import { Plus, Play } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();
	let policies = $derived(data.policies);

	// svelte-ignore state_referenced_locally
	let statusFilter = $state(data.filters.status ?? '');
	let showSimulateAll = $state(false);
	let simAttrs = $state('');
	let simAllResult = $state<SimulateAllPoliciesResponse | null>(null);

	function filterByStatus() {
		const params = new URLSearchParams();
		if (statusFilter) params.set('status', statusFilter);
		goto(`/governance/birthright-policies${params.toString() ? `?${params}` : ''}`, { invalidateAll: true });
	}

	async function runSimulateAll() {
		try {
			const attributes: Record<string, unknown> = {};
			for (const line of simAttrs.split('\n')) {
				const [key, ...rest] = line.split('=');
				if (key?.trim()) attributes[key.trim()] = rest.join('=').trim();
			}
			simAllResult = await simulateAllPoliciesClient({ attributes });
		} catch {
			addToast('error', 'Simulation failed');
		}
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader title="Birthright Policies" description="Manage automatic entitlement assignment policies" />
	<div class="flex gap-2">
		<Button variant="outline" onclick={() => showSimulateAll = !showSimulateAll}>
			<Play class="mr-1.5 h-3.5 w-3.5" />Simulate All
		</Button>
		<a href="/governance/birthright-policies/create">
			<Button><Plus class="mr-1.5 h-3.5 w-3.5" />New Policy</Button>
		</a>
	</div>
</div>

<div class="mt-4 flex gap-3">
	<select bind:value={statusFilter} onchange={filterByStatus} class="rounded-md border bg-background px-3 py-2 text-sm">
		<option value="">All Statuses</option>
		<option value="active">Active</option>
		<option value="inactive">Inactive</option>
		<option value="archived">Archived</option>
	</select>
</div>

{#if showSimulateAll}
	<div class="mt-4 rounded-lg border p-4">
		<h3 class="mb-2 font-semibold">Simulate All Policies</h3>
		<p class="mb-2 text-sm text-muted-foreground">Enter attributes (one per line, format: key=value)</p>
		<textarea bind:value={simAttrs} rows="4" placeholder="department=Engineering&#10;location=US" class="mb-3 w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"></textarea>
		<Button size="sm" onclick={runSimulateAll}>Run Simulation</Button>
		{#if simAllResult}
			<div class="mt-3">
				<SimulationResults allResult={simAllResult} />
			</div>
		{/if}
	</div>
{/if}

<div class="mt-6">
	{#if policies.length === 0}
		<EmptyState title="No birthright policies" description="Create your first policy to auto-assign entitlements." />
	{:else}
		<div class="space-y-2">
			{#each policies as policy (policy.id)}
				<a href="/governance/birthright-policies/{policy.id}" class="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted">
					<div>
						<p class="font-medium">{policy.name}</p>
						{#if policy.description}<p class="text-sm text-muted-foreground line-clamp-1">{policy.description}</p>{/if}
						<p class="mt-1 text-xs text-muted-foreground">
							Priority: {policy.priority} · Mode: {policy.evaluation_mode} · {policy.conditions.length} condition(s) · {policy.entitlement_ids.length} entitlement(s)
						</p>
					</div>
					<div class="flex items-center gap-2">
						{#if policy.status === 'archived'}
							<Badge variant="secondary">Archived</Badge>
						{:else if policy.status === 'inactive'}
							<Badge variant="outline">Inactive</Badge>
						{:else}
							<Badge variant="default">Active</Badge>
						{/if}
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
