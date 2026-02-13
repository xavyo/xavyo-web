<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import type { PageData } from './$types';
	import { Plus, Settings } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	// Derived values from server data
	const configs = $derived(data.configs);
	const filters = $derived(data.filters);
	const limit = $derived(configs.limit);
	const offset = $derived(configs.offset);
	const total = $derived(configs.total);
	const currentPage = $derived(Math.floor(offset / limit) + 1);
	const totalPages = $derived(Math.ceil(total / limit));

	// Filter state — initialized from server filters
	let objectTypeFilter = $state(data.filters.object_type ?? '');
	let isActiveFilter = $state(
		data.filters.is_active === true ? 'true' : data.filters.is_active === false ? 'false' : ''
	);

	function applyFilters() {
		const params = new URLSearchParams();
		if (objectTypeFilter) params.set('object_type', objectTypeFilter);
		if (isActiveFilter) params.set('is_active', isActiveFilter);
		goto(`/governance/lifecycle${params.toString() ? `?${params.toString()}` : ''}`);
	}

	function goToPage(page: number) {
		const params = new URLSearchParams();
		if (objectTypeFilter) params.set('object_type', objectTypeFilter);
		if (isActiveFilter) params.set('is_active', isActiveFilter);
		const newOffset = (page - 1) * limit;
		params.set('offset', String(newOffset));
		params.set('limit', String(limit));
		goto(`/governance/lifecycle?${params.toString()}`);
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatObjectType(type: string): string {
		return type.charAt(0).toUpperCase() + type.slice(1);
	}
</script>

<div class="flex items-start justify-between">
	<PageHeader
		title="Lifecycle Configurations"
		description="Manage lifecycle state machines for identity objects"
	/>
	<a href="/governance/lifecycle/create">
		<Button size="sm">
			<Plus class="mr-2 h-4 w-4" />
			Create Config
		</Button>
	</a>
</div>

<!-- Filters -->
<div class="mb-6 flex flex-wrap items-end gap-4">
	<div>
		<label for="object-type-filter" class="block text-sm font-medium text-muted-foreground"
			>Object Type</label
		>
		<select
			id="object-type-filter"
			class="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
			bind:value={objectTypeFilter}
			onchange={applyFilters}
		>
			<option value="">All</option>
			<option value="user">User</option>
			<option value="role">Role</option>
			<option value="entitlement">Entitlement</option>
		</select>
	</div>
	<div>
		<label for="is-active-filter" class="block text-sm font-medium text-muted-foreground"
			>Status</label
		>
		<select
			id="is-active-filter"
			class="mt-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
			bind:value={isActiveFilter}
			onchange={applyFilters}
		>
			<option value="">All</option>
			<option value="true">Active</option>
			<option value="false">Inactive</option>
		</select>
	</div>
</div>

<!-- Content -->
{#if configs.items.length === 0}
	<EmptyState
		title="No lifecycle configurations"
		description="Create your first lifecycle configuration to define state machines for identity objects."
		actionLabel="Create Config"
		actionHref="/governance/lifecycle/create"
	/>
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium">Name</th>
					<th class="px-4 py-3 text-left font-medium">Object Type</th>
					<th class="px-4 py-3 text-left font-medium">Status</th>
					<th class="px-4 py-3 text-left font-medium">Created</th>
				</tr>
			</thead>
			<tbody>
				{#each configs.items as config (config.id)}
					<tr
						class="cursor-pointer border-b transition-colors hover:bg-muted/50"
						onclick={() => goto(`/governance/lifecycle/${config.id}`)}
					>
						<td class="px-4 py-3 font-medium">
							<a
								href="/governance/lifecycle/{config.id}"
								class="text-primary hover:underline"
							>
								{config.name}
							</a>
						</td>
						<td class="px-4 py-3">
							<Badge variant="outline">{formatObjectType(config.object_type)}</Badge>
						</td>
						<td class="px-4 py-3">
							{#if config.is_active}
								<Badge variant="default">Active</Badge>
							{:else}
								<Badge variant="secondary">Inactive</Badge>
							{/if}
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{formatDate(config.created_at)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} configurations
			</p>
			<div class="flex gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={currentPage <= 1}
					onclick={() => goToPage(currentPage - 1)}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={currentPage >= totalPages}
					onclick={() => goToPage(currentPage + 1)}
				>
					Next
				</Button>
			</div>
		</div>
	{/if}
{/if}
