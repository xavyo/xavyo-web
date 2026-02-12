<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { enhance as formEnhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { addToast } from '$lib/stores/toast.svelte';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import * as Dialog from '$lib/components/ui/dialog';
	import OperationStatusBadge from '$lib/components/operations/operation-status-badge.svelte';
	import OperationTypeBadge from '$lib/components/operations/operation-type-badge.svelte';

	let { data }: { data: PageData } = $props();

	let connectorFilter = $state('');
	let showResolveDialog = $state(false);
	let resolveOperationId = $state('');
	let resolutionNotes = $state('');

	const operations = $derived(data.dlq.operations);
	const limit = $derived(data.dlq.limit);
	const offset = $derived(data.dlq.offset);

	$effect(() => {
		const url = new URL(window.location.href);
		connectorFilter = url.searchParams.get('connector_id') ?? '';
	});

	function buildUrl(overrides: Record<string, string | number | undefined> = {}): string {
		const params = new URLSearchParams();
		const cid = (overrides.connector_id as string) ?? connectorFilter;
		const off = overrides.offset ?? 0;
		if (cid) params.set('connector_id', cid);
		params.set('limit', String(limit));
		params.set('offset', String(off));
		return `/connectors/operations/dlq?${params}`;
	}

	function applyFilter() {
		goto(buildUrl({ offset: 0 }));
	}

	function openResolveDialog(operationId: string) {
		resolveOperationId = operationId;
		resolutionNotes = '';
		showResolveDialog = true;
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader title="Dead Letter Queue" description="Operations that exceeded maximum retries" />
	<a
		href="/connectors/operations"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Operations
	</a>
</div>

<div class="mb-4 flex gap-3">
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={connectorFilter}
		onchange={applyFilter}
	>
		<option value="">All connectors</option>
		{#each data.connectors as connector}
			<option value={connector.id}>{connector.name}</option>
		{/each}
	</select>
</div>

{#if operations.length === 0}
	<EmptyState
		title="No dead-letter operations"
		description="No operations have exceeded their maximum retries. The queue is healthy."
		icon="inbox"
	/>
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Connector</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Object Class</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Error</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Retries</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each operations as operation}
					<tr class="border-b transition-colors hover:bg-muted/50">
						<td class="px-4 py-3">
							<OperationTypeBadge type={operation.operation_type} />
						</td>
						<td class="px-4 py-3 text-muted-foreground">{operation.connector_name}</td>
						<td class="px-4 py-3">
							<a href="/connectors/operations/{operation.id}" class="text-primary hover:underline">
								{operation.object_class}
							</a>
						</td>
						<td class="px-4 py-3 max-w-xs truncate text-destructive" title={operation.error_message ?? ''}>
							{operation.error_message ?? '—'}
						</td>
						<td class="px-4 py-3 text-muted-foreground">{operation.retry_count}/{operation.max_retries}</td>
						<td class="px-4 py-3 text-muted-foreground">{formatDate(operation.created_at)}</td>
						<td class="px-4 py-3">
							<div class="flex gap-2">
								<form method="POST" action="?/retry" use:formEnhance={() => {
									return async ({ result }) => {
										if (result.type === 'success') {
											addToast('success', 'Operation retried');
											await invalidateAll();
										} else if (result.type === 'failure') {
											addToast('error', (result.data?.error as string) || 'Retry failed');
										}
									};
								}}>
									<input type="hidden" name="operation_id" value={operation.id} />
									<Button type="submit" variant="outline" size="sm">Retry</Button>
								</form>
								<Button variant="outline" size="sm" onclick={() => openResolveDialog(operation.id)}>Resolve</Button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
{/if}

<Dialog.Root bind:open={showResolveDialog}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Resolve Operation</Dialog.Title>
			<Dialog.Description>
				Mark this dead-letter operation as resolved with optional notes.
			</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/resolve" use:formEnhance={() => {
			return async ({ result }) => {
				if (result.type === 'success') {
					addToast('success', 'Operation resolved');
					showResolveDialog = false;
					resolutionNotes = '';
					await invalidateAll();
				} else if (result.type === 'failure') {
					addToast('error', (result.data?.error as string) || 'Failed to resolve');
				}
			};
		}}>
			<input type="hidden" name="operation_id" value={resolveOperationId} />
			<div class="py-4">
				<label for="resolution_notes" class="text-sm font-medium">Resolution Notes</label>
				<textarea
					id="resolution_notes"
					name="resolution_notes"
					bind:value={resolutionNotes}
					rows={3}
					class="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
					placeholder="Describe how this operation was resolved..."
				></textarea>
			</div>
			<Dialog.Footer>
				<Button variant="outline" onclick={() => { showResolveDialog = false; }}>Cancel</Button>
				<Button type="submit">Resolve</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
