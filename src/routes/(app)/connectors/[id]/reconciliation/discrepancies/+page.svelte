<script lang="ts">
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance as formEnhance } from '$app/forms';
	import { addToast } from '$lib/stores/toast.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import * as Dialog from '$lib/components/ui/dialog';
	import DiscrepancyTypeBadge from '$lib/components/operations/discrepancy-type-badge.svelte';

	let { data }: { data: PageData } = $props();

	let discrepancyTypeFilter = $state('');
	let resolutionStatusFilter = $state('');

	// Remediate dialog state
	let showRemediateDialog = $state(false);
	let remediateDiscrepancyId = $state('');
	let remediateAction = $state('update');
	let remediateDirection = $state('xavyo_to_target');

	// Bulk remediate dialog state
	let showBulkDialog = $state(false);
	let bulkAction = $state('update');
	let bulkDirection = $state('xavyo_to_target');

	// Row selection
	let selectedIds = $state<string[]>([]);

	const discrepancies = $derived(data.discrepancies.discrepancies);
	const total = $derived(data.discrepancies.total);
	const limit = $derived(data.discrepancies.limit);
	const offset = $derived(data.discrepancies.offset);
	const pageCount = $derived(Math.ceil(total / limit));
	const currentPage = $derived(Math.floor(offset / limit));
	const hasFilters = $derived(discrepancyTypeFilter !== '' || resolutionStatusFilter !== '');
	const allSelected = $derived(
		discrepancies.length > 0 && discrepancies.every((d) => selectedIds.includes(d.id))
	);
	const canBulkRemediate = $derived(selectedIds.length > 0 && selectedIds.length <= 100);

	$effect(() => {
		const url = new URL(window.location.href);
		discrepancyTypeFilter = url.searchParams.get('discrepancy_type') ?? '';
		resolutionStatusFilter = url.searchParams.get('resolution_status') ?? '';
	});

	// Reset selection when data changes
	$effect(() => {
		discrepancies;
		selectedIds = [];
	});

	const typeOptions = [
		{ value: '', label: 'All types' },
		{ value: 'missing', label: 'Missing' },
		{ value: 'orphan', label: 'Orphan' },
		{ value: 'mismatch', label: 'Mismatch' },
		{ value: 'collision', label: 'Collision' },
		{ value: 'unlinked', label: 'Unlinked' },
		{ value: 'deleted', label: 'Deleted' }
	];

	const statusOptions = [
		{ value: '', label: 'All statuses' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'resolved', label: 'Resolved' },
		{ value: 'ignored', label: 'Ignored' }
	];

	const actionOptions = [
		{ value: 'create', label: 'Create' },
		{ value: 'update', label: 'Update' },
		{ value: 'delete', label: 'Delete' },
		{ value: 'link', label: 'Link' },
		{ value: 'unlink', label: 'Unlink' },
		{ value: 'inactivate_identity', label: 'Inactivate Identity' }
	];

	const directionOptions = [
		{ value: 'xavyo_to_target', label: 'Xavyo to Target' },
		{ value: 'target_to_xavyo', label: 'Target to Xavyo' }
	];

	function buildUrl(overrides: Record<string, string | number | undefined> = {}): string {
		const params = new URLSearchParams();
		const dt = (overrides.discrepancy_type as string) ?? discrepancyTypeFilter;
		const rs = (overrides.resolution_status as string) ?? resolutionStatusFilter;
		const off = overrides.offset ?? 0;
		if (dt) params.set('discrepancy_type', dt);
		if (rs) params.set('resolution_status', rs);
		params.set('limit', String(limit));
		params.set('offset', String(off));
		return `/connectors/${data.connectorId}/reconciliation/discrepancies?${params}`;
	}

	function applyFilter() {
		goto(buildUrl({ offset: 0 }));
	}

	function goToPage(page: number) {
		goto(buildUrl({ offset: page * limit }));
	}

	function toggleSelectAll() {
		if (allSelected) {
			selectedIds = [];
		} else {
			selectedIds = discrepancies.map((d) => d.id);
		}
	}

	function toggleSelect(id: string) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((sid) => sid !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}

	function openRemediateDialog(discrepancyId: string) {
		remediateDiscrepancyId = discrepancyId;
		remediateAction = 'update';
		remediateDirection = 'xavyo_to_target';
		showRemediateDialog = true;
	}

	function openBulkDialog() {
		bulkAction = 'update';
		bulkDirection = 'xavyo_to_target';
		showBulkDialog = true;
	}

	function resolutionStatusClass(status: string): string {
		switch (status) {
			case 'resolved':
				return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
			case 'ignored':
				return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
			default:
				return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
		}
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Discrepancies"
		description="View and remediate reconciliation discrepancies for this connector"
	/>
	<a
		href="/connectors/{data.connectorId}/reconciliation"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Reconciliation
	</a>
</div>

<!-- Filter bar -->
<div class="mb-4 flex flex-wrap items-center gap-3">
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={discrepancyTypeFilter}
		onchange={applyFilter}
	>
		{#each typeOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={resolutionStatusFilter}
		onchange={applyFilter}
	>
		{#each statusOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>

	{#if canBulkRemediate}
		<Button variant="default" size="sm" onclick={openBulkDialog}>
			Bulk Remediate ({selectedIds.length})
		</Button>
	{/if}
</div>

{#if discrepancies.length === 0}
	{#if hasFilters}
		<EmptyState
			title="No discrepancies match your filters"
			description="Try adjusting your filter criteria."
			icon="search"
		/>
		<div class="flex justify-center pb-4">
			<button
				onclick={() => {
					discrepancyTypeFilter = '';
					resolutionStatusFilter = '';
					goto(
						`/connectors/${data.connectorId}/reconciliation/discrepancies?limit=${limit}&offset=0`
					);
				}}
				class="text-sm font-medium text-primary hover:underline"
			>
				Clear filters
			</button>
		</div>
	{:else}
		<EmptyState
			title="No discrepancies"
			description="No discrepancies have been found for this connector."
			icon="inbox"
		/>
	{/if}
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left">
						<input
							type="checkbox"
							checked={allSelected}
							onchange={toggleSelectAll}
							class="h-4 w-4 rounded border-gray-300"
						/>
					</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Identity ID</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">External UID</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Attribute</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Expected</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Actual</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each discrepancies as discrepancy}
					<tr class="border-b transition-colors hover:bg-muted/50">
						<td class="px-4 py-3">
							<input
								type="checkbox"
								checked={selectedIds.includes(discrepancy.id)}
								onchange={() => toggleSelect(discrepancy.id)}
								class="h-4 w-4 rounded border-gray-300"
							/>
						</td>
						<td class="px-4 py-3">
							<DiscrepancyTypeBadge type={discrepancy.discrepancy_type} />
						</td>
						<td class="px-4 py-3 text-muted-foreground max-w-32 truncate" title={discrepancy.identity_id ?? ''}>
							{discrepancy.identity_id ?? '---'}
						</td>
						<td class="px-4 py-3 text-muted-foreground max-w-32 truncate" title={discrepancy.external_uid ?? ''}>
							{discrepancy.external_uid ?? '---'}
						</td>
						<td class="px-4 py-3">
							{discrepancy.attribute_name ?? '---'}
						</td>
						<td class="px-4 py-3 text-muted-foreground max-w-32 truncate" title={discrepancy.expected_value ?? ''}>
							{discrepancy.expected_value ?? '---'}
						</td>
						<td class="px-4 py-3 text-muted-foreground max-w-32 truncate" title={discrepancy.actual_value ?? ''}>
							{discrepancy.actual_value ?? '---'}
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {resolutionStatusClass(discrepancy.resolution_status)}"
							>
								{discrepancy.resolution_status}
							</span>
						</td>
						<td class="px-4 py-3">
							{#if discrepancy.resolution_status === 'pending'}
								<div class="flex gap-2">
									<Button
										variant="outline"
										size="sm"
										onclick={() => openRemediateDialog(discrepancy.id)}
									>
										Remediate
									</Button>
									<form
										method="POST"
										action="?/ignore"
										use:formEnhance={() => {
											return async ({ result }) => {
												if (result.type === 'success') {
													addToast('success', 'Discrepancy ignored');
													await invalidateAll();
												} else if (result.type === 'failure') {
													addToast(
														'error',
														(result.data?.error as string) || 'Failed to ignore'
													);
												}
											};
										}}
									>
										<input type="hidden" name="discrepancy_id" value={discrepancy.id} />
										<Button type="submit" variant="ghost" size="sm">Ignore</Button>
									</form>
								</div>
							{:else}
								<span class="text-xs text-muted-foreground">
									{discrepancy.resolved_at ? formatDate(discrepancy.resolved_at) : '---'}
								</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if pageCount > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {offset + 1}&ndash;{Math.min(offset + limit, total)} of {total} discrepancies
			</p>
			<div class="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={currentPage === 0}
					onclick={() => goToPage(currentPage - 1)}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={currentPage >= pageCount - 1}
					onclick={() => goToPage(currentPage + 1)}
				>
					Next
				</Button>
			</div>
		</div>
	{/if}
{/if}

<!-- Remediate single discrepancy dialog -->
<Dialog.Root bind:open={showRemediateDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Remediate Discrepancy</Dialog.Title>
			<Dialog.Description>
				Choose an action and direction to remediate this discrepancy.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/remediate"
			use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						addToast('success', 'Discrepancy remediated successfully');
						showRemediateDialog = false;
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast('error', (result.data?.error as string) || 'Remediation failed');
					}
				};
			}}
		>
			<input type="hidden" name="discrepancy_id" value={remediateDiscrepancyId} />
			<div class="space-y-4 py-4">
				<div>
					<label for="remediate-action" class="text-sm font-medium">Action</label>
					<select
						id="remediate-action"
						name="action"
						bind:value={remediateAction}
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					>
						{#each actionOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="remediate-direction" class="text-sm font-medium">Direction</label>
					<select
						id="remediate-direction"
						name="direction"
						bind:value={remediateDirection}
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					>
						{#each directionOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>
			</div>
			<Dialog.Footer>
				<Button
					variant="outline"
					onclick={() => {
						showRemediateDialog = false;
					}}>Cancel</Button
				>
				<Button type="submit">Remediate</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Bulk remediate dialog -->
<Dialog.Root bind:open={showBulkDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Bulk Remediate</Dialog.Title>
			<Dialog.Description>
				Apply the same remediation to {selectedIds.length} selected discrepancies.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/bulk_remediate"
			use:formEnhance={() => {
				return async ({ result }) => {
					if (result.type === 'success') {
						const bulkResult = (result.data as Record<string, unknown>)?.bulkResult as
							| { succeeded: number; failed: number }
							| undefined;
						if (bulkResult) {
							addToast(
								'success',
								`Bulk remediation complete: ${bulkResult.succeeded} succeeded, ${bulkResult.failed} failed`
							);
						} else {
							addToast('success', 'Bulk remediation complete');
						}
						showBulkDialog = false;
						selectedIds = [];
						await invalidateAll();
					} else if (result.type === 'failure') {
						addToast(
							'error',
							(result.data?.error as string) || 'Bulk remediation failed'
						);
					}
				};
			}}
		>
			<input type="hidden" name="selected_ids" value={JSON.stringify(selectedIds)} />
			<div class="space-y-4 py-4">
				<div>
					<label for="bulk-action" class="text-sm font-medium">Action</label>
					<select
						id="bulk-action"
						name="action"
						bind:value={bulkAction}
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					>
						{#each actionOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="bulk-direction" class="text-sm font-medium">Direction</label>
					<select
						id="bulk-direction"
						name="direction"
						bind:value={bulkDirection}
						class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					>
						{#each directionOptions as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>
			</div>
			<Dialog.Footer>
				<Button
					variant="outline"
					onclick={() => {
						showBulkDialog = false;
					}}>Cancel</Button
				>
				<Button type="submit">Remediate {selectedIds.length} items</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
