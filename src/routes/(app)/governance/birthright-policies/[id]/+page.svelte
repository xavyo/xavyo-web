<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import SimulationResults from '$lib/components/catalog/simulation-results.svelte';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/stores/toast.svelte';

	let { data, form: actionData }: { data: PageData; form: ActionData } = $props();
	let policy = $derived(data.policy);
	let simulation = $derived(actionData?.simulation ?? null);
	let impact = $derived(actionData?.impact ?? null);

	let simAttrs = $state('');
	let showArchiveConfirm = $state(false);
</script>

<div class="flex items-center gap-3">
	<PageHeader title={policy.name} description={policy.description ?? 'Birthright policy details'} />
	{#if policy.status === 'archived'}
		<Badge variant="secondary">Archived</Badge>
	{:else if policy.status === 'inactive'}
		<Badge variant="outline">Inactive</Badge>
	{:else}
		<Badge variant="default">Active</Badge>
	{/if}
</div>

<div class="mt-6 space-y-6">
	<!-- Policy Info -->
	<div class="rounded-lg border p-4">
		<h3 class="mb-3 font-semibold">Policy Details</h3>
		<dl class="grid gap-2 text-sm sm:grid-cols-2">
			<div><dt class="text-muted-foreground">Priority</dt><dd class="font-medium">{policy.priority}</dd></div>
			<div><dt class="text-muted-foreground">Evaluation Mode</dt><dd class="font-medium">{policy.evaluation_mode}</dd></div>
			<div><dt class="text-muted-foreground">Grace Period</dt><dd class="font-medium">{policy.grace_period_days} days</dd></div>
			<div><dt class="text-muted-foreground">Entitlements</dt><dd class="font-medium">{policy.entitlement_ids.length}</dd></div>
		</dl>
	</div>

	<!-- Conditions -->
	<div class="rounded-lg border p-4">
		<h3 class="mb-3 font-semibold">Conditions ({policy.conditions.length})</h3>
		<div class="space-y-2">
			{#each policy.conditions as cond, i}
				<div class="flex items-center gap-2 rounded bg-muted p-2 text-sm">
					<span class="font-medium">{cond.attribute}</span>
					<Badge variant="outline">{cond.operator}</Badge>
					<span class="font-mono">{JSON.stringify(cond.value)}</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Simulation -->
	<div class="rounded-lg border p-4">
		<h3 class="mb-3 font-semibold">Simulate Policy</h3>
		<form method="POST" action="?/simulate" use:enhance>
			<p class="mb-2 text-sm text-muted-foreground">Enter attributes (one per line, format: key=value)</p>
			<textarea name="attributes_text" bind:value={simAttrs} rows="4" placeholder="department=Engineering&#10;location=US" class="mb-3 w-full rounded-md border bg-background px-3 py-2 text-sm font-mono"></textarea>
			<Button size="sm" type="submit">Run Simulation</Button>
		</form>
		{#if simulation}
			<div class="mt-3">
				<SimulationResults singleResult={simulation} />
			</div>
		{/if}
	</div>

	<!-- Impact Analysis -->
	<div class="rounded-lg border p-4">
		<h3 class="mb-3 font-semibold">Impact Analysis</h3>
		<form method="POST" action="?/impact" use:enhance>
			<Button size="sm" variant="outline" type="submit">Run Impact Analysis</Button>
		</form>
		{#if impact}
			<div class="mt-3 rounded bg-muted p-3 text-sm">
				<p>Total users affected: <span class="font-semibold">{impact.summary.total_users_affected}</span></p>
				<p>Users gaining access: <span class="font-semibold">{impact.summary.users_gaining_access}</span></p>
				<p>Users losing access: <span class="font-semibold">{impact.summary.users_losing_access}</span></p>
				<p>Total entitlements granted: <span class="font-semibold">{impact.summary.total_entitlements_granted}</span></p>
			</div>
		{/if}
	</div>

	<!-- Actions -->
	<div class="border-t pt-4">
		<div class="flex gap-2">
			{#if policy.status === 'active'}
				<form method="POST" action="?/disable" use:enhance={() => {
					return async ({ update }) => {
						await update();
						addToast('success', 'Policy disabled');
						invalidateAll();
					};
				}}>
					<Button variant="outline" type="submit">Disable</Button>
				</form>
			{:else if policy.status === 'inactive'}
				<form method="POST" action="?/enable" use:enhance={() => {
					return async ({ update }) => {
						await update();
						addToast('success', 'Policy enabled');
						invalidateAll();
					};
				}}>
					<Button type="submit">Enable</Button>
				</form>
			{/if}

			{#if policy.status !== 'archived'}
				{#if showArchiveConfirm}
					<form method="POST" action="?/archive">
						<Button variant="destructive" type="submit">Confirm Archive</Button>
					</form>
					<Button variant="outline" onclick={() => showArchiveConfirm = false}>Cancel</Button>
				{:else}
					<Button variant="outline" onclick={() => showArchiveConfirm = true}>Archive</Button>
				{/if}
			{/if}
		</div>
	</div>
</div>
