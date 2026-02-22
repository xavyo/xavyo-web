<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import type { PageData } from './$types';
	import { Plus, Search } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	// Search & filter state
	// svelte-ignore state_referenced_locally
	let searchValue = $state(
		data.metaRoles.items.length > 0 ? ($page.url.searchParams.get('name') ?? '') : ''
	);
	let statusFilter = $state($page.url.searchParams.get('status') ?? '');

	// Pagination
	const limit = $derived(data.metaRoles.limit);
	const offset = $derived(data.metaRoles.offset);
	const total = $derived(data.metaRoles.total);
	const currentPage = $derived(Math.floor(offset / limit) + 1);
	const totalPages = $derived(Math.ceil(total / limit));

	function applyFilters() {
		const params = new URLSearchParams();
		if (searchValue.trim()) params.set('name', searchValue.trim());
		if (statusFilter) params.set('status', statusFilter);
		params.set('limit', String(limit));
		params.set('offset', '0');
		goto(`/governance/meta-roles?${params.toString()}`);
	}

	function goToPage(p: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('offset', String((p - 1) * limit));
		goto(`/governance/meta-roles?${params.toString()}`);
	}

	function formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function handleSearch(e: Event) {
		if ((e as KeyboardEvent).key === 'Enter') {
			applyFilters();
		}
	}
</script>

<div class="mb-6 flex items-start justify-between">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Meta-Roles</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Manage business role definitions with dynamic criteria
		</p>
	</div>
	<div class="flex gap-2">
		<a href="/governance/meta-roles/create">
			<Button size="sm">
				<Plus class="mr-2 h-4 w-4" />
				Create Meta-Role
			</Button>
		</a>
	</div>
</div>

<!-- Search & Filter Row -->
<div class="mb-4 flex items-center gap-3">
	<div class="relative flex-1">
		<Input
			type="text"
			placeholder="Search by name..."
			value={searchValue}
			oninput={(e: Event) => {
				searchValue = (e.target as HTMLInputElement).value;
			}}
			onkeydown={handleSearch}
			class="pr-10"
		/>
	</div>
	<select
		class="h-9 rounded-md border border-input bg-background px-3 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		value={statusFilter}
		onchange={(e: Event) => {
			statusFilter = (e.target as HTMLSelectElement).value;
			applyFilters();
		}}
	>
		<option value="">All Statuses</option>
		<option value="active">Active</option>
		<option value="disabled">Disabled</option>
	</select>
	<Button variant="outline" size="sm" onclick={applyFilters}>
		<Search class="mr-2 h-4 w-4" />
		Search
	</Button>
</div>

{#if data.metaRoles.items.length === 0}
	<EmptyState
		title="No meta-roles"
		description="Create your first meta-role to define dynamic business role definitions with criteria-based membership."
		actionLabel="Create Meta-Role"
		actionHref="/governance/meta-roles/create"
	/>
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium">Name</th>
					<th class="px-4 py-3 text-left font-medium">Priority</th>
					<th class="px-4 py-3 text-left font-medium">Status</th>
					<th class="px-4 py-3 text-left font-medium">Criteria Logic</th>
					<th class="px-4 py-3 text-left font-medium">Created</th>
				</tr>
			</thead>
			<tbody>
				{#each data.metaRoles.items as metaRole (metaRole.id)}
					<tr
						class="cursor-pointer border-b transition-colors hover:bg-muted/50"
						onclick={() => goto(`/governance/meta-roles/${metaRole.id}`)}
					>
						<td class="px-4 py-3 font-medium">
							<a
								href="/governance/meta-roles/{metaRole.id}"
								class="text-primary hover:underline"
							>
								{metaRole.name}
							</a>
						</td>
						<td class="px-4 py-3">
							{metaRole.priority}
						</td>
						<td class="px-4 py-3">
							<Badge variant={metaRole.status === 'active' ? 'default' : 'secondary'}>
								{metaRole.status}
							</Badge>
						</td>
						<td class="px-4 py-3">
							<Badge variant="outline">{metaRole.criteria_logic.toUpperCase()}</Badge>
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{formatDate(metaRole.created_at)}
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
				Showing {offset + 1} to {Math.min(offset + limit, total)} of {total} meta-roles
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
