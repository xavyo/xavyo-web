<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';

	let { data }: { data: PageData } = $props();

	let currentStatus = $state('');

	const items = $derived(data.targets.items);
	const total = $derived(data.targets.total);
	const limit = $derived(data.targets.limit);
	const offset = $derived(data.targets.offset);
	const pageCount = $derived(Math.ceil(total / limit));
	const currentPage = $derived(Math.floor(offset / limit));
	const hasFilters = $derived(currentStatus !== '');

	$effect(() => {
		const url = new URL(window.location.href);
		currentStatus = url.searchParams.get('status') ?? '';
	});

	const statusOptions: { value: string; label: string }[] = [
		{ value: '', label: 'All statuses' },
		{ value: 'active', label: 'Active' },
		{ value: 'inactive', label: 'Inactive' },
		{ value: 'unreachable', label: 'Unreachable' },
		{ value: 'error', label: 'Error' }
	];

	function statusBadgeClass(status: string): string {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'inactive':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
			case 'unreachable':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'error':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}

	function authMethodLabel(method: string): string {
		switch (method) {
			case 'bearer':
				return 'Bearer Token';
			case 'oauth2':
				return 'OAuth 2.0';
			default:
				return method;
		}
	}

	function buildUrl(overrides: { status?: string; offset?: number } = {}): string {
		const params = new URLSearchParams();
		const status = overrides.status ?? currentStatus;
		const off = overrides.offset ?? 0;
		if (status) params.set('status', status);
		params.set('limit', String(limit));
		params.set('offset', String(off));
		return `/settings/scim-targets?${params}`;
	}

	function applyStatusFilter() {
		goto(buildUrl({ offset: 0 }));
	}

	function goToPage(page: number) {
		goto(buildUrl({ offset: page * limit }));
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader title="SCIM Targets" description="Manage outbound SCIM provisioning targets" />
	<a
		href="/settings/scim-targets/create"
		class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
	>
		Create Target
	</a>
</div>

<div class="mb-4 flex gap-3">
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
			title="No targets match your filter"
			description="Try adjusting your filter criteria."
			icon="search"
		/>
		<div class="flex justify-center pb-4">
			<button
				onclick={() => {
					currentStatus = '';
					goto('/settings/scim-targets?limit=' + limit + '&offset=0');
				}}
				class="text-sm font-medium text-primary hover:underline"
			>
				Clear filters
			</button>
		</div>
	{:else}
		<EmptyState
			title="No SCIM targets yet"
			description="Create a SCIM target to provision identities to external SCIM-enabled services."
			icon="inbox"
			actionLabel="Create Target"
			actionHref="/settings/scim-targets/create"
		/>
	{/if}
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Base URL</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Auth Method</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Last Health Check</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
				</tr>
			</thead>
			<tbody>
				{#each items as target}
					<tr class="border-b transition-colors hover:bg-muted/50">
						<td class="px-4 py-3 font-medium">
							<a
								href="/settings/scim-targets/{target.id}"
								class="text-primary hover:underline"
							>
								{target.name}
							</a>
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							<span class="max-w-[200px] truncate inline-block">{target.base_url}</span>
						</td>
						<td class="px-4 py-3">
							<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
								{authMethodLabel(target.auth_method)}
							</span>
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeClass(target.status)}"
							>
								{target.status}
							</span>
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{target.last_health_check_at
								? new Date(target.last_health_check_at).toLocaleString()
								: 'Never'}
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{new Date(target.created_at).toLocaleDateString()}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if pageCount > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {offset + 1}&ndash;{Math.min(offset + limit, total)} of {total} targets
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
