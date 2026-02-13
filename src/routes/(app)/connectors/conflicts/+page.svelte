<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { EmptyState } from '$lib/components/ui/empty-state';

	let { data }: { data: PageData } = $props();

	let typeFilter = $state('');
	let pendingOnly = $state(false);

	const conflicts = $derived(data.conflicts.conflicts);
	const total = $derived(data.conflicts.total);
	const limit = $derived(data.conflicts.limit);
	const offset = $derived(data.conflicts.offset);
	const pageCount = $derived(Math.ceil(total / limit));
	const currentPage = $derived(Math.floor(offset / limit));
	const hasFilters = $derived(typeFilter !== '' || pendingOnly);

	$effect(() => {
		const url = new URL(window.location.href);
		typeFilter = url.searchParams.get('conflict_type') ?? '';
		pendingOnly = url.searchParams.get('pending_only') === 'true';
	});

	function buildUrl(overrides: Record<string, string | number | boolean | undefined> = {}): string {
		const params = new URLSearchParams();
		const ct = (overrides.conflict_type as string) ?? typeFilter;
		const po = overrides.pending_only ?? pendingOnly;
		const off = overrides.offset ?? 0;
		if (ct) params.set('conflict_type', ct);
		if (po) params.set('pending_only', 'true');
		params.set('limit', String(limit));
		params.set('offset', String(off));
		return `/connectors/conflicts?${params}`;
	}

	function applyFilter() {
		goto(buildUrl({ offset: 0 }));
	}

	function goToPage(page: number) {
		goto(buildUrl({ offset: page * limit }));
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleString();
	}

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'pending':
				return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800';
			case 'resolved':
				return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800';
			default:
				return '';
		}
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader title="Provisioning Conflicts" description="Review and resolve attribute conflicts between provisioning operations" />
	<a
		href="/connectors/operations"
		class="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
	>
		Back to Operations
	</a>
</div>

<div class="mb-4 flex flex-wrap items-center gap-3">
	<input
		type="text"
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		placeholder="Filter by conflict type..."
		bind:value={typeFilter}
		onchange={applyFilter}
	/>
	<label class="flex items-center gap-2 text-sm">
		<input
			type="checkbox"
			class="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
			bind:checked={pendingOnly}
			onchange={applyFilter}
		/>
		Pending only
	</label>
</div>

{#if conflicts.length === 0}
	{#if hasFilters}
		<EmptyState
			title="No conflicts match your filters"
			description="Try adjusting your filter criteria."
			icon="search"
		/>
		<div class="flex justify-center pb-4">
			<button
				onclick={() => {
					typeFilter = '';
					pendingOnly = false;
					goto('/connectors/conflicts?limit=' + limit + '&offset=0');
				}}
				class="text-sm font-medium text-primary hover:underline"
			>
				Clear filters
			</button>
		</div>
	{:else}
		<EmptyState
			title="No provisioning conflicts"
			description="No conflicts have been detected between provisioning operations."
			icon="inbox"
		/>
	{/if}
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Affected Attributes</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
				</tr>
			</thead>
			<tbody>
				{#each conflicts as conflict}
					<tr class="border-b transition-colors hover:bg-muted/50">
						<td class="px-4 py-3">
							<a href="/connectors/conflicts/{conflict.id}" class="text-primary hover:underline">
								{conflict.conflict_type}
							</a>
						</td>
						<td class="px-4 py-3">
							<div class="flex flex-wrap gap-1">
								{#each conflict.affected_attributes as attr}
									<Badge variant="outline">{attr}</Badge>
								{/each}
							</div>
						</td>
						<td class="px-4 py-3">
							<Badge class={statusBadgeClass(conflict.status)}>{conflict.status}</Badge>
						</td>
						<td class="px-4 py-3 text-muted-foreground">{formatDate(conflict.created_at)}</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if pageCount > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {offset + 1}&ndash;{Math.min(offset + limit, total)} of {total} conflicts
			</p>
			<div class="flex gap-2">
				<Button variant="outline" size="sm" disabled={currentPage === 0} onclick={() => goToPage(currentPage - 1)}>
					Previous
				</Button>
				<Button variant="outline" size="sm" disabled={currentPage >= pageCount - 1} onclick={() => goToPage(currentPage + 1)}>
					Next
				</Button>
			</div>
		</div>
	{/if}
{/if}
