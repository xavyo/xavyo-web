<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/layout/page-header.svelte';
	import { Button } from '$lib/components/ui/button';
	import { EmptyState } from '$lib/components/ui/empty-state';
	import type { A2aTaskState } from '$lib/api/types';

	let { data }: { data: PageData } = $props();

	let currentState = $state(data.state ?? '');
	let currentOffset = $state(data.offset);
	const limit = $derived(data.limit);
	const total = $derived(data.total);
	const pageCount = $derived(Math.ceil(total / limit));
	const currentPage = $derived(Math.floor(currentOffset / limit));
	const hasFilters = $derived(currentState !== '');

	const stateOptions: { value: string; label: string }[] = [
		{ value: '', label: 'All states' },
		{ value: 'pending', label: 'Pending' },
		{ value: 'running', label: 'Running' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'failed', label: 'Failed' },
		{ value: 'cancelled', label: 'Cancelled' }
	];

	function stateColor(state: string): string {
		switch (state) {
			case 'pending':
				return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
			case 'running':
				return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
			case 'completed':
				return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
			case 'failed':
				return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
			case 'cancelled':
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
			default:
				return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
		}
	}

	function truncateUuid(id: string | null): string {
		if (!id) return '\u2014';
		return id.length > 8 ? id.substring(0, 8) + '\u2026' : id;
	}

	function applyFilter() {
		const params = new URLSearchParams();
		if (currentState) params.set('state', currentState);
		params.set('limit', String(limit));
		params.set('offset', '0');
		goto(`/nhi/a2a?${params}`);
	}

	function goToPage(page: number) {
		const params = new URLSearchParams();
		if (currentState) params.set('state', currentState);
		params.set('limit', String(limit));
		params.set('offset', String(page * limit));
		goto(`/nhi/a2a?${params}`);
	}
</script>

<div class="flex items-center justify-between">
	<PageHeader title="A2A Tasks" description="View and manage agent-to-agent task delegations" />
	<a
		href="/nhi/a2a/create"
		class="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90"
	>
		Create Task
	</a>
</div>

<div class="mb-4 flex gap-3">
	<select
		class="rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
		bind:value={currentState}
		onchange={applyFilter}
	>
		{#each stateOptions as opt}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>
</div>

{#if data.tasks.length === 0}
	{#if hasFilters}
		<EmptyState
			title="No tasks match your filter"
			description="Try adjusting your filter criteria."
			icon="search"
		/>
		<div class="flex justify-center pb-4">
			<button
				onclick={() => {
					currentState = '';
					applyFilter();
				}}
				class="text-sm font-medium text-primary hover:underline"
			>
				Clear filters
			</button>
		</div>
	{:else}
		<EmptyState
			title="No A2A tasks yet"
			description="Create your first agent-to-agent task."
			icon="inbox"
		/>
	{/if}
{:else}
	<div class="rounded-md border">
		<table class="w-full text-sm">
			<thead>
				<tr class="border-b bg-muted/50">
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Task Type</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Source Agent</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Target Agent</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">State</th>
					<th class="px-4 py-3 text-left font-medium text-muted-foreground">Created</th>
				</tr>
			</thead>
			<tbody>
				{#each data.tasks as task}
					<tr class="border-b transition-colors hover:bg-muted/50">
						<td class="px-4 py-3">
							<a href="/nhi/a2a/{task.id}" class="font-medium text-primary hover:underline">
								{task.task_type}
							</a>
						</td>
						<td class="px-4 py-3 font-mono text-xs text-muted-foreground">
							{truncateUuid(task.source_agent_id)}
						</td>
						<td class="px-4 py-3 font-mono text-xs text-muted-foreground">
							{truncateUuid(task.target_agent_id)}
						</td>
						<td class="px-4 py-3">
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {stateColor(task.state)}"
							>
								{task.state}
							</span>
						</td>
						<td class="px-4 py-3 text-muted-foreground">
							{new Date(task.created_at).toLocaleDateString()}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>

	{#if pageCount > 1}
		<div class="mt-4 flex items-center justify-between">
			<p class="text-sm text-muted-foreground">
				Showing {currentOffset + 1}–{Math.min(currentOffset + limit, total)} of {total} tasks
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
