<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import SeverityBadge from '../severity-badge.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let thresholds = $derived(data.thresholds);

	let severityFilter = $state(data.filters.severity ?? '');
	let enabledFilter = $state(
		data.filters.is_enabled !== undefined ? String(data.filters.is_enabled) : ''
	);
	let deleteOpen = $state(false);
	let deleteThresholdId = $state('');
	let deleteThresholdName = $state('');

	const actionLabels: Record<string, string> = {
		alert: 'Alert',
		require_mfa: 'Require MFA',
		block: 'Block'
	};

	function applyFilters() {
		const params = new URLSearchParams();
		if (severityFilter) params.set('severity', severityFilter);
		if (enabledFilter) params.set('is_enabled', enabledFilter);
		const qs = params.toString();
		goto(`/governance/risk/thresholds${qs ? `?${qs}` : ''}`, { replaceState: true });
	}

	function openDeleteDialog(id: string, name: string) {
		deleteThresholdId = id;
		deleteThresholdName = name;
		deleteOpen = true;
	}

	function handleResult(result: any) {
		if (result.type === 'success' && result.data?.success) {
			addToast('success', `Threshold ${result.data.action} successfully`);
			invalidateAll();
		} else if (result.type === 'failure') {
			addToast('error', result.data?.error ?? 'Action failed');
		}
	}
</script>

<PageHeader title="Risk Thresholds" description="Manage risk score thresholds and automated actions">
	<div class="flex gap-2">
		<a href="/governance/risk" class="text-sm text-muted-foreground hover:text-foreground hover:underline self-center">&larr; Back to Risk Dashboard</a>
		<a href="/governance/risk/thresholds/create">
			<Button>Create Threshold</Button>
		</a>
	</div>
</PageHeader>

<!-- Filters -->
<div class="mb-4 flex flex-wrap items-center gap-3">
	<select
		class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
		bind:value={severityFilter}
		onchange={applyFilters}
	>
		<option value="">All Severities</option>
		<option value="info">Info</option>
		<option value="warning">Warning</option>
		<option value="critical">Critical</option>
	</select>

	<select
		class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
		bind:value={enabledFilter}
		onchange={applyFilters}
	>
		<option value="">All Status</option>
		<option value="true">Enabled</option>
		<option value="false">Disabled</option>
	</select>

	<span class="text-sm text-muted-foreground">
		{thresholds.total} threshold{thresholds.total !== 1 ? 's' : ''} found
	</span>
</div>

{#if thresholds.items.length === 0}
	<EmptyState
		title="No risk thresholds"
		description="No risk thresholds match the current filters. Create a threshold to trigger automated actions when risk scores exceed configured values."
	/>
{:else}
	<div class="overflow-x-auto rounded-lg border border-border">
		<table class="w-full text-sm">
			<thead class="border-b border-border bg-muted/50">
				<tr>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Score Value</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Severity</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Cooldown</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Enabled</th>
					<th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each thresholds.items as threshold}
					<tr class="border-b border-border hover:bg-muted/30">
						<td class="px-4 py-3">
							<a
								href="/governance/risk/thresholds/{threshold.id}"
								class="font-medium text-primary hover:underline"
							>
								{threshold.name}
							</a>
						</td>
						<td class="px-4 py-3 text-foreground">{threshold.score_value}</td>
						<td class="px-4 py-3">
							<SeverityBadge severity={threshold.severity} />
						</td>
						<td class="px-4 py-3 text-foreground">
							{actionLabels[threshold.action] ?? threshold.action}
						</td>
						<td class="px-4 py-3 text-foreground">
							{threshold.cooldown_hours ? `${threshold.cooldown_hours}h` : '-'}
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {threshold.is_enabled
									? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
									: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}"
							>
								{threshold.is_enabled ? 'Enabled' : 'Disabled'}
							</span>
						</td>
						<td class="px-4 py-3 text-right">
							<div class="flex items-center justify-end gap-1">
								{#if threshold.is_enabled}
									<form
										method="POST"
										action="?/disable"
										use:enhance={() => ({ result }) => handleResult(result)}
									>
										<input type="hidden" name="id" value={threshold.id} />
										<Button variant="outline" size="sm" type="submit">Disable</Button>
									</form>
								{:else}
									<form
										method="POST"
										action="?/enable"
										use:enhance={() => ({ result }) => handleResult(result)}
									>
										<input type="hidden" name="id" value={threshold.id} />
										<Button variant="outline" size="sm" type="submit">Enable</Button>
									</form>
								{/if}
								<Button
									variant="destructive"
									size="sm"
									onclick={() => openDeleteDialog(threshold.id, threshold.name)}
								>
									Delete
								</Button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Pagination info -->
	{#if thresholds.total > thresholds.limit}
		<div class="mt-4 flex items-center justify-between text-sm text-muted-foreground">
			<span>
				Showing {thresholds.offset + 1} - {Math.min(thresholds.offset + thresholds.limit, thresholds.total)} of {thresholds.total}
			</span>
			<div class="flex gap-2">
				{#if thresholds.offset > 0}
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							const params = new URLSearchParams();
							if (severityFilter) params.set('severity', severityFilter);
							if (enabledFilter) params.set('is_enabled', enabledFilter);
							params.set('offset', String(Math.max(0, thresholds.offset - thresholds.limit)));
							goto(`/governance/risk/thresholds?${params.toString()}`, { replaceState: true });
						}}
					>
						Previous
					</Button>
				{/if}
				{#if thresholds.offset + thresholds.limit < thresholds.total}
					<Button
						variant="outline"
						size="sm"
						onclick={() => {
							const params = new URLSearchParams();
							if (severityFilter) params.set('severity', severityFilter);
							if (enabledFilter) params.set('is_enabled', enabledFilter);
							params.set('offset', String(thresholds.offset + thresholds.limit));
							goto(`/governance/risk/thresholds?${params.toString()}`, { replaceState: true });
						}}
					>
						Next
					</Button>
				{/if}
			</div>
		</div>
	{/if}
{/if}

<!-- Delete Dialog -->
<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Risk Threshold</Dialog.Title>
			<Dialog.Description
				>Delete "{deleteThresholdName}"? This cannot be undone.</Dialog.Description
			>
		</Dialog.Header>
		<form
			method="POST"
			action="?/delete"
			use:enhance={() => {
				deleteOpen = false;
				return ({ result }) => handleResult(result);
			}}
		>
			<input type="hidden" name="id" value={deleteThresholdId} />
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (deleteOpen = false)}>Cancel</Button>
				<Button variant="destructive" type="submit">Delete</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
