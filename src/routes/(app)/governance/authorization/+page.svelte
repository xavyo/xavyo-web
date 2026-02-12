<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';

	let { data }: { data: PageData } = $props();

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
		return `/governance/authorization?${params}`;
	}

	function goToPage(page: number) {
		goto(buildUrl({ offset: page * limit }));
	}

	function effectBadgeColor(effect: string): string {
		switch (effect) {
			case 'allow':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'deny':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}

	function statusBadgeColor(status: string): string {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'inactive':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader
		title="Authorization Policies"
		description="Manage authorization policies for your organization"
	/>
	<a
		href="/governance/authorization/create"
		class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
	>
		Create Policy
	</a>
</div>

<!-- Navigation Tabs -->
<div class="mb-4 flex gap-1 border-b">
	<a
		href="/governance/authorization"
		class="border-b-2 border-primary px-4 py-2 text-sm font-medium text-primary"
	>
		Policies
	</a>
	<a
		href="/governance/authorization/mappings"
		class="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
	>
		Mappings
	</a>
	<a
		href="/governance/authorization/test"
		class="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground"
	>
		Test
	</a>
</div>

{#if data.policies.length === 0}
	<EmptyState
		title="No policies yet"
		description="Create authorization policies to control access to resources."
		icon="🛡️"
	/>
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Effect</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Priority</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Resource Type</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Action</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
				</tr>
			</thead>
			<tbody>
				{#each data.policies as policy}
					<tr
						class="cursor-pointer border-b transition-colors hover:bg-muted/50"
						onclick={() => goto(`/governance/authorization/${policy.id}`)}
					>
						<td class="px-4 py-3 font-medium">
							<a
								href="/governance/authorization/{policy.id}"
								class="text-primary hover:underline"
							>
								{policy.name}
							</a>
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {effectBadgeColor(policy.effect)}"
							>
								{policy.effect}
							</span>
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {statusBadgeColor(policy.status)}"
							>
								{policy.status}
							</span>
						</td>
						<td class="px-4 py-3 text-muted-foreground">{policy.priority}</td>
						<td class="px-4 py-3 text-muted-foreground">
							{policy.resource_type ?? '—'}
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{policy.action ?? '—'}
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{new Date(policy.created_at).toLocaleDateString()}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if pageCount > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {currentOffset + 1}&ndash;{Math.min(currentOffset + limit, total)} of {total} policies
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
