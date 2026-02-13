<script lang="ts">
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';
	import SimulationPanel from '$lib/components/birthright/simulation-panel.svelte';
	import ImpactPanel from '$lib/components/birthright/impact-panel.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let policy = $derived(data.policy);
	let entitlementMap = $derived(data.entitlementMap);

	let showArchiveDialog = $state(false);

	const statusClasses: Record<string, string> = {
		active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
		inactive: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
		archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
	};

	const evaluationModeLabels: Record<string, string> = {
		all_match: 'All Match',
		first_match: 'First Match'
	};

	const operatorLabels: Record<string, string> = {
		equals: '=',
		not_equals: '!=',
		in: 'in',
		not_in: 'not in',
		starts_with: 'starts with',
		contains: 'contains'
	};

	function formatConditionValue(value: string | string[]): string {
		if (Array.isArray(value)) {
			return `[${value.join(', ')}]`;
		}
		return value;
	}

	function resolveEntitlementName(id: string): string {
		return entitlementMap[id] ?? `${id.slice(0, 8)}...`;
	}

	let archiveFormEl: HTMLFormElement | undefined = $state();

	function handleArchiveConfirm() {
		archiveFormEl?.requestSubmit();
	}
</script>

<div class="flex items-center justify-between">
	<div class="flex items-center gap-3">
		<PageHeader title={policy.name} description="Birthright policy details" />
		<span
			class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {statusClasses[
				policy.status
			] ?? statusClasses.inactive}"
		>
			{policy.status}
		</span>
	</div>
	<a
		href="/governance/birthright"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Birthright
	</a>
</div>

<!-- Policy Info Card -->
<Card class="max-w-2xl">
	<CardHeader>
		<div class="flex items-center justify-between">
			<h2 class="text-xl font-semibold">Policy Information</h2>
			{#if policy.status !== 'archived'}
				<a
					href="/governance/birthright/policies/{policy.id}/edit"
					class="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
				>
					Edit
				</a>
			{/if}
		</div>
	</CardHeader>
	<CardContent class="space-y-4">
		<div class="grid gap-3">
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Name</span>
				<span class="text-sm font-medium">{policy.name}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Description</span>
				<span class="text-sm">{policy.description ?? '\u2014'}</span>
			</div>
			<div class="flex justify-between items-center">
				<span class="text-sm text-muted-foreground">Status</span>
				<span
					class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium {statusClasses[
						policy.status
					] ?? statusClasses.inactive}"
				>
					{policy.status}
				</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Priority</span>
				<span class="text-sm font-medium">{policy.priority}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Evaluation Mode</span>
				<span class="text-sm"
					>{evaluationModeLabels[policy.evaluation_mode] ?? policy.evaluation_mode}</span
				>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Grace Period</span>
				<span class="text-sm">{policy.grace_period_days} days</span>
			</div>

			<Separator />

			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Created</span>
				<span class="text-sm">{new Date(policy.created_at).toLocaleString()}</span>
			</div>
			<div class="flex justify-between">
				<span class="text-sm text-muted-foreground">Updated</span>
				<span class="text-sm">{new Date(policy.updated_at).toLocaleString()}</span>
			</div>
		</div>
	</CardContent>
</Card>

<!-- Action Buttons -->
{#if policy.status !== 'archived'}
	<Card class="max-w-2xl">
		<CardHeader>
			<h2 class="text-xl font-semibold">Actions</h2>
		</CardHeader>
		<CardContent>
			<div class="flex gap-2">
				{#if policy.status === 'inactive'}
					<form
						method="POST"
						action="?/enable"
						use:formEnhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'redirect') {
									addToast('success', 'Policy enabled');
									await update();
								} else if (result.type === 'success' && result.data?.error) {
									addToast('error', String(result.data.error));
								}
							};
						}}
					>
						<Button type="submit">Enable</Button>
					</form>
				{/if}
				{#if policy.status === 'active'}
					<form
						method="POST"
						action="?/disable"
						use:formEnhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'redirect') {
									addToast('success', 'Policy disabled');
									await update();
								} else if (result.type === 'success' && result.data?.error) {
									addToast('error', String(result.data.error));
								}
							};
						}}
					>
						<Button type="submit" variant="outline">Disable</Button>
					</form>
				{/if}
				<Button
					variant="destructive"
					onclick={() => {
						showArchiveDialog = true;
					}}>Archive</Button
				>
			</div>
		</CardContent>
	</Card>
{/if}

<!-- Hidden archive form (submitted via confirm dialog) -->
<form
	method="POST"
	action="?/archive"
	class="hidden"
	bind:this={archiveFormEl}
	use:formEnhance={() => {
		return async ({ result, update }) => {
			if (result.type === 'redirect') {
				addToast('success', 'Policy archived');
				await update();
			} else if (result.type === 'success' && result.data?.error) {
				addToast('error', String(result.data.error));
			}
		};
	}}
>
</form>

<Separator class="my-6" />

<!-- Conditions Section -->
<Card class="max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Conditions</h2>
	</CardHeader>
	<CardContent>
		{#if policy.conditions.length === 0}
			<p class="text-sm text-muted-foreground">No conditions defined.</p>
		{:else}
			<div class="space-y-2">
				{#each policy.conditions as condition, i}
					<div class="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
						<span class="font-medium">{condition.attribute}</span>
						<span class="text-muted-foreground"
							>{operatorLabels[condition.operator] ?? condition.operator}</span
						>
						<span class="font-mono">{formatConditionValue(condition.value)}</span>
					</div>
				{/each}
			</div>
		{/if}
	</CardContent>
</Card>

<!-- Entitlements Section -->
<Card class="max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">
			Entitlements ({policy.entitlement_ids.length})
		</h2>
	</CardHeader>
	<CardContent>
		{#if policy.entitlement_ids.length === 0}
			<p class="text-sm text-muted-foreground">No entitlements assigned.</p>
		{:else}
			<ul class="space-y-1">
				{#each policy.entitlement_ids as eid}
					<li class="flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm">
						<span class="font-medium">{resolveEntitlementName(eid)}</span>
						<span class="font-mono text-xs text-muted-foreground">({eid.slice(0, 8)}...)</span>
					</li>
				{/each}
			</ul>
		{/if}
	</CardContent>
</Card>

<Separator class="my-6" />

<!-- Simulation Panel -->
<Card class="max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Simulation</h2>
	</CardHeader>
	<CardContent>
		<SimulationPanel policyId={policy.id} mode="single" />
	</CardContent>
</Card>

<!-- Impact Panel -->
<Card class="max-w-2xl">
	<CardHeader>
		<h2 class="text-xl font-semibold">Impact Analysis</h2>
	</CardHeader>
	<CardContent>
		<ImpactPanel policyId={policy.id} />
	</CardContent>
</Card>

<!-- Archive Confirm Dialog -->
<ConfirmDialog
	bind:open={showArchiveDialog}
	title="Archive Policy"
	description="Are you sure you want to archive &quot;{policy.name}&quot;? Archived policies will no longer be evaluated. This action cannot be easily undone."
	confirmLabel="Archive"
	variant="destructive"
	onconfirm={handleArchiveConfirm}
/>
