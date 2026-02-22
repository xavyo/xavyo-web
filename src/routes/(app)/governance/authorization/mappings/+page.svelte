<script lang="ts">
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import { enhance } from '$app/forms';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import { addToast } from '$lib/stores/toast.svelte';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';

	let { data }: { data: PageData } = $props();

	// svelte-ignore state_referenced_locally
	let currentOffset = $state(data.offset);
	const limit = $derived(data.limit);
	const total = $derived(data.total);
	const pageCount = $derived(Math.ceil(total / limit));
	const currentPage = $derived(Math.floor(currentOffset / limit));

	function buildUrl(overrides: { offset?: number } = {}): string {
		const params = new URLSearchParams();
		const off = overrides.offset ?? 0;
		params.set('limit', String(limit));
		params.set('offset', String(off));
		return `/governance/authorization/mappings?${params}`;
	}

	function goToPage(page: number) {
		goto(buildUrl({ offset: page * limit }));
	}

	function truncateId(id: string): string {
		if (id.length <= 12) return id;
		return id.slice(0, 8) + '...';
	}
	let showDeleteConfirm = $state(false);
	let deleteMappingId: string | null = $state(null);
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Entitlement-Action Mappings"
		description="Map entitlements to actions and resource types for authorization"
	/>
	<a
		href="/governance/authorization/mappings/create"
		class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
	>
		Create Mapping
	</a>
</div>

<div class="mb-6 flex gap-4 border-b">
	<a
		href="/governance/authorization"
		class="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
		>Policies</a
	>
	<a
		href="/governance/authorization/mappings"
		class="border-b-2 border-primary px-3 py-2 text-sm font-medium text-foreground">Mappings</a
	>
	<a
		href="/governance/authorization/test"
		class="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
		>Test</a
	>
	<a
		href="/governance/authorization/explain"
		class="border-b-2 border-transparent px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
		>Explain NHI</a
	>
</div>

{#if data.mappings.length === 0}
	<EmptyState
		title="No mappings yet"
		description="Create entitlement-to-action mappings to define what actions entitlements grant."
		icon="🔑"
	/>
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground"
						>Entitlement ID</th
					>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground"
						>Resource Type</th
					>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.mappings as mapping}
					<tr class="border-b transition-colors hover:bg-muted/50">
						<td class="px-4 py-3 font-mono text-xs" title={mapping.entitlement_id}>
							{truncateId(mapping.entitlement_id)}
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200"
							>
								{mapping.resource_type}
							</span>
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800 dark:bg-purple-900 dark:text-purple-200"
							>
								{mapping.action}
							</span>
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{new Date(mapping.created_at).toLocaleDateString()}
						</td>
						<td class="px-4 py-3">
							<form
								id="mapping-delete-form-{mapping.id}"
								method="POST"
								action="?/delete"
								use:enhance={() => {
									return async ({ result }) => {
										if (result.type === 'success') {
											const resultData = result.data as
												| { success: boolean; error?: string }
												| undefined;
											if (resultData?.success) {
												addToast('success', 'Mapping deleted successfully');
												await invalidateAll();
											} else {
												addToast(
													'error',
													resultData?.error ?? 'Failed to delete mapping'
												);
											}
										} else {
											addToast('error', 'Failed to delete mapping');
										}
									};
								}}
							>
								<input type="hidden" name="id" value={mapping.id} />
								<Button variant="outline" size="sm" type="button" onclick={() => { deleteMappingId = mapping.id; showDeleteConfirm = true; }}>Delete</Button>
							</form>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if pageCount > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {currentOffset + 1}&ndash;{Math.min(currentOffset + limit, total)} of {total}
				mappings
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

<ConfirmDialog
	bind:open={showDeleteConfirm}
	title="Delete mapping"
	description="Are you sure you want to delete this mapping?"
	confirmLabel="Delete"
	variant="destructive"
	onconfirm={() => {
		if (deleteMappingId) {
			const form = document.getElementById('mapping-delete-form-' + deleteMappingId);
			if (form instanceof HTMLFormElement) form.requestSubmit();
		}
	}}
/>
