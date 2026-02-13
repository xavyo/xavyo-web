<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';

	let { data }: { data: PageData } = $props();

	let searchName = $state('');
	let currentType = $state('');
	let currentStatus = $state('');
	let debounceTimer: ReturnType<typeof setTimeout> | undefined;

	const items = $derived(data.connectors.items);
	const total = $derived(data.connectors.total);
	const limit = $derived(data.connectors.limit);
	const offset = $derived(data.connectors.offset);
	const pageCount = $derived(Math.ceil(total / limit));
	const currentPage = $derived(Math.floor(offset / limit));
	const hasFilters = $derived(searchName !== '' || currentType !== '' || currentStatus !== '');

	// Sync search inputs from URL params on initial load
	$effect(() => {
		const url = new URL(window.location.href);
		searchName = url.searchParams.get('name_contains') ?? '';
		currentType = url.searchParams.get('connector_type') ?? '';
		currentStatus = url.searchParams.get('status') ?? '';
	});

	const typeOptions: { value: string; label: string }[] = [
		{ value: '', label: 'All types' },
		{ value: 'ldap', label: 'LDAP' },
		{ value: 'database', label: 'Database' },
		{ value: 'rest', label: 'REST API' }
	];

	const statusOptions: { value: string; label: string }[] = [
		{ value: '', label: 'All statuses' },
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' },
		{ value: 'error', label: 'Error' }
	];

	function typeBadgeClass(type: string): string {
		switch (type) {
			case 'ldap':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'database':
				return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
			case 'rest':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}

	function typeLabel(type: string): string {
		switch (type) {
			case 'ldap':
				return 'LDAP';
			case 'database':
				return 'Database';
			case 'rest':
				return 'REST API';
			default:
				return type;
		}
	}

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'inactive':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
			case 'error':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}

	function statusLabel(status: string): string {
		return status.charAt(0).toUpperCase() + status.slice(1);
	}

	function healthDotClass(status: string | undefined): string {
		switch (status) {
			case 'healthy':
				return 'bg-green-500';
			case 'degraded':
				return 'bg-yellow-500';
			case 'unhealthy':
				return 'bg-red-500';
			default:
				return 'bg-gray-400';
		}
	}

	function buildUrl(overrides: { name_contains?: string; connector_type?: string; status?: string; offset?: number } = {}): string {
		const params = new URLSearchParams();
		const name = overrides.name_contains ?? searchName;
		const type = overrides.connector_type ?? currentType;
		const status = overrides.status ?? currentStatus;
		const off = overrides.offset ?? 0;
		if (name) params.set('name_contains', name);
		if (type) params.set('connector_type', type);
		if (status) params.set('status', status);
		params.set('limit', String(limit));
		params.set('offset', String(off));
		return `/connectors?${params}`;
	}

	function applyTypeFilter() {
		goto(buildUrl({ offset: 0 }));
	}

	function applyStatusFilter() {
		goto(buildUrl({ offset: 0 }));
	}

	function onNameInput() {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(() => {
			goto(buildUrl({ offset: 0 }));
		}, 300);
	}

	function goToPage(page: number) {
		goto(buildUrl({ offset: page * limit }));
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader title="Connectors" description="Manage identity connectors for your organization" />
	<a
		href="/connectors/create"
		class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
	>
		Create Connector
	</a>
</div>

<div class="mb-4 flex gap-3">
	<input
		type="text"
		placeholder="Search by name..."
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={searchName}
		oninput={onNameInput}
	/>
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={currentType}
		onchange={applyTypeFilter}
	>
		{#each typeOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={currentStatus}
		onchange={applyStatusFilter}
	>
		{#each statusOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>

{#if items.length === 0}
	{#if hasFilters}
		<EmptyState
			title="No connectors match your filter"
			description="Try adjusting your filter criteria."
			icon="search"
		/>
		<div class="flex justify-center pb-4">
			<button
				onclick={() => {
					searchName = '';
					currentType = '';
					currentStatus = '';
					goto('/connectors?limit=' + limit + '&offset=0');
				}}
				class="text-sm font-medium text-primary hover:underline"
			>
				Clear filters
			</button>
		</div>
	{:else}
		<EmptyState
			title="No connectors yet"
			description="Create a connector to integrate with external identity sources."
			icon="inbox"
			actionLabel="Create Connector"
			actionHref="/connectors/create"
		/>
	{/if}
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Health</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
				</tr>
			</thead>
			<tbody>
				{#each items as connector}
					<tr class="border-b transition-colors hover:bg-muted/50">
						<td class="px-4 py-3 font-medium">
							<a
								href="/connectors/{connector.id}"
								class="text-primary hover:underline"
							>
								{connector.name}
							</a>
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {typeBadgeClass(connector.connector_type)}"
							>
								{typeLabel(connector.connector_type)}
							</span>
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeClass(connector.status)}"
							>
								{statusLabel(connector.status)}
							</span>
						</td>
						<td class="px-4 py-3">
							<span class="inline-flex items-center gap-1.5">
								<span class="inline-block h-2 w-2 rounded-full {healthDotClass(undefined)}"></span>
								<span class="text-muted-foreground">&mdash;</span>
							</span>
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{new Date(connector.created_at).toLocaleDateString()}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if pageCount > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {offset + 1}&ndash;{Math.min(offset + limit, total)} of {total} connectors
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
