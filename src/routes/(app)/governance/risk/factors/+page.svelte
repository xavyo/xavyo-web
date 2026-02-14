<script lang="ts">
	import { invalidateAll, goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import EmptyState from '$lib/components/ui/empty-state/empty-state.svelte';
	import { addToast } from '$lib/stores/toast.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let categoryFilter = $state(data.filters.category ?? '');
	let enabledFilter = $state(
		data.filters.is_enabled !== undefined ? String(data.filters.is_enabled) : ''
	);
	let deleteOpen = $state(false);
	let deleteFactorId = $state('');
	let deleteFactorName = $state('');

	function applyFilters() {
		const params = new URLSearchParams();
		if (categoryFilter) params.set('category', categoryFilter);
		if (enabledFilter) params.set('is_enabled', enabledFilter);
		const qs = params.toString();
		goto(`/governance/risk/factors${qs ? `?${qs}` : ''}`, { replaceState: true });
	}

	function openDeleteDialog(id: string, name: string) {
		deleteFactorId = id;
		deleteFactorName = name;
		deleteOpen = true;
	}

	function handleResult(result: any) {
		if (result.type === 'success' && result.data?.success) {
			addToast('success', `Factor ${result.data.action} successfully`);
			invalidateAll();
		} else if (result.type === 'failure') {
			addToast('error', result.data?.error ?? 'Action failed');
		}
	}
</script>

<PageHeader title="Risk Factors" description="Manage risk scoring factors">
	<div class="flex gap-2">
		<a href="/governance/risk">
			<Button variant="outline">Back to Risk Dashboard</Button>
		</a>
		<a href="/governance/risk/factors/create">
			<Button>Create Factor</Button>
		</a>
	</div>
</PageHeader>

<!-- Filters -->
<div class="mb-4 flex flex-wrap items-center gap-3">
	<select
		class="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
		bind:value={categoryFilter}
		onchange={applyFilters}
	>
		<option value="">All Categories</option>
		<option value="static">Static</option>
		<option value="dynamic">Dynamic</option>
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
</div>

{#if data.factors.items.length === 0}
	<EmptyState
		title="No risk factors"
		description="No risk factors match the current filters. Create a new factor to get started."
	/>
{:else}
	<div class="overflow-x-auto rounded-lg border border-border">
		<table class="w-full text-sm">
			<thead class="border-b border-border bg-muted/50">
				<tr>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Factor Type</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Weight</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
					<th class="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
				</tr>
			</thead>
			<tbody>
				{#each data.factors.items as factor}
					<tr class="border-b border-border hover:bg-muted/30">
						<td class="px-4 py-3">
							<a
								href="/governance/risk/factors/{factor.id}"
								class="font-medium text-primary hover:underline"
							>
								{factor.name}
							</a>
							{#if factor.description}
								<p class="text-xs text-muted-foreground">{factor.description}</p>
							{/if}
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {factor.category ===
								'static'
									? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
									: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'}"
							>
								{factor.category}
							</span>
						</td>
						<td class="px-4 py-3 text-foreground">{factor.factor_type}</td>
						<td class="px-4 py-3 text-foreground">{factor.weight}</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {factor.is_enabled
									? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
									: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'}"
							>
								{factor.is_enabled ? 'Enabled' : 'Disabled'}
							</span>
						</td>
						<td class="px-4 py-3 text-right">
							<div class="flex items-center justify-end gap-1">
								{#if factor.is_enabled}
									<form
										method="POST"
										action="?/disable"
										use:enhance={() => ({ result }) => handleResult(result)}
									>
										<input type="hidden" name="id" value={factor.id} />
										<Button variant="outline" size="sm" type="submit">Disable</Button>
									</form>
								{:else}
									<form
										method="POST"
										action="?/enable"
										use:enhance={() => ({ result }) => handleResult(result)}
									>
										<input type="hidden" name="id" value={factor.id} />
										<Button variant="outline" size="sm" type="submit">Enable</Button>
									</form>
								{/if}
								<Button
									variant="destructive"
									size="sm"
									onclick={() => openDeleteDialog(factor.id, factor.name)}
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
{/if}

<!-- Delete Dialog -->
<Dialog.Root bind:open={deleteOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Risk Factor</Dialog.Title>
			<Dialog.Description>Delete "{deleteFactorName}"? This cannot be undone.</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/delete"
			use:enhance={() => {
				deleteOpen = false;
				return ({ result }) => handleResult(result);
			}}
		>
			<input type="hidden" name="id" value={deleteFactorId} />
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (deleteOpen = false)}>
					Cancel
				</Button>
				<Button variant="destructive" type="submit">Delete</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
